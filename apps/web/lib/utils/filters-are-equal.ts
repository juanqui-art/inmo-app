import { PropertyFilters } from "@repo/database";

/**
 * Compares two PropertyFilters objects to see if they are functionally equal.
 *
 * This function is crucial for preventing unnecessary re-renders and URL updates.
 * It performs a deep comparison of the filter values, accounting for the fact
 * that objects and arrays might have different references but the same content.
 *
 * @param a The first filters object.
 * @param b The second filters object, often parsed from URLSearchParams.
 * @returns True if the filters are equal, false otherwise.
 */
export function propertyFiltersAreEqual(
  a: Partial<PropertyFilters>,
  b: Record<string, any>,
): boolean {
  const aKeys = Object.keys(a).filter(
    (key) => a[key as keyof typeof a] !== undefined && a[key as keyof typeof a] !== null && a[key as keyof typeof a] !== "",
  );

  for (const key of aKeys) {
    const keyA = key as keyof PropertyFilters;
    const valueA = a[keyA];
    let valueB = b[keyA];

    // Type coercion for values from URL search params which are strings
    if (typeof valueA === "number") {
      valueB = Number(valueB);
    }
    
    if (Array.isArray(valueA)) {
      const bArray = Array.isArray(valueB) ? valueB : [valueB];
      if (valueA.length !== bArray.length || !valueA.every((val) => bArray.includes(val))) {
        return false;
      }
    } else if (valueA !== valueB) {
      return false;
    }
  }

  return true;
}
