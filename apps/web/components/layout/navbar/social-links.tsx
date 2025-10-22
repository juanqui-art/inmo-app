/**
 * Social Links Component
 *
 * Reusable social media links for navbar
 * Supports both desktop and mobile variants
 */

import { Instagram, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";

interface SocialLinksProps {
  variant: "desktop" | "mobile";
  isHomepage?: boolean;
}

export function SocialLinks({ variant, isHomepage = false }: SocialLinksProps) {
  if (variant === "desktop") {
    return (
      <div className="flex items-center gap-2">
        <a
          href="https://facebook.com/inmoapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className={`p-2 rounded-full transition-all ${
            isHomepage
              ? "text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              : "text-oslo-gray-400 hover:text-blue-500 hover:bg-oslo-gray-800"
          }`}
        >
          <Image
            src="/social_icons/facebook.svg"
            alt="Facebook"
            width={17}
            height={17}
            className={isHomepage ? "brightness-0 invert" : "brightness-100"}
          />
        </a>

        <a
          href="https://instagram.com/inmoapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className={`p-2 rounded-full transition-all ${
            isHomepage
              ? "text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              : "text-oslo-gray-400 hover:text-pink-500 hover:bg-oslo-gray-800"
          }`}
        >
          <Image
            src="/social_icons/instagram.svg"
            alt="Instagram"
            width={16}
            height={16}
            className={isHomepage ? "brightness-0 invert" : "brightness-100"}
          />
        </a>

        <a
          href="https://tiktok.com/@inmoapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className={`p-2 rounded-full transition-all ${
            isHomepage
              ? "text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              : "text-oslo-gray-400 hover:text-white hover:bg-oslo-gray-800"
          }`}
        >
          <Image
            src="/social_icons/tiktok.svg"
            alt="TikTok"
            width={16}
            height={16}
            className={isHomepage ? "brightness-0 invert" : "brightness-100"}
          />
        </a>
      </div>
    );
  }

  // Mobile variant
  return (
    <div className="p-4 border-t border-oslo-gray-800">
      <p className="text-xs text-oslo-gray-500 mb-3 text-center">
        Síguenos en redes sociales
      </p>
      <div className="flex items-center justify-center gap-3">
        <a
          href="https://facebook.com/inmoapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-oslo-gray-800 hover:bg-blue-600 text-oslo-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
        >
          <Image
            src="/social_icons/facebook.svg"
            alt="Facebook"
            width={17}
            height={17}
            className="brightness-0 invert"
          />
        </a>

        <a
          href="https://twitter.com/inmoapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-oslo-gray-800 hover:bg-sky-500 text-oslo-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
        >
          <Twitter className="w-5 h-5" />
        </a>

        <a
          href="https://instagram.com/inmoapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-oslo-gray-800 hover:bg-pink-600 text-oslo-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
        >
          <Instagram className="w-5 h-5" />
        </a>

        <a
          href="https://linkedin.com/company/inmoapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-oslo-gray-800 hover:bg-blue-700 text-oslo-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
        >
          <Linkedin className="w-5 h-5" />
        </a>

        <a
          href="https://tiktok.com/@inmoapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-oslo-gray-800 hover:bg-white text-oslo-gray-400 hover:text-black transition-all duration-200 hover:scale-110"
        >
          <Image
            src="/social_icons/tiktok.svg"
            alt="TikTok"
            width={20}
            height={20}
            className="brightness-75"
          />
        </a>
      </div>
    </div>
  );
}
