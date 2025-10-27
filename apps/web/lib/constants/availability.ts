/**
 * APPOINTMENT AVAILABILITY CONSTANTS
 *
 * Define horarios de atención predefinidos para agendar citas
 */

/**
 * Horarios de negocio
 * Lunes a Viernes: 9:00 - 17:00
 * Pausa de almuerzo: 12:00 - 13:00
 */
export const BUSINESS_HOURS = {
  startHour: 9, // 9:00 AM
  endHour: 17, // 5:00 PM
  lunchStartHour: 12,
  lunchEndHour: 13,
  workdays: [1, 2, 3, 4, 5], // Monday (1) to Friday (5)
};

/**
 * Horas disponibles para agendar (sin almuerzo)
 * [9, 10, 11, 13, 14, 15, 16]
 */
export const AVAILABLE_HOURS = [9, 10, 11, 13, 14, 15, 16];

/**
 * Formato de hora para mostrar (HH:MM)
 * @param hour Número de hora (0-23)
 * @returns String formato "09:00"
 */
export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/**
 * Validar si una fecha es hábil (Lun-Vie)
 * @param date Fecha a validar
 * @returns true si es día laboral
 */
export function isWorkday(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return BUSINESS_HOURS.workdays.includes(dayOfWeek);
}

/**
 * Validar si una hora está en horario de negocio
 * @param hour Número de hora (0-23)
 * @returns true si está en horario de atención
 */
export function isBusinessHour(hour: number): boolean {
  if (hour < BUSINESS_HOURS.startHour || hour >= BUSINESS_HOURS.endHour) {
    return false;
  }
  // Excluir hora de almuerzo
  if (
    hour >= BUSINESS_HOURS.lunchStartHour &&
    hour < BUSINESS_HOURS.lunchEndHour
  ) {
    return false;
  }
  return true;
}

/**
 * Validar si una fecha/hora es válida para agendar
 * @param date Fecha y hora
 * @returns Objeto con validez y mensaje de error
 */
export function validateAppointmentDateTime(date: Date): {
  valid: boolean;
  error?: string;
} {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Validar que sea al menos mañana o más adelante
  if (date < tomorrow) {
    return {
      valid: false,
      error: "Las citas deben ser agendadas para mañana o más adelante",
    };
  }

  // Validar que sea día laboral
  if (!isWorkday(date)) {
    return {
      valid: false,
      error: "Solo ofrecemos citas de lunes a viernes",
    };
  }

  // Validar que esté en horario de negocio
  const hour = date.getHours();
  if (!isBusinessHour(hour)) {
    return {
      valid: false,
      error: `Las citas están disponibles de 9:00 a 17:00 (pausa 12:00-13:00)`,
    };
  }

  return { valid: true };
}

/**
 * Obtener rango de fechas válidas para agendar
 * @param daysAhead Cuántos días adelante mostrar en el calendario (default 30)
 * @returns { min: Date, max: Date }
 */
export function getValidDateRange(daysAhead = 30): {
  min: Date;
  max: Date;
} {
  const min = new Date();
  min.setDate(min.getDate() + 1); // Mañana o más adelante
  min.setHours(0, 0, 0, 0);

  const max = new Date(min);
  max.setDate(max.getDate() + daysAhead);

  return { min, max };
}
