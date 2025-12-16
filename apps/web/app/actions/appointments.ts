/**
 * SERVER ACTIONS - Appointments
 *
 * Server Actions para operaciones de citas
 * - Autenticación requerida para crear/actualizar
 * - Validación de disponibilidad y permisos
 * - Envío de emails de notificación
 * - Cache invalidation
 */

"use server";

import { getCurrentUser } from "@/lib/auth";
import { validateAppointmentDateTime } from "@/lib/constants/availability";
import { isCSRFError, validateCSRFToken } from "@/lib/csrf";
import {
    sendAppointmentCancelledEmail,
    sendAppointmentConfirmedEmail,
    sendAppointmentCreatedEmail,
} from "@/lib/email/appointment-emails";
import { enforceRateLimit, isRateLimitError } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";
import { AppointmentRepository, PropertyRepository } from "@repo/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==================== SCHEMAS ====================

const createAppointmentSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format"),
  scheduledAt: z.coerce.date().refine(
    (date) => {
      const validation = validateAppointmentDateTime(date);
      return validation.valid;
    },
    {
      message: "Invalid appointment date or time",
    },
  ),
  notes: z.string().max(500).optional(),
  // UTM Tracking (optional)
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(255).optional(),
});

const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid("Invalid appointment ID format"),
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

const getAvailableSlotsSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format"),
  date: z.coerce.date(),
});

// ==================== ACTIONS ====================

/**
 * CREATE APPOINTMENT ACTION
 * Cliente crea una nueva cita
 *
 * @param propertyId ID de la propiedad
 * @param scheduledAt Fecha y hora de la cita
 * @param notes Notas opcionales
 * @returns { success: boolean, appointmentId?: string, error?: string }
 *
 * @throws Error si usuario no está autenticado
 * @throws Error si la propiedad no existe
 * @throws Error si el horario no está disponible
 *
 * @example
 * const { success, appointmentId } = await createAppointmentAction({
 *   propertyId: 'prop-id',
 *   scheduledAt: new Date('2024-01-15T14:00:00'),
 *   notes: 'Interesado en ver el living',
 * });
 */
export async function createAppointmentAction(formData: {
  propertyId: string;
  scheduledAt: string; // ISO string from form
  notes?: string;
  // UTM params from client
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  try {
    // 1. Validar input
    const validatedData = createAppointmentSchema.parse({
      propertyId: formData.propertyId,
      scheduledAt: new Date(formData.scheduledAt),
      notes: formData.notes,
      utmSource: formData.utmSource,
      utmMedium: formData.utmMedium,
      utmCampaign: formData.utmCampaign,
    });

    // 2. Obtener usuario actual (requiere autenticación)
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required to book an appointment");
    }

    // 2.5 Rate limiting (user-based to prevent spam)
    try {
      await enforceRateLimit({ userId: user.id, tier: "appointment" });
    } catch (error) {
      if (isRateLimitError(error)) {
        logger.warn({ userId: user.id, tier: "appointment" }, "[Appointment] Rate limit exceeded");
        return { success: false, error: error.message };
      }
      throw error;
    }

    // 3. Verificar que usuario sea CLIENT (solo clientes pueden agendar citas)
    if (user.role !== "CLIENT") {
      // Logging de seguridad
      logger.warn({
        userId: user.id,
        userRole: user.role,
        requiredRole: "CLIENT",
        layer: "server-action",
      }, "[SECURITY] Role restriction - only CLIENT can book");
      throw new Error("Only clients can book appointments");
    }

    // 4. Obtener propiedad para validar que existe y obtener datos
    const propertyRepository = new PropertyRepository();
    const property = await propertyRepository.findById(
      validatedData.propertyId,
    );
    if (!property) {
      throw new Error("Property not found");
    }

    // 5. Verificar disponibilidad del horario
    const appointmentRepository = new AppointmentRepository();
    const isAvailable = await appointmentRepository.isSlotAvailable(
      validatedData.propertyId,
      validatedData.scheduledAt,
    );
    if (!isAvailable) {
      throw new Error(
        "This time slot is no longer available. Please choose another time.",
      );
    }

    // 6. Crear cita
    const appointment = await appointmentRepository.createAppointment({
      userId: user.id,
      propertyId: validatedData.propertyId,
      agentId: property.agentId,
      scheduledAt: validatedData.scheduledAt,
      notes: validatedData.notes,
    });

    // 6.5 Create or update AgentClient for CRM tracking
    try {
      const { getOrCreateAgentClient } = await import("./crm");
      await getOrCreateAgentClient(
        property.agentId,
        user.id,
        "appointment",
        validatedData.propertyId,
        {
          utmSource: validatedData.utmSource,
          utmMedium: validatedData.utmMedium,
          utmCampaign: validatedData.utmCampaign,
        }
      );
    } catch (crmError) {
      // Don't fail appointment creation if CRM integration fails
      logger.warn({ err: crmError }, "[createAppointmentAction] CRM integration failed");
    }

    // 7. Enviar emails de notificación
    const emailResult = await sendAppointmentCreatedEmail({
      clientName: user.name || "Cliente",
      clientEmail: user.email,
      agentName: property.agent.name || "Agente",
      agentEmail: property.agent.email,
      propertyTitle: property.title,
      propertyAddress: property.address || "Address not specified",
      appointmentDate: validatedData.scheduledAt,
      notes: validatedData.notes,
    });

    // Log if email failed (but don't fail the appointment creation)
    if (!emailResult.success) {
      logger.warn({
        appointmentId: appointment.id,
        error: emailResult.error,
      }, "[createAppointmentAction] Email notification failed");
    }

    // 8. Revalidar rutas
    revalidatePath("/perfil/citas");
    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard/clientes");
    revalidatePath(`/propiedades/${validatedData.propertyId}`);

    return {
      success: true,
      appointmentId: appointment.id,
      // Include warning if email failed
      warning: !emailResult.success
        ? "Appointment created but email notification failed"
        : undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const firstError = (Object.values(fieldErrors) as string[][])[0]?.[0];
      return {
        success: false,
        error: firstError || "Invalid input",
      };
    }

    if (error instanceof Error) {
      logger.error({ err: error }, "[createAppointmentAction] Failed");
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to create appointment",
    };
  }
}

