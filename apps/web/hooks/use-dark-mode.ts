/**
 * useDarkMode Hook
 *
 * Utility hook para acceder al estado del tema y funciones relacionadas
 * Wrapper sobre useTheme de next-themes con typings mejorados
 *
 * EJEMPLO DE USO:
 *
 * ```tsx
 * import { useDarkMode } from "@/hooks/use-dark-mode";
 *
 * function MyComponent() {
 *   const { isDark, theme, setTheme, toggleTheme } = useDarkMode();
 *
 *   return (
 *     <div className={isDark ? "dark-specific-class" : "light-specific-class"}>
 *       <p>Current theme: {theme}</p>
 *       <button onClick={toggleTheme}>Toggle Theme</button>
 *     </div>
 *   );
 * }
 * ```
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useDarkMode() {
    const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evitar hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    /**
     * Determina si el tema actual es dark
     * Considera:
     * - Tema resuelto (después de considerar "system")
     * - Default a false durante SSR para evitar flash
     */
    const isDark = mounted ? resolvedTheme === "dark" : false;

    /**
     * Determina si el tema actual es light
     */
    const isLight = mounted ? resolvedTheme === "light" : false;

    /**
     * Determina si está usando la preferencia del sistema
     */
    const isSystem = theme === "system";

    /**
     * Toggle entre light y dark
     * (No afecta si está en modo "system")
     */
    const toggleTheme = () => {
        if (theme === "system") {
            // Si está en system, cambiar al opuesto del actual
            setTheme(resolvedTheme === "dark" ? "light" : "dark");
        } else {
            setTheme(theme === "dark" ? "light" : "dark");
        }
    };

    /**
     * Establecer tema específico
     */
    const setDark = () => setTheme("dark");
    const setLight = () => setTheme("light");
    const setSystemTheme = () => setTheme("system");

    return {
        // Estados
        theme,
        resolvedTheme,
        systemTheme,
        isDark,
        isLight,
        isSystem,
        mounted, // Para conditional rendering

        // Funciones
        setTheme,
        toggleTheme,
        setDark,
        setLight,
        setSystemTheme,
    };
}
