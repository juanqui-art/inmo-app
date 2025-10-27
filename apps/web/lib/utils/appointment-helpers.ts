/**
 * APPOINTMENT HELPERS
 *
 * Utilidades para manejo de citas
 */

import { formatDate, formatTime } from "date-fns";
import { es } from "date-fns/locale";
import type { AppointmentStatus } from "@prisma/client";

/**
 * Formatar fecha de cita para mostrar al usuario
 * @example
 * formatAppointmentDate(new Date('2024-01-15T14:30:00'))
 * // Returns: "15 de enero de 2024 a las 14:30"
 */
export function formatAppointmentDate(date: Date): string {
  const dateStr = formatDate(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  const timeStr = formatTime(date, "HH:mm", { locale: es });
  return `${dateStr} a las ${timeStr}`;
}

/**
 * Formatar solo la fecha (sin hora)
 * @example
 * formatAppointmentDateOnly(new Date('2024-01-15T14:30:00'))
 * // Returns: "15 de enero de 2024"
 */
export function formatAppointmentDateOnly(date: Date): string {
  return formatDate(date, "d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Formatar solo la hora
 * @example
 * formatAppointmentTime(new Date('2024-01-15T14:30:00'))
 * // Returns: "14:30"
 */
export function formatAppointmentTime(date: Date): string {
  return formatTime(date, "HH:mm");
}

/**
 * Obtener etiqueta de estado para mostrar al usuario
 * @example
 * getStatusLabel('PENDING')
 * // Returns: { label: 'Pendiente', color: 'amber' }
 */
export function getStatusLabel(status: AppointmentStatus): {
  label: string;
  color: string;
} {
  const statusMap: Record<
    AppointmentStatus,
    { label: string; color: string }
  > = {
    PENDING: {
      label: "Pendiente de confirmación",
      color: "amber",
    },
    CONFIRMED: {
      label: "Confirmada",
      color: "green",
    },
    CANCELLED: {
      label: "Cancelada",
      color: "red",
    },
    COMPLETED: {
      label: "Completada",
      color: "blue",
    },
  };

  return statusMap[status];
}

/**
 * Validar si una cita puede ser cancelada por el usuario
 * Solo PENDING y CONFIRMED pueden cancelarse
 */
export function canCancelAppointment(status: AppointmentStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED";
}

/**
 * Validar si una cita puede ser confirmada por el agente
 * Solo PENDING puede confirmarse
 */
export function canConfirmAppointment(status: AppointmentStatus): boolean {
  return status === "PENDING";
}

/**
 * Obtener mensaje de confirmación antes de cancelar
 */
export function getCancelConfirmationMessage(
  property: string,
  date: string
): string {
  return `¿Estás seguro de que deseas cancelar la cita para ${property} el ${date}? Esta acción no se puede deshacer.`;
}

/**
 * Obtener asunto de email para confirmación de cita
 */
export function getAppointmentEmailSubject(
  type: "created" | "confirmed" | "cancelled",
  property: string
): string {
  const subjectMap = {
    created: `Nueva cita agendada - ${property}`,
    confirmed: `Cita confirmada - ${property}`,
    cancelled: `Cita cancelada - ${property}`,
  };

  return subjectMap[type];
}

/**
 * Calcular duración de una cita (en minutos)
 * Las citas son por hora
 */
export function getAppointmentDuration(): number {
  return 60; // minutos
}

/**
 * Validar si dos citas están en el mismo horario
 * Considera un margen de buffers (no pueden ser simultáneas)
 */
export function isTimeSlotConflict(
  date1: Date,
  date2: Date,
  bufferMinutes = 0
): boolean {
  const time1 = date1.getTime();
  const time2 = date2.getTime();
  const bufferMs = bufferMinutes * 60 * 1000;

  return Math.abs(time1 - time2) <= bufferMs;
}

/**
 * Obtener próxima fecha disponible desde una fecha
 * Salta weekends y horarios no disponibles
 */
export function getNextAvailableDate(from: Date): Date {
  const date = new Date(from);
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);

  // Saltar domingos (0) y sábados (6)
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

/**
 * Formatear duración entre dos fechas
 * @example
 * formatDuration(new Date('2024-01-15'), new Date('2024-01-20'))
 * // Returns: "5 días"
 */
export function formatDuration(from: Date, to: Date): string {
  const days = Math.floor(
    (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `${days} días`;
}

/**
 * Determinar si una cita está próxima (dentro de 24 horas)
 */
export function isAppointmentSoon(date: Date): boolean {
  const now = new Date();
  const hoursUntil =
    (date.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil <= 24 && hoursUntil > 0;
}

/**
 * Determinar si una cita ya pasó
 */
export function isAppointmentPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}