/**
 * UPDATE APPOINTMENT STATUS ACTION
 * Agente confirma o cancela una cita
 * Cliente puede cancelar sus propias citas
 *
 * @param id ID de la cita
 * @param status Nuevo estado (CONFIRMED o CANCELLED)
 * @returns { success: boolean, error?: string }
 *
 * @throws Error si usuario no es el agente o cliente de la cita
 * @throws Error si cita no está en estado PENDING
 * @throws Error si cliente intenta confirmar (solo agentes pueden confirmar)
 *
 * @example
 * const { success } = await updateAppointmentStatusAction({
 *   id: 'apt-id',
 *   status: 'CONFIRMED',
 * });
 */
export async function updateAppointmentStatusAction(data: {
  id: string;
  status: "CONFIRMED" | "CANCELLED";
  csrfToken?: string | null;
}) {
  try {
    // 1. CSRF Protection (critical state-changing operation)
    if (data.csrfToken) {
      try {
        await validateCSRFToken(data.csrfToken);
      } catch (error) {
        if (isCSRFError(error)) {
          throw new Error(error.message);
        }
        throw error;
      }
    } else {
      logger.warn(
        { appointmentId: data.id, status: data.status },
        "updateAppointmentStatusAction called without CSRF token"
      );
    }

    // 2. Validar input
    const validatedData = updateAppointmentStatusSchema.parse(data);

    // 3. Obtener usuario actual
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    // 3. Obtener cita
    const appointmentRepository = new AppointmentRepository();
    const appointment = await appointmentRepository.getAppointmentById(
      validatedData.id,
    );
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // 4. Verificar autorización: usuario debe ser agente o cliente de la cita
    const isAgent = appointment.agentId === user.id;
    const isClient = appointment.userId === user.id;

    if (!isAgent && !isClient) {
      // Logging de seguridad
      logger.warn({
        userId: user.id,
        appointmentId: validatedData.id,
        appointmentAgentId: appointment.agentId,
        appointmentClientId: appointment.userId,
        layer: "server-action",
      }, "[SECURITY] Unauthorized appointment access attempt");
      throw new Error("You are not authorized to manage this appointment");
    }

    // 5. Clientes solo pueden cancelar, no confirmar
    if (isClient && !isAgent && validatedData.status === "CONFIRMED") {
      throw new Error("Only agents can confirm appointments");
    }

    // 6. Verificar que cita esté en estado PENDING (solo se puede confirmar/cancelar si está pendiente)
    if (appointment.status !== "PENDING") {
      throw new Error(
        `Cannot ${validatedData.status === "CONFIRMED" ? "confirm" : "cancel"} an appointment with status ${appointment.status}`,
      );
    }

    // 7. Actualizar estado
    await appointmentRepository.updateAppointmentStatus(
      validatedData.id,
      validatedData.status,
    );

    // 8. Enviar email de notificación
    // Determinar quién inició la cancelación
    const cancelledBy = isClient && !isAgent ? "client" : "agent";

    let emailResult;
    if (validatedData.status === "CONFIRMED") {
      emailResult = await sendAppointmentConfirmedEmail({
        clientName: appointment.user.name || "Cliente",
        clientEmail: appointment.user.email,
        agentName: appointment.agent.name || "Agente",
        agentEmail: appointment.agent.email,
        propertyTitle: appointment.property.title,
        propertyAddress:
          appointment.property.address || "Address not specified",
        appointmentDate: appointment.scheduledAt,
      });
    } else {
      emailResult = await sendAppointmentCancelledEmail(
        {
          clientName: appointment.user.name || "Cliente",
          clientEmail: appointment.user.email,
          agentName: appointment.agent.name || "Agente",
          agentEmail: appointment.agent.email,
          propertyTitle: appointment.property.title,
          propertyAddress:
            appointment.property.address || "Address not specified",
          appointmentDate: appointment.scheduledAt,
        },
        cancelledBy,
      );
    }

    // Log if email failed (but don't fail the status update)
    if (!emailResult.success) {
      logger.warn({
        appointmentId: validatedData.id,
        status: validatedData.status,
        error: emailResult.error,
      }, "[updateAppointmentStatusAction] Email notification failed");
    }

    // 8. Revalidar rutas
    revalidatePath("/dashboard/citas");
    revalidatePath("/perfil/citas");

    return {
      success: true,
      // Include warning if email failed
      warning: !emailResult.success
        ? "Status updated but email notification failed"
        : undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    if (error instanceof Error) {
      logger.error({ err: error }, "[updateAppointmentStatusAction] Failed");
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update appointment",
    };
  }
}

/**
 * GET AVAILABLE SLOTS ACTION
 * Obtener horarios disponibles para una fecha específica
 * Sin autenticación requerida (es público)
 *
 * @param propertyId ID de la propiedad
 * @param date Fecha a consultar
 * @returns { success: boolean, slots?: number[], error?: string }
 *
 * @example
 * const { slots } = await getAvailableSlotsAction({
 *   propertyId: 'prop-id',
 *   date: '2024-01-15',
 * });
 * // Returns: { success: true, slots: [9, 10, 11, 13, 14, 15, 16] }
 */
export async function getAvailableSlotsAction(data: {
  propertyId: string;
  date: string; // ISO string
}) {
  try {
    // 1. Validar input
    const validatedData = getAvailableSlotsSchema.parse({
      propertyId: data.propertyId,
      date: new Date(data.date),
    });

    // 2. Obtener slots disponibles
    const appointmentRepository = new AppointmentRepository();
    const slots = await appointmentRepository.getAvailableSlots(
      validatedData.propertyId,
      validatedData.date,
    );

    return {
      success: true,
      slots,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        slots: [],
        error: "Invalid property ID or date",
      };
    }

    logger.error({ err: error }, "[getAvailableSlotsAction] Failed");
    return {
      success: false,
      slots: [],
      error: "Failed to fetch available slots",
    };
  }
}

