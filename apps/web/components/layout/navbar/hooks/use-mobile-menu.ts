/**
 * Mobile Menu Hook
 *
 * Manages mobile menu state and body scroll lock
 * - Toggle open/close state
 * - Lock body scroll when menu is open (accessibility)
 */

"use client";

import { useState } from "react";

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Toggle mobile menu
   * ACCESSIBILITY: Locks body scroll when menu is open
   */
  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    // Prevent body scroll when menu is open
    if (newState) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  /**
   * Close mobile menu explicitly
   */
  const close = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
  };

  /**
   * Open mobile menu explicitly
   */
  const open = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  return {
    isOpen,
    toggle,
    close,
    open,
  };
}
