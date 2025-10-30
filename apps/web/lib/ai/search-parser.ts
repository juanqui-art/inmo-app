/**
 * AI Search Parser
 *
 * Uses OpenAI to extract structured search parameters from natural language queries.
 * Contextual to Ecuador/Cuenca real estate market.
 *
 * Input: "Casa moderna en Cuenca con 3 habitaciones y bajo $200k"
 * Output: { location: "Cuenca", bedrooms: 3, maxPrice: 200000, features: ["moderna"] }
 */

import OpenAI from "openai";
import {
  validateLocation,
  getAvailableCitiesForPrompt,
} from "./location-validator";

interface SearchFilters {
  city?: string; // City (Cuenca, Gualaceo, Paute, etc.)
  address?: string; // Specific address or neighborhood
  category?: "casa" | "apartamento" | "suite" | "terreno" | "local"; // Property type
  minPrice?: number; // Minimum price in USD
  maxPrice?: number; // Maximum price in USD
  bedrooms?: number; // Number of bedrooms
  bathrooms?: number; // Number of bathrooms
  features?: string[]; // Additional features (garaje, jardín, piscina, etc.)
  amenities?: string[]; // Amenities (furnished, unfurnished, etc.)
  transactionType?: "VENTA" | "ARRIENDO"; // Sale or rental
  reasoning?: string; // Chain-of-thought explanation for debugging
}

interface LocationValidation {
  isValid: boolean;
  requestedLocation: string;
  matchedCity?: string;
  suggestedCities?: string[];
  confidence: number;
  message?: string;
}

interface ParseResult {
  success: boolean;
  filters: SearchFilters;
  rawQuery: string;
  confidence: number; // 0-100
  error?: string;
  locationValidation?: LocationValidation; // NEW: Validation result
}

/**
 * Generate dynamic system prompt with available cities
 * IMPROVEMENTS (v2 - based on industry best practices):
 * - Dynamic city list injection (prevents hallucination)
 * - Strict location validation rules (inspired by Zillow)
 * - LLM-as-a-Judge framework (AWS QnA)
 * - Improved disambiguation techniques
 * - Out-of-scope location handling
 *
 * @param availableCities - Comma-separated list of cities in inventory
 */
