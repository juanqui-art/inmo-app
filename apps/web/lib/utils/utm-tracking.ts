/**
 * UTM Tracking Utilities
 * 
 * Captures UTM parameters from URLs and stores them in sessionStorage
 * for attribution when leads convert (appointments, contact forms, etc.)
 * 
 * UTM Parameters:
 * - utm_source: Where the traffic came from (facebook, google, instagram)
 * - utm_medium: Type of traffic (cpc, organic, social, email)
 * - utm_campaign: Specific campaign name (verano2024, openhouse)
 * - utm_content: Specific ad/link (optional)
 * - utm_term: Paid keywords (optional)
 */

const UTM_STORAGE_KEY = "vant_utm_params";
const UTM_EXPIRY_HOURS = 24; // Keep UTM data for 24 hours

export interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  capturedAt?: string;
}

/**
 * Capture UTM parameters from URL and store in sessionStorage
 * Called on page load (client-side)
 */
export function captureUTMFromURL(): UTMParams | null {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);
  const params = url.searchParams;

  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmContent = params.get("utm_content");
  const utmTerm = params.get("utm_term");

  // Only capture if at least one UTM param is present
  if (!utmSource && !utmMedium && !utmCampaign) {
    return null;
  }

  const utmParams: UTMParams = {
    utmSource: utmSource || undefined,
    utmMedium: utmMedium || undefined,
    utmCampaign: utmCampaign || undefined,
    utmContent: utmContent || undefined,
    utmTerm: utmTerm || undefined,
    capturedAt: new Date().toISOString(),
  };

  // Store in sessionStorage (persists until browser closes)
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
  } catch {
    // sessionStorage might not be available
    console.warn("[UTM] Failed to store UTM params");
  }

  return utmParams;
}

/**
 * Get stored UTM parameters
 * Returns null if expired or not found
 */
export function getStoredUTM(): UTMParams | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return null;

    const utmParams: UTMParams = JSON.parse(stored);

    // Check if expired
    if (utmParams.capturedAt) {
      const capturedTime = new Date(utmParams.capturedAt).getTime();
      const now = Date.now();
      const hoursElapsed = (now - capturedTime) / (1000 * 60 * 60);
      
      if (hoursElapsed > UTM_EXPIRY_HOURS) {
        clearStoredUTM();
        return null;
      }
    }

    return utmParams;
  } catch {
    return null;
  }
}

/**
 * Clear stored UTM parameters
 * Called after successful conversion to prevent double attribution
 */
export function clearStoredUTM(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * Get displayable source name from UTM
 */
export function getSourceDisplayName(utmSource?: string): string {
  if (!utmSource) return "Directo";
  
  const sourceNames: Record<string, string> = {
    facebook: "Facebook",
    fb: "Facebook",
    instagram: "Instagram",
    ig: "Instagram",
    google: "Google",
    tiktok: "TikTok",
    twitter: "Twitter/X",
    x: "Twitter/X",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    email: "Email",
    newsletter: "Newsletter",
  };

  return sourceNames[utmSource.toLowerCase()] || utmSource;
}

/**
 * Determine lead source from context
 * Priority: UTM > Referrer > Direct
 */
export function determineLeadSource(
  source?: string,
  utmParams?: UTMParams | null
): string {
  // If explicit source provided (e.g., "appointment", "favorite")
  if (source) return source;

  // If UTM source available
  if (utmParams?.utmSource) {
    return `utm:${utmParams.utmSource}`;
  }

  // Default to direct
  return "direct";
}
