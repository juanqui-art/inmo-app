/**
 * useSearchInputAnimation - Focus/Blur animations with GSAP
 *
 * PATTERN: Custom Hook for Side Effects (Animations)
 *
 * WHY this approach?
 * - Encapsulated: Animations isolated
 * - Reusable: Apply to any input field
 * - Optional: Easy to remove/disable
 */

import { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function useSearchInputAnimation(
  inputRef: RefObject<HTMLInputElement | null>,
  formRef: RefObject<HTMLFormElement | null>,
) {
  useGSAP(
    () => {
      const input = inputRef.current;
      if (!input) return;

      const handleFocus = () => {
        gsap.to(input, {
          scale: 1.02,
          boxShadow:
            "0 0 0 4px rgba(255, 255, 255, 0.2), 0 20px 40px rgba(0, 0, 0, 0.3)",
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const handleBlur = () => {
        gsap.to(input, {
          scale: 1,
          boxShadow:
            "0 0 0 0px rgba(255, 255, 255, 0), 0 4px 12px rgba(0, 0, 0, 0.1)",
          duration: 0.3,
          ease: "power2.out",
        });
      };

      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);

      return () => {
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
      };
    },
    { scope: formRef },
  );
}
