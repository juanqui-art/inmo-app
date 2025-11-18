/**
 * APPOINTMENT EMAIL SERVICE
 *
 * Envía notificaciones por email cuando se crea/confirma/cancela una cita
 * Usa Resend como servicio de email
 */

import { Resend } from "resend";
import { env } from "@repo/env";
import {
  formatAppointmentDate,
  getAppointmentEmailSubject,
} from "@/lib/utils/appointment-helpers";

/**
 * Resend email response data structure
 * Used for type-safe extraction of email IDs from Resend API responses
 */
interface ResendEmailData {
  id: string;
}

/**
 * LAZY INITIALIZATION
 *
 * The Resend client is created on-demand when functions execute,
 * not at module load time. This ensures:
 *
 * 1. The RESEND_API_KEY is only accessed when actually needed (in functions)
 * 2. Prevents errors during Next.js module evaluation in browser context
 * 3. Explicit runtime check ensures server-only usage
 * 4. Better error messages if API key is missing
 */
function getResendClient() {
  // Runtime check: Ensure we're on the server
  if (typeof window !== "undefined") {
    throw new Error(
      "Resend client can only be used on the server. " +
        "This function must be called from a Server Action or Server Component.",
    );
  }

  // Ensure API key exists
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY environment variable is not set. " +
        "Please add RESEND_API_KEY to your .env.local file. " +
        "Get your API key from: https://resend.com/api-keys",
    );
  }

  return new Resend(env.RESEND_API_KEY);
}

interface AppointmentEmailData {
  clientName: string;
  clientEmail: string;
  agentName: string;
  agentEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  appointmentDate: Date;
  notes?: string;
}

/**
 * Enviar email cuando se crea una nueva cita
 * Se envía al cliente y al agente
 */
