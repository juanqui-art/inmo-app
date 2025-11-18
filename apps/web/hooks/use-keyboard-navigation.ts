/**
 * useKeyboardNavigation - Handle arrow keys and Enter/Escape
 *
 * PATTERN: Custom Hook for Keyboard Events
 *
 * WHY this approach?
 * - Reusable: Use with any dropdown/menu
 * - Testable: Logic isolated from component
 * - Accessible: Full keyboard support
 */

import { useCallback, useState } from "react";

export function useKeyboardNavigation(itemCount: number) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (itemCount === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : prev));
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;

        case "Escape":
          e.preventDefault();
          setSelectedIndex(-1);
          break;

        default:
          break;
      }
    },
    [itemCount],
  );

  const resetSelection = useCallback(() => {
    setSelectedIndex(-1);
  }, []);

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    resetSelection,
  };
}