function generateSystemPrompt(availableCities: string): string {
  return `You are an expert real estate search assistant for the Ecuador market, specifically Cuenca and surrounding areas. Your expertise includes understanding local market context, price ranges, and property terminology.

**CRITICAL: LOCATION SCOPE VALIDATION**
You have access to properties ONLY in these cities:
${availableCities}

If a user requests a location NOT in this list (e.g., "Quito", "Guayaquil", "Loja"), you MUST:
1. Set confidence to 0-20 (very low)
2. Include a "locationError" field in reasoning explaining the mismatch
3. Do NOT hallucinate properties in unavailable locations
4. Suggest the closest available city if possible

YOUR TASK: Extract structured search parameters from natural language queries in Spanish.

THINK STEP BY STEP (Chain-of-Thought):
1. IDENTIFY LOCATION: **STRICTLY VALIDATE** against available cities list
   - FIRST: Check if mentioned city is in available cities list: ${availableCities}
   - If city is NOT in list: Set confidence to 0-20 and flag as "locationError"
   - Explicit matches: "en Cuenca", "Gualaceo", "Paute", "Azogues"
   - Neighborhood/address clues: "El Ejido", "centro", "Totoracocha" (these belong to Cuenca)
   - Default: If NO location specified AND no error → default to "Cuenca"
   - NEVER default to Cuenca if user explicitly requested an unavailable city

2. IDENTIFY PROPERTY TYPE: Determine the category
   - "casa" = Single-family house, standalone building
   - "apartamento" = Multi-unit building, shared walls (most common in Cuenca)
   - "suite" = Studio or small apartment, usually furnished
   - "terreno" = Land only, no structures
   - "local" = Commercial space, business use only
   - If ambiguous: Assume "apartamento" (most common)

3. IDENTIFY PRICE CONSTRAINTS: Extract min/max in USD
   - "bajo $100k" → maxPrice: 100000
   - "$200k a $300k" → minPrice: 200000, maxPrice: 300000
   - "presupuesto $500k" → maxPrice: 500000
   - If price seems extreme (< $10k or > $1M), likely parsing error → set to null

4. IDENTIFY BEDROOMS/BATHROOMS: Look for "X habitaciones", "X cuartos", "X baños"
   - Valid range: 0-10 (0 = studio/suite)
   - Default: null (don't infer)

5. DISTINGUISH FEATURES vs AMENITIES:
   - FEATURES (physical structure): "garaje", "jardín", "piscina", "balcón", "pasillos amplios"
   - AMENITIES (furnished state): "amueblado", "sin amueblar", "con electrodomésticos"
   - STYLE DESCRIPTORS (not filters): "moderno", "colonial", "lujoso", "acomodado"
     → Can boost confidence but don't filter by these

6. IDENTIFY TRANSACTION TYPE: Sale or Rental
   - Rental hints: "arriendo", "alquiler", "renta", "inquilino"
   - Sale hints: "venta", "vendo", "compra"
   - Default: "VENTA" (sales are more common)

7. ASSESS CONFIDENCE: Rate how clear the query was
   - 90-100: Clear and specific ("Casa 3 habitaciones, $150k, Cuenca")
   - 70-89: Mostly clear with minor ambiguity ("Apartamento grande bajo $200k")
   - 50-69: Some ambiguity ("Casa acomodada" - unclear bedrooms/price)
   - 30-49: Significant ambiguity ("Algo grande y cerca servicios")
   - < 30: Too vague to safely filter

VALIDATION RULES (CRITICAL):
- minPrice, maxPrice: Must be in range $10,000 - $1,000,000 USD
  (Outside this = parsing error, return null for that field)
- bedrooms, bathrooms: Must be 0-10
  (Outside this = parsing error, return null)
- confidence: Must be 0-100
- If query is too vague (confidence < 30): Return mostly null fields with warning

LOCATION CONTEXT (Ecuador):
- MAIN CITY: "Cuenca" (default if not specified)
- CUENCA NEIGHBORHOODS:
  * Centro: "Zona Centro", "El Centro", "Centro histórico"
  * North: "El Ejido", "Ejido Norte", "zona norte"
  * South: "Belén", "Totoracocha", "zona sur"
  * East: "Estadio", "Machangara", "zona este"
  * West: "Monay", "Hermano Miguel", "zona oeste"
- NEARBY CITIES: "Gualaceo" (20km), "Paute" (30km), "Azogues" (25km)
- FUZZY MATCH HINTS:
  * "Cueca" → "Cuenca" (typo)
  * "El Ejdo" → "El Ejido" (abbreviation)
  * "San Blas" → "Zona Centro" (neighborhood context)

SEMANTIC INTERPRETATION:
- "residencial" + "familiar" → Likely 3+ bedrooms, safe neighborhood
- "céntrico", "centro" → High price expectations, walkable location
- "tranquilo", "apartado" → Suburban/outlying area
- "de lujo", "lujoso" → High-end property, high price (not a filter, boost confidence)

EXAMPLE OUTPUTS:

Input: "Casa moderna en Cuenca con 3 habitaciones bajo $200k"
Reasoning: "Found city=Cuenca, category=casa (explicit), bedrooms=3, maxPrice=200k, features=[moderna]. Clear query."
Output: {"city":"Cuenca","category":"casa","bedrooms":3,"maxPrice":200000,"features":["moderna"],"transactionType":"VENTA","confidence":95,"reasoning":"..."}

Input: "Apartamento arriendo centro con garaje"
Reasoning: "No city specified, default to Cuenca. transaction=ARRIENDO (arriendo hint), address=Zona Centro (centro → Zona Centro), features=[garaje]. No price or bedrooms specified."
Output: {"city":"Cuenca","address":"Zona Centro","category":"apartamento","features":["garaje"],"transactionType":"ARRIENDO","confidence":85,"reasoning":"..."}

Input: "Suite amueblada El Ejido"
Reasoning: "category=suite (explicit), address=El Ejido, amenities=[amueblado]. Low confidence because no price/bedrooms."
Output: {"address":"El Ejido","category":"suite","amenities":["amueblado"],"transactionType":"VENTA","confidence":70,"reasoning":"..."}

Input: "Casa grande y acomodada, cerca servicios, zona bonita"
Reasoning: "Too vague: 'grande', 'acomodada', 'bonita' are style descriptors, not filters. No specific price, bedrooms, location. Low confidence."
Output: {"city":"Cuenca","confidence":25,"reasoning":"Query too vague - no specific filters found","reason":"Query lacks specific criteria"}

OUTPUT FORMAT:
Always return a valid JSON object with ONLY these fields (use null for missing):
{
  "city": string or null,
  "address": string or null,
  "category": string or null (must be one of: casa, apartamento, suite, terreno, local),
  "minPrice": number or null,
  "maxPrice": number or null,
  "bedrooms": number or null,
  "bathrooms": number or null,
  "features": array of strings (physical features) or empty array,
  "amenities": array of strings (furnished state) or empty array,
  "transactionType": "VENTA" or "ARRIENDO" or null,
  "confidence": number (0-100),
  "reasoning": string (brief explanation of extraction logic)
}

IMPORTANT:
1. Return ONLY valid JSON (no markdown, no explanations before/after)
2. Do NOT include null fields - use empty arrays for features/amenities if none found
3. Always include reasoning for debugging
4. If confidence is very low (<30), still return the JSON but with mostly null fields
5. **CRITICAL**: Never hallucinate prices, bedrooms, or locations not mentioned in the query
6. **CRITICAL**: ONLY return cities from the available cities list: ${availableCities}
7. **CRITICAL**: If user requests unavailable city, set confidence to 0-20 and explain in reasoning`;
}


