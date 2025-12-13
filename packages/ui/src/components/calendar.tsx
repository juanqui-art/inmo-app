"use client";

/**
 * CALENDAR COMPONENT
 *
 * Envoltorio de react-day-picker con estilos Tailwind
 * Usado para seleccionar fechas en el formulario de citas
 *
 * MEJORAS:
 * - Mejor contraste en fechas (texto oscuro)
 * - Chevrons más visibles
 * - Navegación clara mes/año
 * - Dark mode support
 */

import type * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "../lib/utils";
import { buttonVariants } from "./button";

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
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-semibold text-oslo-gray-950 dark:text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-800 border-oslo-gray-300 dark:border-oslo-gray-700"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 mt-4",
        head_row: "flex",
        head_cell:
          "text-oslo-gray-700 dark:text-oslo-gray-300 rounded-md w-10 font-semibold text-xs uppercase",
        row: "flex w-full mt-2",
        cell: cn(
          "h-10 w-10 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-oslo-gray-100/50 dark:[&:has([aria-selected].day-outside)]:bg-oslo-gray-800/50",
          "[&:has([aria-selected])]:bg-oslo-gray-100 dark:[&:has([aria-selected])]:bg-oslo-gray-800",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          "h-10 w-10 p-0 font-medium text-oslo-gray-900 dark:text-oslo-gray-100",
          "aria-selected:opacity-100",
          "hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-800 hover:text-oslo-gray-950 dark:hover:text-white",
          "rounded-md motion-safe:transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
          "cursor-pointer"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white dark:bg-indigo-500 dark:hover:bg-indigo-600",
        day_today: "bg-oslo-gray-200 dark:bg-oslo-gray-700 text-oslo-gray-950 dark:text-white font-bold border-2 border-indigo-600 dark:border-indigo-400",
        day_outside:
          "day-outside text-oslo-gray-400 dark:text-oslo-gray-600 opacity-50 aria-selected:bg-oslo-gray-100/50 dark:aria-selected:bg-oslo-gray-800/50 aria-selected:text-oslo-gray-400 dark:aria-selected:text-oslo-gray-600 aria-selected:opacity-30",
        day_disabled: "text-oslo-gray-300 dark:text-oslo-gray-700 opacity-50 cursor-not-allowed line-through",
        day_range_middle:
          "aria-selected:bg-oslo-gray-100 dark:aria-selected:bg-oslo-gray-800 aria-selected:text-oslo-gray-900 dark:aria-selected:text-oslo-gray-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      disabled={disabled}
      components={{
        Chevron: ({ orientation, ...props }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" {...props} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
