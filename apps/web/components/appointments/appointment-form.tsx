"use client";

/**
 * APPOINTMENT FORM COMPONENT
 *
 * Formulario para que clientes creen una nueva cita
 * - Calendar picker para seleccionar fecha
 * - Dropdown de horarios disponibles
 * - Textarea opcional para notas
 * - Validación en tiempo real
 */

import {
  Button,
  Calendar,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@repo/ui";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState, useTransition } from "react";
import {
  createAppointmentAction,
  getAvailableSlotsAction,
} from "@/app/actions/appointments";
import {
  formatHour,
  getValidDateRange,
  isWorkday,
  validateAppointmentDateTime,
} from "@/lib/constants/availability";

interface AppointmentFormProps {
  propertyId: string;
  onSuccess?: () => void;
}

export function AppointmentForm({
  propertyId,
  onSuccess,
}: AppointmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | undefined>();
  const [notes, setNotes] = useState("");

  // Date validation
  const { min: minDate, max: maxDate } = getValidDateRange(30);
  const disabledDates = (date: Date) => {
    // Deshabilitar fechas antes de hoy
    if (isBefore(date, startOfDay(minDate))) return true;
    // Deshabilitar fechas después del rango
    if (isBefore(maxDate, startOfDay(date))) return true;
    // Deshabilitar fines de semana
    if (!isWorkday(date)) return true;
    return false;
  };

  // Cargar slots disponibles cuando cambia la fecha
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSlotsError(undefined);

    // Fetch slots disponibles
    getAvailableSlotsAction({
      propertyId,
      date: format(selectedDate, "yyyy-MM-dd"),
    }).then((result) => {
      setLoadingSlots(false);
      if (result.success && result.slots) {
        setAvailableSlots(result.slots);
      } else {
        setSlotsError(result.error || "Failed to load available times");
        setAvailableSlots([]);
      }
    });
  }, [selectedDate, propertyId]);

  // Manejo de submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDate || !selectedHour) {
      setError("Please select a date and time");
      return;
    }

    const hour = parseInt(selectedHour, 10);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hour, 0, 0, 0);

    // Validar fecha/hora una vez más
    const validation = validateAppointmentDateTime(appointmentDate);
    if (!validation.valid) {
      setError(validation.error || "Invalid date or time");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createAppointmentAction({
        propertyId,
        scheduledAt: appointmentDate.toISOString(),
        notes,
      });

      if (result.success) {
        setSuccess(true);
        if (onSuccess) {
          setTimeout(onSuccess, 1500);
        }
      } else {
        setError(result.error || "Failed to create appointment");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mensaje de éxito */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Cita agendada exitosamente. El agente te confirmará en breve.
        </div>
      )}

      {/* Mensaje de error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Date Picker */}
      <div className="space-y-2">
        <Label>Selecciona una fecha</Label>
        <div className="bg-oslo-gray-50 dark:bg-oslo-gray-900 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-800 p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDates}
            defaultMonth={minDate}
            locale={es}
          />
        </div>
        {selectedDate && (
          <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
            Fecha seleccionada:{" "}
            <span className="font-semibold">
              {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </p>
        )}
      </div>

      {/* Time Slot Selector */}
      {selectedDate && (
        <div className="space-y-2">
          <Label htmlFor="selectedHour">Selecciona una hora</Label>
          {loadingSlots ? (
            <div className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
              Cargando horarios disponibles...
            </div>
          ) : slotsError ? (
            <div className="text-sm text-red-600">{slotsError}</div>
          ) : availableSlots.length === 0 ? (
            <div className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
              No hay horarios disponibles para esta fecha. Por favor elige otra
              fecha.
            </div>
          ) : (
            <Select value={selectedHour} onValueChange={setSelectedHour}>
              <SelectTrigger id="selectedHour">
                <SelectValue placeholder="Selecciona una hora" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {formatHour(hour)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas adicionales (opcional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Ej: Interesado en ver el living y la cocina..."
          className="min-h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
        />
        <p className="text-xs text-oslo-gray-500">
          {notes.length} / 500 caracteres
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!selectedDate || !selectedHour || isPending || loadingSlots}
        className="w-full"
      >
        {isPending ? "Agendando cita..." : "Agendar cita"}
      </Button>
    </form>
  );
}
