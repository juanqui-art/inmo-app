/**
 * Social Share Utilities
 *
 * PATTERN: Platform-specific URL builders
 *
 * WHY separate functions?
 * - Each platform has different URL params
 * - Easy to test individually
 * - Type-safe property data
 * - Centralized share logic
 *
 * PLATFORMS SUPPORTED:
 * - WhatsApp (very popular in LATAM)
 * - Facebook
 * - Twitter/X
 * - LinkedIn
 * - Email
 * - Copy Link (clipboard API)
 *
 * RESOURCES:
 * - https://github.com/nygardk/react-share
 * - https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
 */

import type { Property } from "@prisma/client";
import { env } from "@/lib/env";

export type SharePlatform =
  | "FACEBOOK"
  | "TWITTER"
  | "WHATSAPP"
  | "LINKEDIN"
  | "EMAIL"
  | "COPY_LINK"
  | "INSTAGRAM"
  | "TIKTOK";

interface ShareData {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

/**
 * Build share URL for property
 *
 * Creates absolute URL for sharing
 * Uses window.location in browser, fallback for SSR
 */
export function buildPropertyShareUrl(propertyId: string): string {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : env.NEXT_PUBLIC_SITE_URL;

  return `${baseUrl}/propiedades/${propertyId}`;
}

/**
 * Format property for sharing
 *
 * Extracts relevant data and formats for social media
 */
export function formatPropertyShareData(
  property: Property & { images?: { url: string }[] }
): ShareData {
  const url = buildPropertyShareUrl(property.id);

  // Format price for display
  const price = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(property.price));

  // Transaction type label
  const txType =
    property.transactionType === "SALE" ? "Venta" : "Renta";

  // Build title
  const title = `${property.title} - ${price} (${txType})`;

  // Build description
  const description = `${property.bedrooms} hab, ${property.bathrooms} baños, ${property.area}m² en ${property.city}, ${property.state}`;

  // First image
  const image = property.images?.[0]?.url;

  return { url, title, description, image };
}

/**
 * WHATSAPP Share
 *
 * WHY WhatsApp?
 * - Most popular messaging app in LATAM
 * - High conversion: Personal recommendation
 * - Mobile-first: Works on all devices
 *
 * URL Format:
 * https://wa.me/?text=MESSAGE
 *
 * PITFALL: URL encode the message!
 */
export function shareToWhatsApp(shareData: ShareData): void {
  const message = `${shareData.title}\n\n${shareData.description}\n\n${shareData.url}`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

/**
 * FACEBOOK Share
 *
 * Uses Facebook Share Dialog
 * Requires Open Graph tags to be set correctly
 *
 * URL Format:
 * https://www.facebook.com/sharer/sharer.php?u=URL
 *
 * NOTE: Facebook ignores title/description params
 * It scrapes Open Graph tags from the URL
 */
export function shareToFacebook(shareData: ShareData): void {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;

  window.open(
    facebookUrl,
    "_blank",
    "width=600,height=400,noopener,noreferrer"
  );
}

/**
 * TWITTER/X Share
 *
 * Uses Twitter Web Intent
 *
 * URL Format:
 * https://twitter.com/intent/tweet?text=TEXT&url=URL
 *
 * PITFALL: Character limit (280 chars)
 * Keep title short or it gets truncated
 */
export function shareToTwitter(shareData: ShareData): void {
  // Twitter limits, keep it short
  const text = shareData.title.length > 200
    ? shareData.title.substring(0, 200) + "..."
    : shareData.title;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareData.url)}`;

  window.open(
    twitterUrl,
    "_blank",
    "width=600,height=400,noopener,noreferrer"
  );
}

/**
 * LINKEDIN Share
 *
 * Uses LinkedIn Share Plugin
 *
 * URL Format:
 * https://www.linkedin.com/sharing/share-offsite/?url=URL
 *
 * NOTE: Like Facebook, LinkedIn scrapes Open Graph tags
 */
export function shareToLinkedIn(shareData: ShareData): void {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`;

  window.open(
    linkedInUrl,
    "_blank",
    "width=600,height=400,noopener,noreferrer"
  );
}

/**
 * EMAIL Share
 *
 * Uses mailto: protocol
 * Opens user's default email client
 *
 * URL Format:
 * mailto:?subject=SUBJECT&body=BODY
 */
export function shareViaEmail(shareData: ShareData): void {
  const subject = shareData.title;
  const body = `${shareData.description}\n\nVer propiedad: ${shareData.url}`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoUrl;
}

/**
 * COPY LINK to clipboard
 *
 * Uses modern Clipboard API
 * Falls back to deprecated execCommand if needed
 *
 * PITFALL: Requires HTTPS or localhost
 * HTTP sites can't use Clipboard API
 */
export async function copyLinkToClipboard(url: string): Promise<boolean> {
  try {
    // Modern Clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textArea);

    return success;
  } catch (error) {
    console.error("Failed to copy link:", error);
    return false;
  }
}

export function shareToInstagram(shareData: ShareData): void {
  const instagramUrl = `https://www.instagram.com/`;

  window.open(
    instagramUrl,
    "_blank",
    "width=600,height=400,noopener,noreferrer"
  );
}

export function shareToTikTok(shareData: ShareData): void {
  const tiktokUrl = `https://www.tiktok.com/`;

  window.open(
    tiktokUrl,
    "_blank",
    "width=600,height=400,noopener,noreferrer"
  );
}

/**
 * Generic share handler
 *
 * Routes to platform-specific function
 * Used by SocialShareButton component
 */
export function shareProperty(
  platform: SharePlatform,
  shareData: ShareData
): void | Promise<boolean> {
  switch (platform) {
    case "WHATSAPP":
      return shareToWhatsApp(shareData);
    case "FACEBOOK":
      return shareToFacebook(shareData);
    case "TWITTER":
      return shareToTwitter(shareData);
    case "LINKEDIN":
      return shareToLinkedIn(shareData);
    case "EMAIL":
      return shareViaEmail(shareData);
    case "COPY_LINK":
      return copyLinkToClipboard(shareData.url);
    case "INSTAGRAM":
      return shareToInstagram(shareData);
    case "TIKTOK":
      return shareToTikTok(shareData);
  }
}

/**
 * NATIVE SHARE API (Bonus)
 *
 * Mobile devices support native share sheet
 * Much better UX on mobile
 *
 * PITFALL: Not supported on all browsers
 * Check navigator.share availability first
 */
export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

export async function shareViaSystem(shareData: ShareData): Promise<boolean> {
  if (!canUseNativeShare()) {
    return false;
  }

  try {
    await navigator.share({
      title: shareData.title,
      text: shareData.description,
      url: shareData.url,
    });
    return true;
  } catch (error) {
    // User cancelled or error occurred
    console.error("Native share failed:", error);
    return false;
  }
}
