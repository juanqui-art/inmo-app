/**
 * TIER MANAGER - Single Source of Truth
 *
 * Centraliza toda la lógica de cambios de subscription tier.
 * Implementa el patrón SSOT (Single Source of Truth):
 *
 * ✅ public.users.subscription_tier = FUENTE DE VERDAD
 * ❌ auth.users.metadata.plan = Solo referencia histórica (ignorado)
 *
 * REGLAS:
 * 1. NUNCA leer tier desde metadata (solo desde public.users)
 * 2. NUNCA sincronizar metadata ↔ DB (solo DB importa)
 * 3. Siempre usar estas funciones para cambiar tiers
 * 4. Metadata solo se usa en signup (trigger lo copia UNA VEZ)
 */

import { logger } from "@/lib/utils/logger";
import type { SubscriptionTier } from "@prisma/client";
import { db } from "@repo/database/src/client";

/**
 * Cambiar tier de un usuario
 *
 * IMPORTANTE: Solo actualiza public.users (NO metadata)
 * El metadata de auth.users NO se actualiza intencionalmente
 *
 * @param userId - ID del usuario
 * @param newTier - Nuevo tier (FREE, PLUS, BUSINESS, PRO)
 * @param reason - Razón del cambio (para logs/auditoría)
 *
 * @example
 * await setUserTier(userId, 'PRO', 'stripe_webhook_payment_succeeded');
 */
export async function setUserTier(
  userId: string,
  newTier: SubscriptionTier,
  reason: string = "manual_change"
): Promise<void> {
  const validTiers: SubscriptionTier[] = ["FREE", "PLUS", "BUSINESS", "PRO"];

  if (!validTiers.includes(newTier)) {
    throw new Error(`Invalid tier: ${newTier}. Must be one of ${validTiers.join(", ")}`);
  }

  // Solo actualizar DB (public.users es la fuente de verdad)
  await db.user.update({
    where: { id: userId },
    data: { subscriptionTier: newTier },
  });

  logger.info(
    { userId, newTier, reason },
    "[TierManager] Subscription tier updated (DB only, metadata ignored)"
  );

  // NO actualizar metadata en auth.users
  // El metadata solo importó en el signup inicial
  // public.users es la ÚNICA fuente de verdad
}

/**
 * Obtener tier actual de un usuario
 *
 * IMPORTANTE: Lee SOLO desde public.users (NO metadata)
 *
 * @param userId - ID del usuario
 * @returns Tier actual del usuario
 *
 * @example
 * const tier = await getUserTier(userId);
 * if (tier === 'PRO') { ... }
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Solo leer desde DB (NO consultar metadata)
  return user.subscriptionTier;
}

/**
 * Verificar si un usuario tiene un tier específico o superior
 *
 * Jerarquía: FREE < PLUS < BUSINESS < PRO
 *
 * @param userId - ID del usuario
 * @param requiredTier - Tier mínimo requerido
 * @returns true si el usuario tiene el tier o superior
 *
 * @example
 * if (await hasMinimumTier(userId, 'BUSINESS')) {
 *   // Usuario tiene BUSINESS o PRO
 * }
 */
export async function hasMinimumTier(
  userId: string,
  requiredTier: SubscriptionTier
): Promise<boolean> {
  const currentTier = await getUserTier(userId);

  const tierHierarchy: Record<SubscriptionTier, number> = {
    FREE: 0,
    PLUS: 1,
    BUSINESS: 2,
    PRO: 3,
  };

  return tierHierarchy[currentTier] >= tierHierarchy[requiredTier];
}

/**
 * Promover usuario a AGENT (para vendedores)
 *
 * Cambia role de CLIENT → AGENT y tier al plan seleccionado
 * Útil cuando un CLIENT compra un plan pago
 *
 * @param userId - ID del usuario
 * @param newTier - Tier del plan comprado (PLUS, BUSINESS, PRO)
 *
 * @example
 * await promoteToAgent(userId, 'BUSINESS'); // Cliente compró plan BUSINESS
 */
export async function promoteToAgent(
  userId: string,
  newTier: Exclude<SubscriptionTier, "FREE">
): Promise<void> {
  // Verificar que el tier no sea FREE
  if ((newTier as string) === "FREE") {
    throw new Error("Cannot promote to AGENT with FREE tier");
  }

  // Actualizar role y tier en un solo update
  await db.user.update({
    where: { id: userId },
    data: {
      role: "AGENT",
      subscriptionTier: newTier,
    },
  });

  logger.info(
    { userId, newTier },
    "[TierManager] User promoted to AGENT (CLIENT → AGENT)"
  );

  // NO actualizar metadata (patrón SSOT)
}

/**
 * Downgrade a FREE (cancelación de suscripción)
 *
 * IMPORTANTE: Mantiene el role AGENT (no lo degrada a CLIENT)
 * Los vendedores siguen siendo vendedores, solo con límites FREE
 *
 * @param userId - ID del usuario
 * @param reason - Razón del downgrade (para logs)
 *
 * @example
 * await downgradeToFree(userId, 'stripe_webhook_subscription_cancelled');
 */
export async function downgradeToFree(
  userId: string,
  reason: string = "subscription_cancelled"
): Promise<void> {
  await setUserTier(userId, "FREE", reason);

  logger.warn(
    { userId, reason },
    "[TierManager] User downgraded to FREE tier"
  );

  // Mantener el role AGENT (no degradar a CLIENT)
  // Los vendedores solo pierden privilegios, no su estatus
}

/**
 * SOLO PARA DESARROLLO/TESTING
 *
 * Verifica si hay desincronización entre metadata y DB
 * En producción, esto SIEMPRE debería retornar 0 (metadata ignorado)
 *
 * @returns Número de usuarios con metadata != DB tier
 */
export async function checkMetadataSync(): Promise<number> {
  // Esta función es solo para diagnóstico
  // NO debe usarse para sincronizar (metadata debe ignorarse)

  const rawQuery = `
    SELECT COUNT(*) as count
    FROM public.users u
    JOIN auth.users a ON a.id::text = u.id::text
    WHERE a.raw_user_meta_data->>'plan' IS NOT NULL
      AND UPPER(a.raw_user_meta_data->>'plan') != u.subscription_tier::text
  `;

  const result = await db.$queryRawUnsafe<{ count: bigint }[]>(rawQuery);
  const count = Number(result[0]?.count || 0);

  if (count > 0) {
    logger.warn(
      { mismatchCount: count },
      "[TierManager] Metadata-DB mismatch detected (expected in SSOT pattern)"
    );
  }

  return count;
}
