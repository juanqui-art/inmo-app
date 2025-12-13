"use client";

/**
 * APPOINTMENT FORM COMPONENT
 *
 * Formulario para que clientes creen una nueva cita
 * - Calendar picker para seleccionar fecha
 * - Dropdown de horarios disponibles
 * - Textarea opcional para notas
 * - Validación inline en tiempo real
 * - UI optimista
 * - Accesibilidad completa
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
import { AlertCircle, CheckCircle2, X } from "lucide-react";
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
  onFormChange?: () => void;
}

export function AppointmentForm({
  propertyId,
  onSuccess,
  onFormChange,
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

  // Validation state (touched fields)
  const [touched, setTouched] = useState({
    date: false,
    hour: false,
  });

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

  // Notify parent of form changes
  useEffect(() => {
    if (selectedDate || selectedHour || notes) {
      onFormChange?.();
    }
  }, [selectedDate, selectedHour, notes, onFormChange]);

  // Cargar slots disponibles cuando cambia la fecha
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    // Validar preventivamente que la fecha sea válida
    const tempDate = new Date(selectedDate);
    tempDate.setHours(10, 0, 0, 0); // Usar 10am para validación (hora de negocio válida)
    const validation = validateAppointmentDateTime(tempDate);
    if (!validation.valid) {
      setSlotsError(validation.error || "Fecha inválida");
      setAvailableSlots([]);
      setLoadingSlots(false);
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
        if (result.slots.length === 0) {
          setSlotsError("No hay horarios disponibles para esta fecha");
        }
      } else {
        setSlotsError(result.error || "Error al cargar horarios");
        setAvailableSlots([]);
      }
    });
  }, [selectedDate, propertyId]);

  // Manejo de submit con UI optimista
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Marcar todos los campos como touched
    setTouched({ date: true, hour: true });

    if (!selectedDate || !selectedHour) {
      setError("Por favor selecciona una fecha y hora");
      return;
    }

    const hour = parseInt(selectedHour, 10);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hour, 0, 0, 0);

    // Validar fecha/hora una vez más
    const validation = validateAppointmentDateTime(appointmentDate);
    if (!validation.valid) {
      setError(validation.error || "Fecha o hora inválida");
      return;
    }

    // UI Optimista: mostrar éxito inmediatamente
    setError(null);
    setSuccess(true);

    startTransition(async () => {
      const result = await createAppointmentAction({
        propertyId,
        scheduledAt: appointmentDate.toISOString(),
        notes,
      });

      if (!result.success) {
        // Rollback UI optimista
        setSuccess(false);
        setError(result.error || "Error al crear la cita");
      } else if (onSuccess) {
        // Mantener success=true y llamar onSuccess
        onSuccess();
      }
    });
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mensaje de éxito con botón de cierre inmediato */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium">¡Cita agendada exitosamente!</p>
            <p className="text-sm mt-1 opacity-90">
              El agente te confirmará en breve.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseSuccess}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded motion-safe:transition-colors"
            aria-label="Cerrar mensaje"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mensaje de error con icono */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {/* Date Picker */}
      <div className="space-y-2">
        <Label className={touched.date && !selectedDate ? "text-red-600 dark:text-red-400" : ""}>
          Selecciona una fecha
          {touched.date && !selectedDate && (
            <span className="ml-1 text-red-600 dark:text-red-400" aria-label="Campo requerido">*</span>
          )}
        </Label>
        <p className="text-xs text-oslo-gray-500 dark:text-oslo-gray-400">
          Usa las flechas del teclado para navegar, Enter para seleccionar
        </p>
        <div className="bg-oslo-gray-50 dark:bg-oslo-gray-900 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-800 p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setSelectedHour(""); // Reset hora al cambiar fecha
              setTouched((prev) => ({ ...prev, date: true }));
            }}
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
        {touched.date && !selectedDate && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            Por favor selecciona una fecha
          </p>
        )}
      </div>

      {/* Time Slot Selector */}
      {selectedDate && (
        <div className="space-y-2">
          <Label
            htmlFor="selectedHour"
            className={touched.hour && !selectedHour ? "text-red-600 dark:text-red-400" : ""}
          >
            Selecciona una hora
            {touched.hour && !selectedHour && (
              <span className="ml-1 text-red-600 dark:text-red-400" aria-label="Campo requerido">*</span>
            )}
          </Label>
          {loadingSlots ? (
            // Skeleton loading
            <div className="space-y-2" role="status" aria-live="polite" aria-label="Cargando horarios disponibles">
              <div className="h-10 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-md motion-safe:animate-pulse" />
              <div className="h-4 w-48 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded motion-safe:animate-pulse" />
            </div>
          ) : slotsError ? (
            <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{slotsError}</span>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
              No hay horarios disponibles para esta fecha. Por favor elige otra fecha.
            </div>
          ) : (
            <>
              <Select
                value={selectedHour}
                onValueChange={(value) => {
                  setSelectedHour(value);
                  setTouched((prev) => ({ ...prev, hour: true }));
                }}
              >
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
              {touched.hour && !selectedHour && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" aria-hidden="true" />
                  Por favor selecciona una hora
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas adicionales (opcional)</Label>
        <Textarea
          id="notes"
          name="notes"
          autoComplete="off"
          placeholder="Interesado en ver el living, la cocina…"
          className="min-h-24 text-base" // text-base = 16px (evita zoom en iOS)
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
        />
        <p className="text-xs text-oslo-gray-500 dark:text-oslo-gray-400">
          {notes.length} / 500 caracteres
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!selectedDate || !selectedHour || isPending || loadingSlots || success}
        className="w-full"
      >
        {isPending ? "Agendando cita…" : "Agendar cita"}
      </Button>
    </form>
  );
}
