/**
 * CALENDAR COMPONENT
 *
 * Envoltorio de react-day-picker con estilos Tailwind
 * Usado para seleccionar fechas en el formulario de citas
 */

import type * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "../lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  disabled,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-oslo-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-oslo-gray-100/50 [&:has([aria-selected])]:bg-oslo-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-oslo-gray-100 rounded",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white",
        day_today: "bg-oslo-gray-100 text-oslo-gray-900",
        day_outside:
          "day-outside text-oslo-gray-400 opacity-50 aria-selected:bg-oslo-gray-100/50 aria-selected:text-oslo-gray-400 aria-selected:opacity-30",
        day_disabled: "text-oslo-gray-400 opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-oslo-gray-100 aria-selected:text-oslo-gray-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      disabled={disabled}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
