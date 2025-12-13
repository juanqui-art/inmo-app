"use client";

/**
 * WHATSAPP BUTTON COMPONENT
 *
 * Botón reutilizable para contactar por WhatsApp
 * - Usa el SVG oficial de WhatsApp
 * - Maneja casos cuando no hay número de teléfono
 * - Mensajes personalizables
 * - Estilos consistentes en toda la app
 */

import { cn } from "@repo/ui";
import Image from "next/image";
import { toast } from "sonner";

interface WhatsAppButtonProps {
  phone?: string | null;
  message?: string;
  propertyTitle?: string;
  propertyId?: string;
  className?: string;
  compact?: boolean;
  fullWidth?: boolean;
}

export function WhatsAppButton({
  phone,
  message,
  propertyTitle,
  propertyId,
  className,
  compact = false,
  fullWidth = true,
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const phoneNumber = phone?.replace(/\D/g, "") || "";

    // Generar mensaje personalizado
    let whatsappMessage = message;
    if (!whatsappMessage && propertyTitle && propertyId) {
      whatsappMessage = `Hola, estoy interesado en la propiedad *${propertyTitle}* que vi en InmoApp: ${window.location.origin}/propiedades/${propertyId}`;
    } else if (!whatsappMessage) {
      whatsappMessage = "Hola, estoy interesado en la propiedad";
    }

    if (phoneNumber) {
      window.open(
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`,
        "_blank",
      );
    } else {
      toast.info(
        "El agente no tiene número de WhatsApp registrado, por favor contactar por correo.",
      );
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-lg motion-safe:transition-all duration-300 motion-safe:active:scale-[0.98] group",
        fullWidth && "w-full",
        compact ? "h-10 text-sm px-4" : "h-12 text-base px-6",
        className,
      )}
    >
      <div
        className={cn(
          "relative motion-safe:transition-transform motion-safe:group-hover:rotate-12",
          compact ? "w-4 h-4" : "w-5 h-5",
        )}
      >
        <Image
          src="/social_icons/Digital_Glyph_White.svg"
          alt="WhatsApp"
          fill
          className="object-contain"
        />
      </div>
      {compact ? (
        <>
          <span className="hidden sm:inline">WhatsApp</span>
          <span className="sm:hidden">WA</span>
        </>
      ) : (
        <span>Contactar por WhatsApp</span>
      )}
    </button>
  );
}
