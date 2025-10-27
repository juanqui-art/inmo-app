"use client";

/**
 * APPOINTMENT FORM COMPONENT
 *
 * Formulario para que clientes creen una nueva cita
 * - Calendar picker para seleccionar fecha
 * - Dropdown de horarios disponibles
 * - Textarea opcional para notas
 * - Validación en tiempo real
 * - useActionState para manejo de servidor
 */

import { useActionState, useEffect, useState } from "react";
import { createAppointmentAction, getAvailableSlotsAction } from "@/app/actions/appointments";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@repo/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatHour,
  isWorkday,
  getValidDateRange,
  validateAppointmentDateTime,
} from "@/lib/constants/availability";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface AppointmentFormProps {
  propertyId: string;
  onSuccess?: () => void;
}

export function AppointmentForm({
  propertyId,
  onSuccess,
}: AppointmentFormProps) {
  const [state, formAction, isPending] = useActionState(
    createAppointmentAction,
    undefined
  );

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
  const handleSubmit = (formData: FormData) => {
    if (!selectedDate || !selectedHour) {
      return;
    }

    const hour = parseInt(selectedHour, 10);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hour, 0, 0, 0);

    // Validar fecha/hora una vez más
    const validation = validateAppointmentDateTime(appointmentDate);
    if (!validation.valid) {
      return;
    }

    // Crear FormData con valores correctos
    const newFormData = new FormData();
    newFormData.append("propertyId", propertyId);
    newFormData.append("scheduledAt", appointmentDate.toISOString());
    newFormData.append("notes", notes);

    formAction(newFormData);
  };

  // Si fue exitoso, llamar callback
  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Mensaje de éxito */}
      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Cita agendada exitosamente. El agente te confirmará en breve.
        </div>
      )}

      {/* Mensaje de error general */}
      {state?.error && !state?.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {state.error}
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
        <Label htmlFor="notes">
          Notas adicionales (opcional)
        </Label>
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