/**
 * Parse a natural language search query using OpenAI
 * @param query - User's natural language search query
 * @returns Structured search filters
 */
export async function parseSearchQuery(query: string): Promise<ParseResult> {
  try {
    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        filters: {},
        rawQuery: query,
        confidence: 0,
        error: "OPENAI_API_KEY not configured. Add it to your .env.local file.",
      };
    }

    // Get available cities for prompt injection
    const availableCities = await getAvailableCitiesForPrompt();
    const systemPrompt = generateSystemPrompt(availableCities);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
    });

    // Call OpenAI with the user's query
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model: ~$0.15/1M input tokens, ~$0.60/1M output tokens
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 500, // gpt-4o-mini uses standard max_tokens parameter
    });

    // Extract the response content
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        filters: {},
        rawQuery: query,
        confidence: 0,
        error: "No response from OpenAI",
      };
    }

    // Parse the JSON response
    let parsedFilters: SearchFilters & { confidence?: number };
    try {
      // Clean up the response in case it has markdown or extra formatting
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedFilters = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      return {
        success: false,
        filters: {},
        rawQuery: query,
        confidence: 0,
        error: `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
      };
    }

    // Extract confidence, reasoning, and other filters
    const confidence = parsedFilters.confidence || 75;
    const reasoning = parsedFilters.reasoning || "";
    const { confidence: _, reasoning: __, ...filters } = parsedFilters;

    // VALIDATION: Validate price ranges ($10k - $1M for Ecuador market)
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      if (filters.minPrice < 10000 || filters.minPrice > 1000000) {
        console.warn(
          `Price validation: minPrice ${filters.minPrice} outside acceptable range [$10k-$1M], setting to null`,
        );
        filters.minPrice = undefined;
      }
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      if (filters.maxPrice < 10000 || filters.maxPrice > 1000000) {
        console.warn(
          `Price validation: maxPrice ${filters.maxPrice} outside acceptable range [$10k-$1M], setting to null`,
        );
        filters.maxPrice = undefined;
      }
    }

    // VALIDATION: Validate bedrooms/bathrooms (0-10 range)
    if (
      filters.bedrooms !== undefined &&
      filters.bedrooms !== null &&
      (filters.bedrooms < 0 || filters.bedrooms > 10)
    ) {
      console.warn(
        `Bedroom validation: ${filters.bedrooms} outside acceptable range [0-10], setting to null`,
      );
      filters.bedrooms = undefined;
    }

    if (
      filters.bathrooms !== undefined &&
      filters.bathrooms !== null &&
      (filters.bathrooms < 0 || filters.bathrooms > 10)
    ) {
      console.warn(
        `Bathroom validation: ${filters.bathrooms} outside acceptable range [0-10], setting to null`,
      );
      filters.bathrooms = undefined;
    }

    // VALIDATION: Validate location against available cities (NEW in v2)
    let locationValidation: LocationValidation | undefined;
    let finalConfidence = confidence;

    if (filters.city) {
      locationValidation = await validateLocation(filters.city);

      // Adjust confidence based on location validation
      if (!locationValidation.isValid) {
        // Location doesn't exist - severely penalize confidence
        finalConfidence = Math.min(confidence, 20);
        console.warn(
          `⚠️  Location validation failed: "${filters.city}" not in inventory. ${locationValidation.message}`,
        );
      } else if (
        locationValidation.matchedCity &&
        locationValidation.matchedCity !== filters.city
      ) {
        // Location was fuzzy-matched - slightly reduce confidence
        finalConfidence = Math.min(
          confidence,
          locationValidation.confidence || 85,
        );
        // Update city to matched city
        filters.city = locationValidation.matchedCity;
        console.log(
          `✓ Location fuzzy-matched: "${filters.city}" → "${locationValidation.matchedCity}"`,
        );
      }
    }

    console.log("🧠 AI Parse Result:", {
      query,
      confidence: finalConfidence,
      reasoning,
      filters,
      locationValidation,
    });

    return {
      success: true,
      filters,
      rawQuery: query,
      confidence: finalConfidence,
      locationValidation,
    };
  } catch (error) {
    console.error("Error in parseSearchQuery:", error);
    return {
      success: false,
      filters: {},
      rawQuery: query,
      confidence: 0,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred while parsing search query",
    };
  }
}

/**
 * Validate if the parsed filters have minimum confidence threshold
 * @param result - Result from parseSearchQuery
 * @param minConfidence - Minimum confidence threshold (default: 50)
 * @returns true if confidence meets threshold
 */
export function isConfidentParse(
  result: ParseResult,
  minConfidence: number = 50,
): boolean {
  return result.success && result.confidence >= minConfidence;
}

/**
 * Fuzzy matching for city/neighborhood names
 * Handles typos and abbreviations using simple string similarity
 * Examples: "Cueca" → "Cuenca", "El Ejdo" → "El Ejido"
 */
function fuzzyMatchLocation(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const normalized = input.toLowerCase().trim();

  // Define known cities and neighborhoods with fuzzy match variants
  const locationMap: Record<string, string> = {
    // CITIES
    cuenca: "Cuenca",
    cueca: "Cuenca", // Common typo
    gualaceo: "Gualaceo",
    gualacéo: "Gualaceo", // Accent variant
    paute: "Paute",
    azogues: "Azogues",

    // NEIGHBORHOODS (Cuenca)
    "el ejido": "El Ejido",
    "el ejdo": "El Ejido", // Abbreviation
    ejido: "El Ejido",
    "zona centro": "Zona Centro",
    "el centro": "Zona Centro",
    centro: "Zona Centro",
    "centro histórico": "Zona Centro",
    estadio: "Estadio",
    belén: "Belén",
    belen: "Belén", // No accent variant
    totoracocha: "Totoracocha",
    monay: "Monay",
    "hermano miguel": "Hermano Miguel",
    machangara: "Machangara",

    // DIRECTIONS
    norte: "Zona Norte",
    sur: "Zona Sur",
    este: "Zona Este",
    oeste: "Zona Oeste",
    "zona norte": "Zona Norte",
    "zona sur": "Zona Sur",
    "zona este": "Zona Este",
    "zona oeste": "Zona Oeste",

    // LANDMARKS/DESCRIPTORS
    "san blas": "Zona Centro", // Common reference to downtown
    "calle larga": "Zona Centro",
  };

  // Direct match
  if (locationMap[normalized]) {
    return locationMap[normalized];
  }

  // Partial match (for abbreviations/typos)
  const words = normalized.split(" ");
  if (words.length === 1) {
    // Single word - try to find partial matches
    const input_word = words[0];
    for (const [key, value] of Object.entries(locationMap)) {
      const keyWords = key.split(" ");
      // If first word matches, return the mapped value
      if (keyWords[0] === input_word) {
        return value;
      }
    }
  }

  // No match found - return original input
  return input;
}

/**
 * Map OpenAI category responses to Prisma PropertyCategory enum values
 * OpenAI returns Spanish lowercase: "casa", "apartamento", etc.
 * Prisma expects English uppercase: "HOUSE", "APARTMENT", etc.
 */
function mapCategoryToEnum(
  category: string,
):
  | "HOUSE"
  | "APARTMENT"
  | "SUITE"
  | "VILLA"
  | "PENTHOUSE"
  | "DUPLEX"
  | "LOFT"
  | "LAND"
  | "COMMERCIAL"
  | "OFFICE"
  | "WAREHOUSE"
  | "FARM"
  | undefined {
  const categoryMap: Record<string, any> = {
    casa: "HOUSE",
    house: "HOUSE",
    apartamento: "APARTMENT",
    apartment: "APARTMENT",
    apto: "APARTMENT",
    departamento: "APARTMENT",
    suite: "SUITE",
    villa: "VILLA",
    penthouse: "PENTHOUSE",
    duplex: "DUPLEX",
    loft: "LOFT",
    terreno: "LAND",
    land: "LAND",
    lote: "LAND",
    local: "COMMERCIAL",
    commercial: "COMMERCIAL",
    "local comercial": "COMMERCIAL",
    oficina: "OFFICE",
    office: "OFFICE",
    bodega: "WAREHOUSE",
    warehouse: "WAREHOUSE",
    finca: "FARM",
    farm: "FARM",
    hacienda: "FARM",
  };

  const normalized = category.toLowerCase().trim();
  return categoryMap[normalized];
}

/**
 * Map OpenAI transaction type responses to Prisma TransactionType enum values
 * OpenAI returns Spanish: "VENTA", "ARRIENDO"
 * Prisma expects: "SALE", "RENT"
 */
function mapTransactionTypeToEnum(type: string): "SALE" | "RENT" | undefined {
  const typeMap: Record<string, any> = {
    venta: "SALE",
    sale: "SALE",
    vendo: "SALE",
    compra: "SALE",
    arriendo: "RENT",
    rent: "RENT",
    arrendamiento: "RENT",
    renta: "RENT",
    alquiler: "RENT",
  };

  const normalized = type.toLowerCase().trim();
  return typeMap[normalized];
}

/**
 * Format filters for database query
 * Useful for converting AI-extracted filters to Prisma filter format
 * @param filters - Parsed search filters
 * @returns Prisma filter object
 */
export function filtersToWhereClause(filters: SearchFilters) {
  const where: any = {};

  // City filter with fuzzy matching
  if (filters.city) {
    const matchedCity = fuzzyMatchLocation(filters.city);
    where.city = {
      contains: matchedCity || filters.city,
      mode: "insensitive",
    };
  }

  // Address/neighborhood filter with fuzzy matching
  if (filters.address) {
    const matchedAddress = fuzzyMatchLocation(filters.address);
    where.address = {
      contains: matchedAddress || filters.address,
      mode: "insensitive",
    };
  }

  // Category filter - map Spanish lowercase to English uppercase enum
  if (filters.category) {
    const mappedCategory = mapCategoryToEnum(filters.category);
    if (mappedCategory) {
      where.category = mappedCategory;
    }
  }

  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  // Bedrooms filter
  if (filters.bedrooms) {
    where.bedrooms = filters.bedrooms;
  }

  // Bathrooms filter
  if (filters.bathrooms) {
    where.bathrooms = filters.bathrooms;
  }

  // Transaction type - map Spanish to English enum values
  if (filters.transactionType) {
    const mappedType = mapTransactionTypeToEnum(filters.transactionType);
    if (mappedType) {
      where.transactionType = mappedType;
    }
  }

  // Note: Features and amenities would require parsing the property description
  // For now, we focus on structured fields. Full-text search can be added later.

  return where;
}