export async function sendAppointmentCreatedEmail(data: AppointmentEmailData) {
  const resend = getResendClient();
  const appointmentDateFormatted = formatAppointmentDate(data.appointmentDate);
  const subject = getAppointmentEmailSubject("created", data.propertyTitle);

  // Log email attempt
  console.log("[sendAppointmentCreatedEmail] Attempting to send emails:", {
    clientEmail: data.clientEmail,
    agentEmail: data.agentEmail,
    from: "test@resend.dev",
    propertyTitle: data.propertyTitle,
  });

  // Email para el cliente
  const clientEmailPromise = resend.emails.send({
    from: "test@resend.dev",
    to: data.clientEmail,
    subject,
    html: generateClientAppointmentCreatedHTML(
      data.clientName,
      data.propertyTitle,
      data.propertyAddress,
      appointmentDateFormatted,
      data.agentName,
      data.notes,
    ),
  });

  // Email para el agente
  const agentEmailPromise = resend.emails.send({
    from: "test@resend.dev",
    to: data.agentEmail,
    subject: `Nueva cita agendada - ${data.propertyTitle}`,
    html: generateAgentAppointmentCreatedHTML(
      data.agentName,
      data.clientName,
      data.propertyTitle,
      data.propertyAddress,
      appointmentDateFormatted,
      data.notes,
    ),
  });

  try {
    const [clientResult, agentResult] = await Promise.all([
      clientEmailPromise,
      agentEmailPromise,
    ]);

    const clientSuccess = clientResult.error === null;
    const agentSuccess = agentResult.error === null;

    // Log detailed results
    console.log("[sendAppointmentCreatedEmail] Resend API results:", {
      client: {
        success: clientSuccess,
        emailId: clientSuccess ? (clientResult.data as ResendEmailData)?.id : null,
        error: clientResult.error || null,
      },
      agent: {
        success: agentSuccess,
        emailId: agentSuccess ? (agentResult.data as ResendEmailData)?.id : null,
        error: agentResult.error || null,
      },
    });

    // If any email failed, log warning
    if (!clientSuccess || !agentSuccess) {
      console.warn("[sendAppointmentCreatedEmail] Some emails failed:", {
        clientFailed: !clientSuccess,
        agentFailed: !agentSuccess,
        clientError: clientResult.error,
        agentError: agentResult.error,
      });
    }

    return {
      success: clientSuccess && agentSuccess,
      clientEmailId: clientSuccess ? (clientResult.data as ResendEmailData).id : undefined,
      agentEmailId: agentSuccess ? (agentResult.data as ResendEmailData).id : undefined,
      error: !clientSuccess || !agentSuccess
        ? `Email delivery failed: ${[
            !clientSuccess ? "client" : null,
            !agentSuccess ? "agent" : null,
          ].filter(Boolean).join(", ")}`
        : undefined,
    };
  } catch (error) {
    console.error("[sendAppointmentCreatedEmail] Exception:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    });
    return {
      success: false,
      error: "Failed to send appointment emails",
    };
  }
}

/**
 * Enviar email cuando agente confirma una cita
 */
export async function sendAppointmentConfirmedEmail(
  data: AppointmentEmailData,
) {
  const resend = getResendClient();
  const appointmentDateFormatted = formatAppointmentDate(data.appointmentDate);
  const subject = getAppointmentEmailSubject("confirmed", data.propertyTitle);

  console.log("[sendAppointmentConfirmedEmail] Attempting to send emails:", {
    clientEmail: data.clientEmail,
    agentEmail: data.agentEmail,
    from: "test@resend.dev",
  });

  // Email para el cliente
  const clientEmailPromise = resend.emails.send({
    from: "test@resend.dev",
    to: data.clientEmail,
    subject,
    html: generateClientAppointmentConfirmedHTML(
      data.clientName,
      data.propertyTitle,
      data.propertyAddress,
      appointmentDateFormatted,
      data.agentName,
    ),
  });

  // Email para el agente (confirmación de que se envió al cliente)
  const agentEmailPromise = resend.emails.send({
    from: "test@resend.dev",
    to: data.agentEmail,
    subject: `Cita confirmada - ${data.propertyTitle}`,
    html: generateAgentAppointmentConfirmedHTML(
      data.clientName,
      data.propertyTitle,
      appointmentDateFormatted,
    ),
  });

  try {
    const [clientResult, agentResult] = await Promise.all([
      clientEmailPromise,
      agentEmailPromise,
    ]);

    const clientSuccess = clientResult.error === null;
    const agentSuccess = agentResult.error === null;

    console.log("[sendAppointmentConfirmedEmail] Resend API results:", {
      client: {
        success: clientSuccess,
        emailId: clientSuccess ? (clientResult.data as ResendEmailData)?.id : null,
        error: clientResult.error || null,
      },
      agent: {
        success: agentSuccess,
        emailId: agentSuccess ? (agentResult.data as ResendEmailData)?.id : null,
        error: agentResult.error || null,
      },
    });

    if (!clientSuccess || !agentSuccess) {
      console.warn("[sendAppointmentConfirmedEmail] Some emails failed:", {
        clientFailed: !clientSuccess,
        agentFailed: !agentSuccess,
        clientError: clientResult.error,
        agentError: agentResult.error,
      });
    }

    return {
      success: clientSuccess && agentSuccess,
      clientEmailId: clientSuccess ? (clientResult.data as ResendEmailData).id : undefined,
      agentEmailId: agentSuccess ? (agentResult.data as ResendEmailData).id : undefined,
      error: !clientSuccess || !agentSuccess
        ? `Email delivery failed: ${[
            !clientSuccess ? "client" : null,
            !agentSuccess ? "agent" : null,
          ].filter(Boolean).join(", ")}`
        : undefined,
    };
  } catch (error) {
    console.error("[sendAppointmentConfirmedEmail] Exception:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    });
    return {
      success: false,
      error: "Failed to send confirmation emails",
    };
  }
}

/**
 * Enviar email cuando se cancela una cita
 */
export async function sendAppointmentCancelledEmail(
  data: AppointmentEmailData,
  cancelledBy: "client" | "agent",
) {
  const resend = getResendClient();
  const appointmentDateFormatted = formatAppointmentDate(data.appointmentDate);
  const subject = getAppointmentEmailSubject("cancelled", data.propertyTitle);

  console.log("[sendAppointmentCancelledEmail] Attempting to send emails:", {
    clientEmail: data.clientEmail,
    agentEmail: data.agentEmail,
    from: "test@resend.dev",
    cancelledBy,
  });

  // Email para el cliente
  const clientEmailPromise = resend.emails.send({
    from: "test@resend.dev",
    to: data.clientEmail,
    subject,
    html: generateClientAppointmentCancelledHTML(
      data.propertyTitle,
      data.propertyAddress,
      appointmentDateFormatted,
      cancelledBy === "agent",
    ),
  });

  // Email para el agente
  const agentEmailPromise = resend.emails.send({
    from: "test@resend.dev",
    to: data.agentEmail,
    subject: `Cita cancelada - ${data.propertyTitle}`,
    html: generateAgentAppointmentCancelledHTML(
      data.clientName,
      data.propertyTitle,
      appointmentDateFormatted,
      cancelledBy === "client",
    ),
  });

  try {
    const [clientResult, agentResult] = await Promise.all([
      clientEmailPromise,
      agentEmailPromise,
    ]);

    const clientSuccess = clientResult.error === null;
    const agentSuccess = agentResult.error === null;

    console.log("[sendAppointmentCancelledEmail] Resend API results:", {
      client: {
        success: clientSuccess,
        emailId: clientSuccess ? (clientResult.data as ResendEmailData)?.id : null,
        error: clientResult.error || null,
      },
      agent: {
        success: agentSuccess,
        emailId: agentSuccess ? (agentResult.data as ResendEmailData)?.id : null,
        error: agentResult.error || null,
      },
    });

    if (!clientSuccess || !agentSuccess) {
      console.warn("[sendAppointmentCancelledEmail] Some emails failed:", {
        clientFailed: !clientSuccess,
        agentFailed: !agentSuccess,
        clientError: clientResult.error,
        agentError: agentResult.error,
      });
    }

    return {
      success: clientSuccess && agentSuccess,
      clientEmailId: clientSuccess ? (clientResult.data as ResendEmailData).id : undefined,
      agentEmailId: agentSuccess ? (agentResult.data as ResendEmailData).id : undefined,
      error: !clientSuccess || !agentSuccess
        ? `Email delivery failed: ${[
            !clientSuccess ? "client" : null,
            !agentSuccess ? "agent" : null,
          ].filter(Boolean).join(", ")}`
        : undefined,
    };
  } catch (error) {
    console.error("[sendAppointmentCancelledEmail] Exception:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    });
    return {
      success: false,
      error: "Failed to send cancellation emails",
    };
  }
}

// ==================== HTML TEMPLATES ====================

function generateClientAppointmentCreatedHTML(
  clientName: string,
  propertyTitle: string,
  propertyAddress: string,
  appointmentDate: string,
  agentName: string,
  notes?: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .details { background: #f0f7ff; padding: 15px; border-left: 4px solid #0066cc; margin-bottom: 20px; }
    .details p { margin: 8px 0; }
    .label { font-weight: bold; color: #0066cc; }
    .footer { color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>¡Hola ${clientName}!</h2>
      <p>Tu cita ha sido agendada exitosamente.</p>
    </div>

    <div class="details">
      <p><span class="label">Propiedad:</span> ${propertyTitle}</p>
      <p><span class="label">Dirección:</span> ${propertyAddress}</p>
      <p><span class="label">Fecha y hora:</span> ${appointmentDate}</p>
      <p><span class="label">Agente:</span> ${agentName}</p>
      ${notes ? `<p><span class="label">Notas:</span> ${notes}</p>` : ""}
    </div>

    <p>El agente ${agentName} revisará tu solicitud y te confirmará la cita en breve.</p>

    <div class="footer">
      <p>Este es un mensaje automático de Inmo App. Por favor no responder directamente a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateAgentAppointmentCreatedHTML(
  agentName: string,
  clientName: string,
  propertyTitle: string,
  propertyAddress: string,
  appointmentDate: string,
  notes?: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f0f7ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .details { background: #fff8f0; padding: 15px; border-left: 4px solid #ff9500; margin-bottom: 20px; }
    .details p { margin: 8px 0; }
    .label { font-weight: bold; color: #ff9500; }
    .action-button { background: #0066cc; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 10px; }
    .footer { color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>¡Hola ${agentName}!</h2>
      <p>Tienes una nueva cita pendiente de confirmación.</p>
    </div>

    <div class="details">
      <p><span class="label">Cliente:</span> ${clientName}</p>
      <p><span class="label">Propiedad:</span> ${propertyTitle}</p>
      <p><span class="label">Dirección:</span> ${propertyAddress}</p>
      <p><span class="label">Fecha y hora solicitada:</span> ${appointmentDate}</p>
      <p><span class="label">Estado:</span> Pendiente de confirmación</p>
      ${notes ? `<p><span class="label">Notas del cliente:</span> ${notes}</p>` : ""}
    </div>

    <p>Por favor, confirma o rechaza esta cita desde tu dashboard.</p>

    <div class="footer">
      <p>Este es un mensaje automático de Inmo App. Por favor no responder directamente a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateClientAppointmentConfirmedHTML(
  clientName: string,
  propertyTitle: string,
  propertyAddress: string,
  appointmentDate: string,
  agentName: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .details { background: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; margin-bottom: 20px; }
    .details p { margin: 8px 0; }
    .label { font-weight: bold; color: #22c55e; }
    .footer { color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>¡Tu cita ha sido confirmada!</h2>
      <p>${clientName}, tu cita con ${agentName} ha sido confirmada.</p>
    </div>

    <div class="details">
      <p><span class="label">Propiedad:</span> ${propertyTitle}</p>
      <p><span class="label">Dirección:</span> ${propertyAddress}</p>
      <p><span class="label">Fecha y hora:</span> ${appointmentDate}</p>
      <p><span class="label">Agente:</span> ${agentName}</p>
    </div>

    <p>Te esperamos en la fecha y hora indicada. Si necesitas cancelar o reprogramar, por favor contacta al agente.</p>

    <div class="footer">
      <p>Este es un mensaje automático de Inmo App. Por favor no responder directamente a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateAgentAppointmentConfirmedHTML(
  clientName: string,
  propertyTitle: string,
  appointmentDate: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .details { background: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; margin-bottom: 20px; }
    .details p { margin: 8px 0; }
    .label { font-weight: bold; color: #22c55e; }
    .footer { color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Cita confirmada</h2>
      <p>Has confirmado la cita con ${clientName}.</p>
    </div>

    <div class="details">
      <p><span class="label">Cliente:</span> ${clientName}</p>
      <p><span class="label">Propiedad:</span> ${propertyTitle}</p>
      <p><span class="label">Fecha y hora:</span> ${appointmentDate}</p>
      <p><span class="label">Estado:</span> Confirmada</p>
    </div>

    <div class="footer">
      <p>Este es un mensaje automático de Inmo App. Por favor no responder directamente a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateClientAppointmentCancelledHTML(
  propertyTitle: string,
  propertyAddress: string,
  appointmentDate: string,
  cancelledByAgent: boolean,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .details { background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin-bottom: 20px; }
    .details p { margin: 8px 0; }
    .label { font-weight: bold; color: #ef4444; }
    .footer { color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Tu cita ha sido cancelada</h2>
      <p>Lamentamos informarte que tu cita ha sido cancelada.</p>
    </div>

    <div class="details">
      <p><span class="label">Propiedad:</span> ${propertyTitle}</p>
      <p><span class="label">Dirección:</span> ${propertyAddress}</p>
      <p><span class="label">Fecha y hora:</span> ${appointmentDate}</p>
      <p><span class="label">Razón:</span> ${cancelledByAgent ? "Cancelada por el agente" : "Cancelada por solicitud"}</p>
    </div>

    ${cancelledByAgent ? "<p>Si tienes dudas, por favor contacta al agente.</p>" : ""}

    <div class="footer">
      <p>Este es un mensaje automático de Inmo App. Por favor no responder directamente a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateAgentAppointmentCancelledHTML(
  clientName: string,
  propertyTitle: string,
  appointmentDate: string,
  cancelledByClient: boolean,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .details { background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin-bottom: 20px; }
    .details p { margin: 8px 0; }
    .label { font-weight: bold; color: #ef4444; }
    .footer { color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Una cita ha sido cancelada</h2>
      <p>La cita con ${clientName} ha sido cancelada.</p>
    </div>

    <div class="details">
      <p><span class="label">Cliente:</span> ${clientName}</p>
      <p><span class="label">Propiedad:</span> ${propertyTitle}</p>
      <p><span class="label">Fecha y hora:</span> ${appointmentDate}</p>
      <p><span class="label">Cancelada por:</span> ${cancelledByClient ? "El cliente" : "Tú"}</p>
    </div>

    <div class="footer">
      <p>Este es un mensaje automático de Inmo App. Por favor no responder directamente a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}
