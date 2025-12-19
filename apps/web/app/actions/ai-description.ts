"use server";

/**
 * AI Property Description Generator
 * 
 * Generates professional property descriptions using OpenAI.
 * Only available for BUSINESS and PRO tiers.
 */

import { getOpenAIClient } from "@/lib/ai/openai-client";
import { getCurrentUser } from "@/lib/auth";
import { enforceRateLimit, isRateLimitError } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";
import type { SubscriptionTier } from "@repo/database";

interface PropertyData {
  title?: string;
  transactionType: "SALE" | "RENT";
  category: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address?: string;
  city?: string;
  amenities: string[];
  price?: number;
}

interface GenerateDescriptionResult {
  success: boolean;
  description?: string;
  error?: string;
}

/**
 * Check if user's tier allows AI description generation
 */
function canUseAIDescription(tier: SubscriptionTier): boolean {
  return tier === "BUSINESS" || tier === "PRO";
}

/**
 * Build the prompt for property description
 */
function buildDescriptionPrompt(data: PropertyData): string {
  const transactionText = data.transactionType === "SALE" ? "venta" : "alquiler";
  const categoryMap: Record<string, string> = {
    HOUSE: "casa",
    APARTMENT: "apartamento",
    SUITE: "suite",
    VILLA: "villa",
    PENTHOUSE: "penthouse",
    DUPLEX: "dúplex",
    LOFT: "loft",
    LAND: "terreno",
    COMMERCIAL: "local comercial",
    OFFICE: "oficina",
    WAREHOUSE: "bodega",
    FARM: "finca",
  };
  const categoryText = categoryMap[data.category] || data.category.toLowerCase();
  
  const amenitiesText = data.amenities.length > 0 
    ? `Amenidades: ${data.amenities.join(", ")}.`
    : "";

  const locationText = data.city ? `Ubicación: ${data.city}.` : "";
  const priceText = data.price ? `Precio: $${data.price.toLocaleString()}.` : "";

  return `Genera una descripción profesional y atractiva para una propiedad inmobiliaria en Ecuador.

DATOS DE LA PROPIEDAD:
- Tipo: ${categoryText} en ${transactionText}
- Habitaciones: ${data.bedrooms}
- Baños: ${data.bathrooms}
- Área: ${data.area}m²
${locationText}
${priceText}
${amenitiesText}

INSTRUCCIONES:
1. Escribe en español de Ecuador
2. Máximo 150 palabras
3. Tono profesional pero cercano
4. Destaca las características principales
5. Incluye un llamado a la acción al final
6. NO inventes datos que no estén en la información proporcionada
7. Usa emojis moderadamente (máximo 3)

FORMATO:
Devuelve SOLO la descripción, sin títulos ni encabezados.`;
}

/**
 * Generate AI property description
 */
export async function generatePropertyDescription(
  data: PropertyData
): Promise<GenerateDescriptionResult> {
  try {
    // 1. Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Debes iniciar sesión" };
    }

    // 2. Verificar tier
    if (!canUseAIDescription(user.subscriptionTier)) {
      return { 
        success: false, 
        error: "Las descripciones con IA están disponibles desde el plan Business" 
      };
    }

    // 3. Rate limiting
    try {
      await enforceRateLimit({ userId: user.id, tier: "ai-search" });
    } catch (error) {
      if (isRateLimitError(error)) {
        logger.warn({ userId: user.id }, "[AI Description] Rate limit exceeded");
        return { success: false, error: error.message };
      }
      throw error;
    }

    // 4. Get OpenAI client
    const openai = await getOpenAIClient();

    // 5. Generate description
    const prompt = buildDescriptionPrompt(data);

    logger.info({ userId: user.id }, "[AI Description] Generating description");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en marketing inmobiliario en Ecuador. Generas descripciones profesionales y atractivas para propiedades."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const description = response.choices[0]?.message?.content?.trim();

    if (!description) {
      logger.error({ userId: user.id }, "[AI Description] Empty response from OpenAI");
      return { success: false, error: "No se pudo generar la descripción" };
    }

    logger.info(
      { userId: user.id, descriptionLength: description.length },
      "[AI Description] Description generated successfully"
    );

    return { success: true, description };

  } catch (error) {
    logger.error({ err: error }, "[AI Description] Error generating description");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al generar descripción"
    };
  }
}
