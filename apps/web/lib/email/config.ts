/**
 * EMAIL CONFIGURATION
 *
 * Centralized email sender configuration.
 * Development: Uses test@resend.dev
 * Production: Uses verified domain (when available)
 *
 * USAGE:
 * ```typescript
 * const config = getEmailConfig();
 * resend.emails.send({
 *   from: config.from,
 *   to: getTestRecipient(userEmail),
 *   ...
 * });
 * ```
 */

import { env } from "@repo/env";

interface EmailConfig {
  from: string;
  replyTo?: string;
  testMode: boolean;
}

/**
 * Get email configuration based on environment
 *
 * Returns test mode config if EMAIL_FROM_DOMAIN is not set,
 * otherwise returns production config with verified domain.
 */
export function getEmailConfig(): EmailConfig {
  // Check if we have a verified domain configured
  const verifiedDomain = env.EMAIL_FROM_DOMAIN; // e.g., "inmoapp.com"

  if (verifiedDomain) {
    // Production mode: Use verified domain
    return {
      from: `InmoApp <noreply@${verifiedDomain}>`,
      replyTo: `soporte@${verifiedDomain}`,
      testMode: false,
    };
  }

  // Development/Testing mode: Use Resend test addresses
  return {
    from: "test@resend.dev",
    testMode: true,
  };
}

/**
 * Get test recipient address for development
 *
 * In test mode, all emails are redirected to delivered@resend.dev
 * so you can verify email content without spamming real addresses.
 *
 * In production mode, returns the original email unchanged.
 *
 * @param originalEmail - The intended recipient email
 * @returns The actual recipient email to use
 */
export function getTestRecipient(originalEmail: string): string {
  const config = getEmailConfig();

  if (config.testMode) {
    // In test mode, use delivered@resend.dev to verify email content
    // You can check these emails in Resend Dashboard > Emails
    return "delivered@resend.dev";
  }

  // Production: use original email
  return originalEmail;
}
