/**
 * RESEND EMAIL TYPES
 *
 * Type definitions for Resend email service integration
 * Provides type safety for email sending and response handling
 *
 * PATTERN: Integrating External Service Types
 * - Wrap third-party types in our own interfaces
 * - Provides abstraction layer
 * - Easier to switch email providers if needed
 * - Type-safe error handling
 */

/**
 * Response from Resend API when sending an email
 *
 * STRUCTURE:
 * - id: Unique email message ID (use for tracking/logging)
 * - error?: Error details if send failed
 *
 * USAGE:
 * ```typescript
 * const response = await resend.emails.send({
 *   from: 'onboarding@resend.dev',
 *   to: 'user@example.com',
 *   subject: 'Welcome',
 *   html: '<p>Welcome!</p>'
 * })
 *
 * if (response.error) {
 *   console.error('Email failed:', response.error)
 * } else {
 *   console.log('Email sent with ID:', response.data?.id)
 * }
 * ```
 */
export interface ResendEmailResponse {
  /**
   * Unique message ID when send is successful
   * Use this for tracking/logging
   * Example: 'msg_123abc456def'
   */
  id?: string | null

  /**
   * Error details if send failed
   * Resend returns structured error information
   */
  error?: {
    message: string
    [key: string]: unknown
  } | null
}

/**
 * Parameters for sending an email via Resend
 *
 * REQUIRED:
 * - from: Sender email address (must be verified domain or Resend test address)
 * - to: Recipient email address
 * - subject: Email subject line
 * - html: Email body as HTML
 *
 * OPTIONAL:
 * - replyTo: Reply-to address
 * - cc: Carbon copy recipients
 * - bcc: Blind carbon copy recipients
 *
 * EXAMPLE:
 * ```typescript
 * await resend.emails.send({
 *   from: 'noreply@inmoapp.com',
 *   to: 'user@example.com',
 *   subject: 'Appointment Confirmed',
 *   html: '<p>Your appointment has been confirmed for January 15, 2025</p>'
 * })
 * ```
 */
export interface ResendEmailParams {
  /**
   * Sender email address
   *
   * PRODUCTION: Use verified domain (e.g., 'noreply@inmoapp.com')
   * DEVELOPMENT: Use Resend test address 'test@resend.dev' or 'onboarding@resend.dev'
   *
   * See: docs/technical-debt/04-EMAIL.md for production setup
   */
  from: string

  /**
   * Recipient email address
   *
   * Production: Real user email addresses
   * Development: Test addresses or 'delivered@resend.dev' (Resend testing)
   */
  to: string

  /**
   * Email subject line
   * Example: 'Your appointment has been confirmed'
   */
  subject: string

  /**
   * Email body as HTML
   * Should include both visual and semantic HTML
   * Example: '<h1>Welcome!</h1><p>Your appointment details...</p>'
   */
  html: string

  /**
   * Optional: Reply-to address
   * Where replies should go if different from sender
   */
  replyTo?: string

  /**
   * Optional: Carbon copy recipients
   * Visible to all recipients
   */
  cc?: string | string[]

  /**
   * Optional: Blind carbon copy recipients
   * Not visible to other recipients
   */
  bcc?: string | string[]
}

/**
 * Appointment Email Data
 * Data structure for appointment-related emails
 */
export interface AppointmentEmailData {
  /**
   * Property address for display
   * Example: '123 Main Street, Quito, Pichincha'
   */
  propertyAddress: string

  /**
   * Appointment date-time
   * Example: 'January 15, 2025 at 3:00 PM'
   */
  appointmentDateTime: string

  /**
   * Client name for personalization
   */
  clientName: string

  /**
   * Agent name for contact info
   */
  agentName: string

  /**
   * Agent phone number for client contact
   */
  agentPhone: string

  /**
   * Appointment ID for reference/tracking
   */
  appointmentId: string
}

/**
 * EMAIL SERVICE LOGGING
 *
 * Best practice for email debugging:
 * ```typescript
 * const response = await resend.emails.send({...})
 *
 * console.log('[sendAppointmentEmail] Response:', {
 *   success: !response.error,
 *   id: response.data?.id,
 *   error: response.error,
 * })
 *
 * if (response.error) {
 *   // Log with context for debugging
 *   console.error('[sendAppointmentEmail] Failed to send email', {
 *     appointmentId,
 *     to: email,
 *     error: response.error.message,
 *   })
 * }
 * ```
 */

/**
 * RESEND API STATUS CODES
 *
 * 200 OK - Email sent successfully
 * 401 Unauthorized - Invalid API key
 * 403 Forbidden - API key doesn't have permission
 * 404 Not Found - Email list or contact not found
 * 422 Unprocessable Entity - Invalid request body
 * 429 Too Many Requests - Rate limit exceeded
 * 500 Server Error - Resend service error
 *
 * See: https://resend.com/docs/api-reference/emails/send
 */

/**
 * DEVELOPMENT VS PRODUCTION EMAIL SETUP
 *
 * DEVELOPMENT (Current):
 * ✅ Uses test@resend.dev as sender
 * ✅ Can send to test addresses (e.g., test@resend.dev, delivered@resend.dev)
 * ❌ Real user emails will NOT receive messages
 * ❌ Cannot verify real domain
 *
 * PRODUCTION (When Ready):
 * 1. Purchase domain (e.g., inmoapp.com)
 * 2. Verify domain in Resend Dashboard
 * 3. Add DNS records (DKIM, SPF, DMARC)
 * 4. Update from: 'noreply@inmoapp.com'
 * 5. Send to real user emails
 *
 * See: docs/technical-debt/04-EMAIL.md for complete guide
 */

/**
 * ERROR HANDLING PATTERNS
 *
 * Pattern 1: Safe parsing (graceful failure)
 * ```typescript
 * const response = await resend.emails.send({...})
 * if (response.error) {
 *   // Log error and continue (non-critical)
 *   console.warn('Email send failed:', response.error.message)
 *   return { success: true, emailWarning: response.error.message }
 * }
 * ```
 *
 * Pattern 2: Assertive (fail fast)
 * ```typescript
 * const response = await resend.emails.send({...})
 * if (response.error) {
 *   // Throw error and stop
 *   throw new Error(`Email send failed: ${response.error.message}`)
 * }
 * ```
 *
 * Pattern 3: Retry logic (critical emails)
 * ```typescript
 * for (let attempt = 1; attempt <= 3; attempt++) {
 *   const response = await resend.emails.send({...})
 *   if (!response.error) return response.data
 *   if (attempt < 3) await sleep(1000 * attempt)
 * }
 * throw new Error('Email send failed after 3 attempts')
 * ```
 */