/**
 * GET AGENT APPOINTMENTS ACTION
 * Listar todas las citas del agente actual
 *
 * @param filters Opcionales: status, startDate, endDate
 * @returns { success: boolean, appointments?: Array, error?: string }
 *
 * @throws Error si usuario no es agente
 *
 * @example
 * const { appointments } = await getAgentAppointmentsAction({
 *   status: 'PENDING',
 * });
 */
export async function getAgentAppointmentsAction(filters?: {
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  startDate?: string; // ISO string
  endDate?: string; // ISO string
}) {
  try {
    // 1. Obtener usuario actual
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    // 2. Verificar que sea agente (solo AGENT/ADMIN pueden ver sus citas)
    if (user.role !== "AGENT" && user.role !== "ADMIN") {
      // Logging de seguridad
      logger.warn({
        userId: user.id,
        userRole: user.role,
        requiredRoles: ["AGENT", "ADMIN"],
        layer: "server-action",
      }, "[SECURITY] Role restriction - only AGENT/ADMIN");
      throw new Error("Only agents can view their appointments");
    }

    // 3. Obtener citas del agente
    const appointmentRepository = new AppointmentRepository();
    const appointments = await appointmentRepository.getAgentAppointments(
      user.id,
      {
        status: filters?.status,
        startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
      },
    );

    return {
      success: true,
      appointments,
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ err: error }, "[getAgentAppointmentsAction] Failed");
      return {
        success: false,
        appointments: [],
        error: error.message,
      };
    }

    return {
      success: false,
      appointments: [],
      error: "Failed to fetch appointments",
    };
  }
}

/**
 * GET USER APPOINTMENTS ACTION
 * Listar todas las citas del usuario actual (cliente)
 *
 * @returns { success: boolean, appointments?: Array, error?: string }
 *
 * @throws Error si usuario no está autenticado
 *
 * @example
 * const { appointments } = await getUserAppointmentsAction();
 */
export async function getUserAppointmentsAction() {
  try {
    // 1. Obtener usuario actual
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    // 2. Obtener citas del usuario
    const appointmentRepository = new AppointmentRepository();
    const appointments = await appointmentRepository.getUserAppointments(
      user.id,
    );

    return {
      success: true,
      appointments,
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ err: error }, "[getUserAppointmentsAction] Failed");
      return {
        success: false,
        appointments: [],
        error: error.message,
      };
    }

    return {
      success: false,
      appointments: [],
      error: "Failed to fetch appointments",
    };
  }
}
