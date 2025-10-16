"use client";

/**
 * THEME PROVIDER
 *
 * Wrapper para next-themes que permite cambiar entre light/dark/system
 *
 * CONFIGURACIÓN:
 * - defaultTheme: "dark" (InmoApp es dark-first)
 * - enableSystem: true (respeta preferencia del OS)
 * - attribute: "class" (aplica clase "dark" al html)
 * - storageKey: "inmoapp-theme" (persiste en localStorage)
 *
 * PRIORIDAD DE TEMA:
 * 1. Usuario selecciona manualmente → usa ese tema
 * 2. No hay selección manual → usa preferencia del sistema
 * 3. Sistema sin preferencia → usa "dark" (default)
 *
 * TRANSICIONES:
 * - Smooth transitions habilitadas (CSS transitions)
 * - Ver globals.css para configuración de duración
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
