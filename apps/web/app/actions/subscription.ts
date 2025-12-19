"use server";

import { requireAuth } from "@/lib/auth";
import { validateCSRFToken, isCSRFError } from "@/lib/csrf";
import { logger } from "@/lib/utils/logger";
import { promoteToAgent, setUserTier } from "@/lib/subscription/tier-manager";
import { revalidatePath } from "next/cache";
import type { SubscriptionTier } from "@prisma/client";

/**
 * UPGRADE SUBSCRIPTION ACTION
 *
 * Simula el proceso de pago y actualiza el tier del usuario.
 * En producción, esto se manejaría vía Webhooks de Stripe.
 *
 * ARQUITECTURA SSOT (Single Source of Truth):
 * - Solo actualiza public.users.subscription_tier
 * - NO actualiza metadata de auth.users (ignorado después del signup)
 * - Usa tier-manager para garantizar consistencia
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

  if (!plan || !["PLUS", "BUSINESS", "PRO"].includes(plan)) {
    return { error: "Plan inválido" };
  }

  try {
    // Simular delay de procesamiento de pago
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Usar tier-manager para cambios de tier (patrón SSOT)
    const newTier = plan as Exclude<SubscriptionTier, "FREE">;

    if (user.role === "CLIENT") {
      // Promover CLIENT → AGENT con el tier seleccionado
      await promoteToAgent(user.id, newTier);
    } else {
      // Solo actualizar tier (mantener role actual)
      await setUserTier(user.id, newTier, "subscription_upgrade");
    }

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
