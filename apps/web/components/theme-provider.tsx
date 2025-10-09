"use client";

/**
 * THEME PROVIDER
 * Wrapper para next-themes que permite cambiar entre light/dark/system
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
