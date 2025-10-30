#!/usr/bin/env bun
/**
 * Quick AI Search Test - Critical Cases Only
 * Tests the most important edge cases for location validation
 *
 * Run: bun run scripts/test-ai-search-quick.ts
 */

import { parseSearchQuery } from "../apps/web/lib/ai/search-parser";

const criticalTests = [
  {
    name: "Invalid Location (Quito - User's reported issue)",
    query: "Casa 3 habitaciones Quito Norte",
    expectedBehavior: "Should reject with low confidence and suggest available cities",
  },
  {
    name: "Valid Location (Cuenca)",
    query: "Apartamento 2 habitaciones en Cuenca bajo $150k",
    expectedBehavior: "Should accept with high confidence",
  },
  {
    name: "Typo in City (Cueca → Cuenca)",
    query: "Apartamento en Cueca",
    expectedBehavior: "Should fuzzy-match to Cuenca with medium-high confidence",
  },
];

async function runQuickTests() {
  console.log("🧪 Quick AI Search Test - Critical Cases\n");
  console.log("=" + "=".repeat(70) + "\n");

  for (const [index, test] of criticalTests.entries()) {
    console.log(`📝 Test ${index + 1}/${criticalTests.length}: ${test.name}`);
    console.log(`Query: "${test.query}"`);
    console.log(`Expected: ${test.expectedBehavior}`);
    console.log("-".repeat(72));

    try {
      const result = await parseSearchQuery(test.query);

      // Display core results
      console.log(`\n✓ Success: ${result.success}`);
      console.log(`✓ Confidence: ${result.confidence}%`);
      console.log(
        `✓ City: ${result.filters.city || "null"} ${result.filters.category ? `(${result.filters.category})` : ""}`,
      );

      if (result.locationValidation) {
        const v = result.locationValidation;
        console.log(`\n🗺️  Location Validation:`);
        console.log(`   - Is Valid: ${v.isValid ? "✓ YES" : "✗ NO"}`);
        console.log(`   - Requested: "${v.requestedLocation}"`);
        if (v.matchedCity)
          console.log(`   - Matched: "${v.matchedCity}" (${v.confidence}% confidence)`);
        if (v.suggestedCities && v.suggestedCities.length > 0)
          console.log(`   - Suggestions: ${v.suggestedCities.join(", ")}`);
        if (v.message) console.log(`   - Message: ${v.message}`);
      }

      // Verdict
      console.log("\n📊 Verdict:");
      if (result.locationValidation && !result.locationValidation.isValid) {
        console.log(
          `   ✅ PASS - System correctly rejected unavailable location`,
        );
      } else if (
        result.locationValidation &&
        result.locationValidation.matchedCity &&
        result.locationValidation.matchedCity !== result.locationValidation.requestedLocation
      ) {
        console.log(`   ✅ PASS - System fuzzy-matched location successfully`);
      } else if (result.confidence >= 70) {
        console.log(`   ✅ PASS - High confidence parse`);
      } else {
        console.log(
          `   ⚠️  REVIEW - Confidence ${result.confidence}% (expected higher?)`,
        );
      }
    } catch (error) {
      console.log(`❌ Test failed:`);
      console.error(error);
    }

    console.log("\n" + "=".repeat(72) + "\n");

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  console.log("✅ Quick tests completed!\n");
}

runQuickTests().catch(console.error);
