/**
 * AI Search Server Action
 *
 * Handles natural language search queries from the frontend.
 * 1. Parses the query with OpenAI
 * 2. Extracts search filters (location, price, features, etc.)
 * 3. Queries the database with those filters
 * 4. Returns matching properties
 */

"use server";

import { parseSearchQuery, isConfidentParse, filtersToWhereClause } from "@/lib/ai/search-parser";
import { db } from "@repo/database";

export interface AISearchResult {
  success: boolean;
  properties?: Array<{
    id: string;
    title: string;
    description?: string | null;
    price: number;
    city?: string | null;
    address?: string | null;
    category: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    latitude?: number | null;
    longitude?: number | null;
  }>;
  query: string;
  filterSummary?: {
    city?: string;
    address?: string;
    category?: string;
    priceRange?: string;
    bedrooms?: number;
    features?: string[];
  };
  totalResults?: number;
  confidence?: number;
  error?: string;
}

/**
 * Main AI search action
 * Called from the frontend when user submits a natural language query
 */
export async function aiSearchAction(query: string): Promise<AISearchResult> {
  try {
    // Validate input
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        query,
        error: "Search query cannot be empty",
      };
    }

    // Limit query length to prevent abuse
    if (query.length > 500) {
      return {
        success: false,
        query,
        error: "Search query is too long (max 500 characters)",
      };
    }

    console.log("🔍 AI Search Query:", query);

    // Parse the natural language query
    const parseResult = await parseSearchQuery(query);

    if (!parseResult.success) {
      console.error("❌ Parse failed:", parseResult.error);
      return {
        success: false,
        query,
        error: parseResult.error || "Failed to parse search query",
      };
    }

    console.log("✅ Parsed filters:", parseResult.filters);
    console.log("📊 Confidence:", parseResult.confidence);

    // Check if we have enough confidence in the parsing
    // Threshold: 30% (balanced approach)
    // - < 30%: Very ambiguous, likely to return poor results
    // - 30-50%: Acceptable, proceed with warning
    // - > 50%: Good confidence
    const MIN_CONFIDENCE_THRESHOLD = 30;
    const WARN_CONFIDENCE_THRESHOLD = 50;

    if (!isConfidentParse(parseResult, MIN_CONFIDENCE_THRESHOLD)) {
      console.error(
        `❌ Query confidence ${parseResult.confidence}% is below minimum threshold (${MIN_CONFIDENCE_THRESHOLD}%)`
      );
      return {
        success: false,
        query,
        confidence: parseResult.confidence,
        error: `Your search is too vague (confidence: ${parseResult.confidence}%). Please be more specific (e.g., "3 bedroom apartment under $200k in Cuenca")`,
      };
    }

    if (parseResult.confidence < WARN_CONFIDENCE_THRESHOLD) {
      console.warn(
        `⚠️ Low confidence parse (${parseResult.confidence}% < ${WARN_CONFIDENCE_THRESHOLD}%). Results may be incomplete.`
      );
    }

    // Convert parsed filters to Prisma WHERE clause
    const whereClause = filtersToWhereClause(parseResult.filters);

    console.log("🔧 Prisma WHERE clause:", JSON.stringify(whereClause, null, 2));

    // Query the database
    const properties = await db.property.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        city: true,
        address: true,
        category: true,
        bedrooms: true,
        bathrooms: true,
        latitude: true,
        longitude: true,
      },
      take: 50, // Limit results
    });

    console.log(`✅ Found ${properties.length} properties`);

    // Convert Decimal types to numbers and format the response
    const formattedProperties = properties.map((prop) => ({
      ...prop,
      price: typeof prop.price === "number" ? prop.price : parseFloat(prop.price.toString()),
      bathrooms: prop.bathrooms ? parseFloat(prop.bathrooms.toString()) : undefined,
      latitude: prop.latitude ? parseFloat(prop.latitude.toString()) : undefined,
      longitude: prop.longitude ? parseFloat(prop.longitude.toString()) : undefined,
    }));

    // Create a human-readable summary of the filters used
    const filterSummary: AISearchResult["filterSummary"] = {};
    if (parseResult.filters.city) filterSummary.city = parseResult.filters.city;
    if (parseResult.filters.address) filterSummary.address = parseResult.filters.address;
    if (parseResult.filters.category) filterSummary.category = parseResult.filters.category;
    if (parseResult.filters.minPrice || parseResult.filters.maxPrice) {
      const min = parseResult.filters.minPrice
        ? `$${(parseResult.filters.minPrice / 1000).toFixed(0)}k`
        : "";
      const max = parseResult.filters.maxPrice
        ? `$${(parseResult.filters.maxPrice / 1000).toFixed(0)}k`
        : "";
      filterSummary.priceRange = `${min}${min && max ? " - " : ""}${max}`;
    }
    if (parseResult.filters.bedrooms) filterSummary.bedrooms = parseResult.filters.bedrooms;
    if (parseResult.filters.features) filterSummary.features = parseResult.filters.features;

    return {
      success: true,
      properties: formattedProperties,
      query,
      filterSummary,
      totalResults: formattedProperties.length,
      confidence: parseResult.confidence,
    };
  } catch (error) {
    console.error("❌ AI Search Error:", error);
    return {
      success: false,
      query,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during search",
    };
  }
}
