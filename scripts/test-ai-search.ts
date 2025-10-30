#!/usr/bin/env bun
/**
 * Test AI Search improvements
 * Tests location validation, fuzzy matching, and disambiguation
 *
 * Run: bun run scripts/test-ai-search.ts
 */

import { parseSearchQuery } from "../apps/web/lib/ai/search-parser";

// Test queries covering edge cases
const testQueries = [
  // CASE 1: Invalid location (Quito - not in inventory)
  "Casa 3 habitaciones Quito Norte",

  // CASE 2: Valid location (Cuenca - exists in inventory)
  "Apartamento 2 habitaciones en Cuenca bajo $150k",

  // CASE 3: Valid location (Gualaceo - exists in inventory)
  "Casa en Gualaceo con jardín",

  // CASE 4: Typo in city name (fuzzy match test)
  "Apartamento en Cueca", // "Cueca" → "Cuenca"

  // CASE 5: Invalid location (Guayaquil)
  "Suite amueblada en Guayaquil",

  // CASE 6: Valid location (Paute)
  "Terreno en Paute",

  // CASE 7: Neighborhood (should map to Cuenca)
  "Casa en El Ejido con garaje",

  // CASE 8: Invalid location (Loja)
  "Apartamento barato en Loja",

  // CASE 9: No location specified (should default to Cuenca)
  "Casa moderna 4 habitaciones bajo $200k",

  // CASE 10: Valid location (Azogues)
  "Local comercial en Azogues",
];

async function runTests() {
  console.log("🧪 Testing AI Search with Location Validation\n");
  console.log("=" + "=".repeat(70) + "\n");

  for (const [index, query] of testQueries.entries()) {
    console.log(`📝 Test ${index + 1}/${testQueries.length}: "${query}"`);
    console.log("-".repeat(72));

    try {
      const result = await parseSearchQuery(query);

      // Display results
      console.log(`✓ Success: ${result.success}`);
      console.log(`✓ Confidence: ${result.confidence}%`);
      console.log(`✓ Filters:`);
      console.log(`   - City: ${result.filters.city || "null"}`);
      console.log(`   - Address: ${result.filters.address || "null"}`);
      console.log(`   - Category: ${result.filters.category || "null"}`);
      console.log(`   - Bedrooms: ${result.filters.bedrooms || "null"}`);
      console.log(`   - Price: ${result.filters.minPrice || "null"} - ${result.filters.maxPrice || "null"}`);

      if (result.locationValidation) {
        console.log(`\n🗺️  Location Validation:`);
        console.log(
          `   - Is Valid: ${result.locationValidation.isValid ? "✓ YES" : "✗ NO"}`,
        );
        console.log(
          `   - Requested: ${result.locationValidation.requestedLocation}`,
        );
        if (result.locationValidation.matchedCity) {
          console.log(
            `   - Matched: ${result.locationValidation.matchedCity}`,
          );
        }
        if (result.locationValidation.suggestedCities) {
          console.log(
            `   - Suggestions: ${result.locationValidation.suggestedCities.join(", ")}`,
          );
        }
        if (result.locationValidation.message) {
          console.log(`   - Message: ${result.locationValidation.message}`);
        }
      }

      if (result.error) {
        console.log(`\n❌ Error: ${result.error}`);
      }

      // Verdict
      console.log("\n📊 Verdict:");
      if (result.locationValidation && !result.locationValidation.isValid) {
        console.log(
          `   ⚠️  INVALID LOCATION - System correctly rejected unavailable city`,
        );
      } else if (result.confidence >= 70) {
        console.log(`   ✅ HIGH CONFIDENCE - Parse looks good`);
      } else if (result.confidence >= 50) {
        console.log(`   ⚠️  MEDIUM CONFIDENCE - Some ambiguity`);
      } else {
        console.log(`   ❌ LOW CONFIDENCE - Parsing uncertain`);
      }
    } catch (error) {
      console.log(`❌ Test failed with error:`);
      console.error(error);
    }

    console.log("\n" + "=".repeat(72) + "\n");

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("✅ All tests completed!\n");
}

runTests().catch(console.error);
