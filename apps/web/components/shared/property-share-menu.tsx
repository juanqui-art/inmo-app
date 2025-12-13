/**
 * PropertyShareMenu - Reusable Social Share Dropdown
 *
 * PATTERN: Floating action menu for property sharing (agnóstico de contexto)
 *
 * FEATURES:
 * - Share to WhatsApp, Facebook, TikTok, Instagram
 * - Email sharing with subject and body
 * - Copy property link to clipboard
 * - Optimized for Latin American users (WhatsApp primary)
 * - Smooth animations and transitions
 * - Click-outside detection
 * - Mobile-friendly
 * - Customizable button variant and size
 * - Portal rendering to avoid stacking context issues
 *
 * DESIGN:
 * - Glassmorphism menu
 * - Animated icons with hover effects
 * - Dark mode support
 *
 * USAGE:
 * ```tsx
 * <PropertyShareMenu
 *   propertyId={property.id}
 *   propertyTitle={property.title}
 *   propertyPrice={property.price}
 *   customUrl="/propiedades/[id]-[slug]"  // Optional: custom share URL
 * />
 * ```
 */

"use client";

import { cn } from "@repo/ui";
import { Check, Copy, Mail, Share2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PropertyShareMenuProps {
  propertyId: string;
  propertyTitle: string;
  propertyPrice?: number | string | { toString(): string };
  /** Optional: custom URL for sharing. If not provided, uses current URL */
  customUrl?: string;
  /** Optional: callback after share action */
  onShare?: (platform: string) => void;
  /** Optional: button size class */
  buttonClassName?: string;
}

interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: (
    url: string,
    title: string,
    price?: number | string | { toString(): string },
  ) => void;
}

export function PropertyShareMenu({
  propertyId,
  propertyTitle,
  propertyPrice,
  customUrl,
  onShare,
  buttonClassName = "w-10 h-10",
}: PropertyShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Determine share URL
  const shareUrl =
    customUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/propiedades/${propertyId}`
      : "");

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Share options
  const shareOptions: ShareOption[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.57.912-2.833 2.514-3.297 4.282-.512 1.948-.181 3.976.983 5.39 1.02 1.175 2.688 1.948 4.464 2.015 1.042.04 2.065-.27 2.889-.783l.713.712a1.5 1.5 0 002.122 0l1.414-1.414a1.5 1.5 0 000-2.122l-.712-.712c.513-.824.822-1.847.782-2.889-.067-1.776-.84-3.444-2.015-4.464-1.414-1.164-3.442-1.495-5.341-.983m5.341.983c1.414 1.164 1.907 2.877 1.576 4.509-.205.988-.767 1.842-1.495 2.49" />
        </svg>
      ),
      color: "bg-green-500 text-white shadow-sm",
      action: (
        url: string,
        title: string,
        price?: number | string | { toString(): string },
      ) => {
        const message = `¡Mira esta propiedad! 🏠\n\n${title}\nPrecio: $${price}\n\n${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-[#1877F2] text-white shadow-sm",
      action: (url: string) => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      ),
      color: "bg-pink-500 text-white shadow-sm",
      action: (url: string) => {
        // Instagram doesn't have direct share API
        navigator.clipboard.writeText(url);
        alert("Enlace copiado. Pégalo en Instagram Stories o DM");
      },
    },
    {
      id: "tiktok",
      label: "TikTok",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.75 2.9 2.9 0 0 1 2.31-4.64 2.87 2.87 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.4-.05z" />
        </svg>
      ),
      color: "bg-black text-white shadow-sm dark:bg-white dark:text-black",
      action: (url: string) => {
        navigator.clipboard.writeText(url);
        alert("Enlace copiado. Comparte en TikTok");
      },
    },
    {
      id: "email",
      label: "Email",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-orange-500 text-white shadow-sm",
      action: (
        url: string,
        title: string,
        price?: number | string | { toString(): string },
      ) => {
        const subject = `Mira esta propiedad: ${title}`;
        const body = `Encontré esta propiedad que te podría interesar:\n\n${title}\nPrecio: $${price}\n\n${url}`;
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
      },
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = (option: ShareOption) => {
    option.action(shareUrl, propertyTitle, propertyPrice);
    onShare?.(option.id);
    setIsOpen(false);
  };

  const [isSharing, setIsSharing] = useState(false);

  const handleMainShare = async () => {
    // Prevent multiple clicks while sharing
    if (isSharing) return;

    // 1. Try Native Share (Mobile/Tablet preference)
    if (typeof navigator !== "undefined" && navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({
          title: propertyTitle,
          text: `Mira esta propiedad: ${propertyTitle}`,
          url: shareUrl,
        });
        onShare?.("native");
      } catch (error) {
        // User cancelled or share failed -> Do NOT fallback to custom menu
        // Just log it for debugging purposes
        if ((error as Error).name !== "AbortError" && (error as Error).name !== "InvalidStateError") {
          console.error("Native share failed:", error);
        }
      } finally {
        setIsSharing(false);
      }
      return; // Stop here if native share exists (even if cancelled)
    }

    // 2. Fallback: Toggle Custom Menu (Desktop preference)
    setIsOpen(!isOpen);
  };

  const [buttonRect, setButtonRect] = React.useState<DOMRect | null>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        ref={buttonRef}
        onClick={handleMainShare}
        className={cn(
          "rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 hover:bg-white/50 shadow-md",
          buttonClassName
        )}
        aria-label="Share property"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Share2 className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Share Menu - Using Portal to avoid overflow issues */}
      {isOpen &&
        buttonRect &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: `${buttonRect.bottom + 12}px`,
              right: `${window.innerWidth - buttonRect.right}px`,
            }}
          >
            <div className="w-72 rounded-2xl border border-white/20 bg-white/80 dark:bg-oslo-gray-950/80 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
              <div className="mb-3 px-1">
                <h3 className="text-sm font-medium text-oslo-gray-900 dark:text-oslo-gray-100">
                  Compartir propiedad
                </h3>
              </div>

              {/* Share Options Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {shareOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleShare(option)}
                    className="group relative flex flex-col items-center gap-2 rounded-xl p-2 transition-all hover:bg-white/50 dark:hover:bg-white/10 active:scale-95"
                    aria-label={`Share on ${option.label}`}
                    title={option.label}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:shadow-md ${option.color.replace("hover:", "")}`}
                    >
                      {option.icon}
                    </div>
                    <span className="text-[10px] font-medium text-oslo-gray-600 dark:text-oslo-gray-300">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-oslo-gray-200/50 dark:border-oslo-gray-700/50 my-3" />

              {/* Copy Link Option */}
              <button
                onClick={handleCopyLink}
                className="group w-full flex items-center justify-between gap-3 rounded-xl bg-oslo-gray-100/50 dark:bg-oslo-gray-800/50 px-4 py-3 text-sm font-medium text-oslo-gray-700 dark:text-oslo-gray-200 transition-all hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-800 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-oslo-gray-700 shadow-sm">
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-oslo-gray-500 dark:text-oslo-gray-400" />
                    )}
                  </div>
                  <span>Copiar enlace</span>
                </div>
                {copied && (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-left-1">
                    ¡Copiado!
                  </span>
                )}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
