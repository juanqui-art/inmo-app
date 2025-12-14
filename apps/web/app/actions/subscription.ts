"use server";

import { requireAuth } from "@/lib/auth";
import { validateCSRFToken, isCSRFError } from "@/lib/csrf";
import { logger } from "@/lib/utils/logger";
import { db } from "@repo/database/src/client";
import { revalidatePath } from "next/cache";

/**
 * UPGRADE SUBSCRIPTION ACTION
 *
 * Simula el proceso de pago y actualiza el tier del usuario.
 * En producción, esto se manejaría vía Webhooks de Stripe.
 *
 * CSRF protected: subscription changes are critical for billing/privileges
 */
export async function upgradeSubscriptionAction(formData: FormData) {
  const user = await requireAuth();

  // CSRF validation (subscription changes are critical)
  const csrfToken = formData.get("csrfToken") as string | null;
  try {
    await validateCSRFToken(csrfToken);
  } catch (error) {
    if (isCSRFError(error)) {
      return { error: error.message };
    }
    throw error;
  }

  const plan = formData.get("plan") as string;

  if (!plan || !["PLUS", "AGENT", "PRO"].includes(plan)) {
    return { error: "Plan inválido" };
  }

  try {
    // Simular delay de procesamiento de pago
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Actualizar tier en base de datos
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: plan as "PLUS" | "AGENT" | "PRO",
        // Promote CLIENT to AGENT when they subscribe (sellers need AGENT role)
        role: user.role === "CLIENT" ? "AGENT" : user.role,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, userId: user.id, plan },
      "[Subscription] Error upgrading subscription"
    );
    return { error: "Error al procesar la suscripción" };
  }
}
