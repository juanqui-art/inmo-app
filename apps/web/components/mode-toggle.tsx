"use client";

/**
 * MODE TOGGLE
 *
 * Componente para cambiar entre Light/Dark/System theme
 *
 * FEATURES:
 * - Animated icon transitions (Sun ↔ Moon)
 * - Smooth rotation and scale effects
 * - Dropdown menu con estado actual resaltado
 * - Accessibility friendly (sr-only labels)
 *
 * MEJORAS:
 * - Usa hook personalizado useDarkMode
 * - Indicador visual del tema activo
 * - Animaciones más suaves (duration-300)
 */

import { Button } from "@repo/ui";
import { Check, Moon, Sun, Monitor } from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme, mounted } = useDarkMode();

  // Evitar flash durante hidratación
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative overflow-hidden transition-colors duration-300"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Claro</span>
          </div>
          {theme === "light" && <Check className="h-4 w-4 text-indigo-600" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Oscuro</span>
          </div>
          {theme === "dark" && <Check className="h-4 w-4 text-indigo-600" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Sistema</span>
          </div>
          {theme === "system" && <Check className="h-4 w-4 text-indigo-600" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
