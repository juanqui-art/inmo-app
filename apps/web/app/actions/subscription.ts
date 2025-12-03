"use server";

import { requireAuth } from "@/lib/auth";
import { db } from "@repo/database/src/client";
import { revalidatePath } from "next/cache";

/**
 * UPGRADE SUBSCRIPTION ACTION
 *
 * Simula el proceso de pago y actualiza el tier del usuario.
 * En producción, esto se manejaría vía Webhooks de Stripe.
 */
export async function upgradeSubscriptionAction(formData: FormData) {
  const user = await requireAuth();
  const plan = formData.get("plan") as string;

  if (!plan || !["BASIC", "PRO"].includes(plan)) {
    return { error: "Plan inválido" };
  }

  try {
    // Simular delay de procesamiento de pago
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Actualizar tier en base de datos
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: plan as "BASIC" | "PRO",
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return { error: "Error al procesar la suscripción" };
  }
}
