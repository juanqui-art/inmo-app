import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { BodyStyleManager } from "@/components/layout/body-style-manager";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { PublicHeader } from "@/components/layout/public-header";

export const metadata: Metadata = {
  title: {
    template: "%s | InmoApp",
    default: "InmoApp - Tu plataforma inmobiliaria",
  },
  description: "Encuentra la propiedad de tus sueños con InmoApp.",
};

/**
 * Layout público de la aplicación.
 *
 * ARQUITECTURA:
 * - Usa un Route Group (public) para separar el layout de marketing del dashboard.
 * - Incluye lógica condicional para la "Vista Dividida" (Mapa/Lista) en /propiedades.
 * - El Header es sticky y el Footer se oculta dinámicamente en vistas de mapa completo.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Suspense fallback={null}>
        <BodyStyleManager />
      </Suspense>

      <PublicHeader />

      <main className="w-full flex-1">{children}</main>

      <Suspense fallback={<div className="h-16" />}>
        <ConditionalFooter />
      </Suspense>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
