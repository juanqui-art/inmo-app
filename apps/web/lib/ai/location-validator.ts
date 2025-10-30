/**
 * Location Validator for AI Search
 *
 * Validates user-requested locations against available inventory.
 * Provides suggestions when requested location doesn't exist.
 *
 * Based on best practices from:
 * - Zillow's Natural Language Search (validates against inventory)
 * - AWS QnA LLM-as-a-Judge (disambiguation)
 */

import { PrismaClient } from "@repo/database";

interface LocationValidationResult {
  isValid: boolean;
  requestedLocation: string;
  matchedCity?: string;
  suggestedCities?: string[];
  confidence: number; // 0-100
  message?: string;
}

/**
 * Cache for available cities (refreshed periodically)
 * Prevents database query on every search
 */
let citiesCache: { cities: string[]; lastUpdated: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get available cities from database with caching
 */
async function getAvailableCities(): Promise<string[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (citiesCache && now - citiesCache.lastUpdated < CACHE_TTL) {
    return citiesCache.cities;
  }

  // Fetch from database
  const prisma = new PrismaClient();
  try {
    const cities = await prisma.property.findMany({
      where: {
        city: {
          not: null,
        },
        status: "AVAILABLE", // Only count available properties
      },
      select: {
        city: true,
      },
      distinct: ["city"],
      orderBy: {
        city: "asc",
      },
    });

    const cityList = cities
      .map((c) => c.city)
      .filter((city): city is string => city !== null);

    // Update cache
    citiesCache = {
      cities: cityList,
      lastUpdated: now,
    };

    return cityList;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Normalize location string for comparison
 * Handles accents, capitalization, common typos
 */
function normalizeLocation(location: string): string {
  return location
    .toLowerCase()
    .normalize("NFD") // Decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .trim();
}

/**
 * Calculate similarity between two strings (Levenshtein-like)
 * Returns 0-1 (1 = identical, 0 = completely different)
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeLocation(str1);
  const s2 = normalizeLocation(str2);

  // Exact match
  if (s1 === s2) return 1;

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Simple Levenshtein distance
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1, // deletion
        matrix[i]![j - 1]! + 1, // insertion
        matrix[i - 1]![j - 1]! + cost, // substitution
      );
    }
  }

  const distance = matrix[len1]![len2]!;
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

/**
 * Validate location against available cities
 * Provides fuzzy matching and suggestions
 *
 * @param requestedLocation - Location from AI parsing (e.g., "Quito", "Cuenca")
 * @returns Validation result with suggestions if location doesn't exist
 */
export async function validateLocation(
  requestedLocation: string,
): Promise<LocationValidationResult> {
  const availableCities = await getAvailableCities();

  // Check for exact match (case-insensitive, accent-insensitive)
  const normalizedRequest = normalizeLocation(requestedLocation);
  const exactMatch = availableCities.find(
    (city) => normalizeLocation(city) === normalizedRequest,
  );

  if (exactMatch) {
    return {
      isValid: true,
      requestedLocation,
      matchedCity: exactMatch,
      confidence: 100,
      message: `Location found: ${exactMatch}`,
    };
  }

  // Find similar cities (fuzzy matching)
  const similarities = availableCities.map((city) => ({
    city,
    similarity: stringSimilarity(requestedLocation, city),
  }));

  // Sort by similarity
  similarities.sort((a, b) => b.similarity - a.similarity);

  // If we have a very close match (>0.7 similarity), consider it valid
  const closeMatch = similarities[0];
  if (closeMatch && closeMatch.similarity > 0.7) {
    return {
      isValid: true,
      requestedLocation,
      matchedCity: closeMatch.city,
      confidence: Math.round(closeMatch.similarity * 100),
      message: `Location matched to: ${closeMatch.city} (${Math.round(closeMatch.similarity * 100)}% confidence)`,
    };
  }

  // Location doesn't exist - provide suggestions
  const topSuggestions = similarities
    .slice(0, 3)
    .map((s) => s.city)
    .filter((city) => city !== undefined);

  return {
    isValid: false,
    requestedLocation,
    suggestedCities: topSuggestions,
    confidence: 0,
    message: `Location "${requestedLocation}" not found in inventory. Available cities: ${availableCities.join(", ")}`,
  };
}

/**
 * Get list of available cities for prompt injection
 * This list is passed to the AI to improve location extraction
 */
export async function getAvailableCitiesForPrompt(): Promise<string> {
  const cities = await getAvailableCities();
  return cities.join(", ");
}
