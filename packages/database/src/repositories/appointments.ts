/**
 * APPOINTMENT REPOSITORY
 *
 * Abstrae todas las operaciones de base de datos relacionadas con citas
 * Gestiona la creación, actualización y consulta de citas entre clientes y agentes
 *
 * PATTERN:
 * - Centraliza lógica de citas
 * - Valida disponibilidad de horarios
 * - Maneja relaciones entre usuario, propiedad y agente
 * - Optimizado para queries frecuentes
 */

import type { AppointmentStatus, Prisma } from "@prisma/client";
import { db } from "../client";

/**
 * Appointment select con relaciones básicas
 */
export const appointmentSelect = {
  id: true,
  userId: true,
  propertyId: true,
  agentId: true,
  scheduledAt: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AppointmentSelect;

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  select: typeof appointmentSelect;
}>;

/**
 * Appointment con relaciones completas (para detalles)
 */
export const appointmentDetailSelect = {
  id: true,
  userId: true,
  propertyId: true,
  agentId: true,
  scheduledAt: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
    },
  },
  property: {
    select: {
      id: true,
      title: true,
      address: true,
      city: true,
      price: true,
      images: {
        select: {
          url: true,
          alt: true,
        },
        take: 1,
      },
    },
  },
  agent: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
    },
  },
} satisfies Prisma.AppointmentSelect;

export type AppointmentDetail = Prisma.AppointmentGetPayload<{
  select: typeof appointmentDetailSelect;
}>;

/**
 * Repository para operaciones de citas
 */
export class AppointmentRepository {
  /**
   * Crear una nueva cita
   *
   * @param data Datos de la cita (userId, propertyId, agentId, scheduledAt, notes?)
   * @throws Error si hay conflicto de horarios o datos inválidos
   */
  async createAppointment(data: {
    userId: string;
    propertyId: string;
    agentId: string;
    scheduledAt: Date;
    notes?: string;
  }) {
    return db.appointment.create({
      data: {
        userId: data.userId,
        propertyId: data.propertyId,
        agentId: data.agentId,
        scheduledAt: data.scheduledAt,
        notes: data.notes,
        status: "PENDING",
      },
      select: appointmentDetailSelect,
    });
  }

  /**
   * Obtener cita por ID con relaciones completas
   *
   * @param id ID de la cita
   */
  async getAppointmentById(id: string) {
    return db.appointment.findUnique({
      where: { id },
      select: appointmentDetailSelect,
    });
  }

  /**
   * Actualizar estado de una cita
   *
   * @param id ID de la cita
   * @param status Nuevo estado (CONFIRMED, CANCELLED, COMPLETED)
   */
  async updateAppointmentStatus(id: string, status: AppointmentStatus) {
    return db.appointment.update({
      where: { id },
      data: { status },
      select: appointmentDetailSelect,
    });
  }

  /**
   * Obtener todas las citas de un agente
   * Incluye filtros por fecha y estado
   *
   * @example
   * const appointments = await appointmentRepository.getAgentAppointments(agentId, {
   *   status: 'PENDING',
   *   startDate: new Date(),
   *   endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // próx 7 días
   * });
   */
  async getAgentAppointments(
    agentId: string,
    filters?: {
      status?: AppointmentStatus;
      startDate?: Date;
      endDate?: Date;
      skip?: number;
      take?: number;
    },
  ) {
    const whereConditions: Prisma.AppointmentWhereInput = {
      agentId,
    };

    if (filters?.status) {
      whereConditions.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filters?.startDate) {
        dateFilter.gte = filters.startDate;
      }
      if (filters?.endDate) {
        dateFilter.lte = filters.endDate;
      }
      whereConditions.scheduledAt = dateFilter;
    }

    return db.appointment.findMany({
      where: whereConditions,
      select: appointmentDetailSelect,
      orderBy: {
        scheduledAt: "asc",
      },
      skip: filters?.skip,
      take: filters?.take,
    });
  }

  /**
   * Obtener todas las citas de un usuario (cliente)
   *
   * @example
   * const appointments = await appointmentRepository.getUserAppointments(userId);
   */
  async getUserAppointments(userId: string) {
    return db.appointment.findMany({
      where: { userId },
      select: appointmentDetailSelect,
      orderBy: {
        scheduledAt: "desc",
      },
    });
  }

  /**
   * Obtener todas las citas de una propiedad
   * Útil para ver cuándo está ocupada una propiedad
   *
   * @example
   * const appointments = await appointmentRepository.getPropertyAppointments(propertyId);
   */
  async getPropertyAppointments(
    propertyId: string,
    filters?: {
      status?: AppointmentStatus[];
    },
  ) {
    return db.appointment.findMany({
      where: {
        propertyId,
        ...(filters?.status && { status: { in: filters.status } }),
      },
      select: appointmentSelect,
      orderBy: {
        scheduledAt: "asc",
      },
    });
  }

  /**
   * Obtener citas dentro de un rango de tiempo para una propiedad
   * Usado para calcular disponibilidad de horarios
   *
   * @example
   * const booked = await appointmentRepository.getAppointmentsInTimeRange(
   *   propertyId,
   *   new Date('2024-01-15T09:00:00'),
   *   new Date('2024-01-15T17:00:00')
   * );
   */
  async getAppointmentsInTimeRange(
    propertyId: string,
    startTime: Date,
    endTime: Date,
  ) {
    return db.appointment.findMany({
      where: {
        propertyId,
        scheduledAt: {
          gte: startTime,
          lte: endTime,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        id: true,
        scheduledAt: true,
      },
    });
  }

  /**
   * Verificar si un slot está disponible
   * Retorna true si no hay conflictos
   *
   * @example
   * const available = await appointmentRepository.isSlotAvailable(
   *   propertyId,
   *   new Date('2024-01-15T10:00:00')
   * );
   */
  async isSlotAvailable(propertyId: string, slotTime: Date): Promise<boolean> {
    const conflictingAppointment = await db.appointment.findFirst({
      where: {
        propertyId,
        scheduledAt: slotTime,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    return !conflictingAppointment;
  }

  /**
   * Obtener horarios disponibles para una fecha específica
   * Retorna array de horas disponibles (9:00 - 17:00)
   *
   * @example
   * const available = await appointmentRepository.getAvailableSlots(
   *   propertyId,
   *   new Date('2024-01-15')
   * );
   * // Returns: [9, 10, 11, 13, 14, 15, 16] (12 es lunch)
   */
  async getAvailableSlots(propertyId: string, date: Date): Promise<number[]> {
    // Convertir fecha a inicio del día
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Obtener todas las citas reservadas en ese día
    const bookedAppointments = await this.getAppointmentsInTimeRange(
      propertyId,
      dayStart,
      dayEnd,
    );

    // Horarios de negocio: Lun-Vie 9am-5pm, no lunch 12-1pm
    const businessHours = [9, 10, 11, 13, 14, 15, 16]; // 0-23 en formato 24h
    const bookedHours = bookedAppointments.map((apt) =>
      apt.scheduledAt.getHours(),
    );

    // Retornar horas que no están ocupadas
    return businessHours.filter((hour) => !bookedHours.includes(hour));
  }

  /**
   * Eliminar una cita (solo si está en estado PENDING o CANCELLED)
   *
   * @throws Error si la cita no se puede eliminar
   */
  async deleteAppointment(id: string) {
    return db.appointment.delete({
      where: { id },
    });
  }

  /**
   * Contar citas de un agente por estado
   * Útil para estadísticas del dashboard
   *
   * @example
   * const stats = await appointmentRepository.getAgentAppointmentStats(agentId);
   * // Returns: { PENDING: 5, CONFIRMED: 12, COMPLETED: 48, CANCELLED: 2 }
   */
  async getAgentAppointmentStats(
    agentId: string,
  ): Promise<Record<string, number>> {
    const stats = await db.appointment.groupBy({
      by: ["status"],
      where: { agentId },
      _count: true,
    });

    const result: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    stats.forEach((stat) => {
      result[stat.status] = stat._count;
    });

    return result;
  }
}
