"use client";

/**
 * Filter Dropdown Base Component
 *
 * Reusable dropdown component for filters
 * - Click to open/close
 * - Click outside to close
 * - Keyboard support (ESC to close)
 * - Smooth animations with Framer Motion
 * - Dark mode styling
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

interface FilterDropdownProps {
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
}

export function FilterDropdown({
  label,
  value,
  icon,
  children,
  onOpenChange,
  isOpen: controlledIsOpen,
}: FilterDropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? (v: boolean) => onOpenChange?.(v) : setInternalIsOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle keyboard
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const displayValue = value || label;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`flex h-12 items-center gap-2 px-4 py-2 rounded-full font-medium text-base transition-all duration-200 whitespace-nowrap ${
          isOpen
            ? "bg-oslo-gray-700 text-oslo-gray-50 shadow-lg shadow-oslo-gray-900/50"
            : "bg-oslo-gray-900/50 text-oslo-gray-300 border border-oslo-gray-800 hover:bg-oslo-gray-800"
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {icon && <span className="h-4 w-4 flex-shrink-0">{icon}</span>}
        <span className="truncate">{displayValue}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 min-w-max bg-oslo-gray-900 border border-oslo-gray-700 rounded-lg shadow-xl shadow-black/60 overflow-hidden"
          >
            <div className="p-3 max-h-96 overflow-y-auto">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Option Item for Dropdown
 */
interface FilterOptionProps {
  label: string;
  isSelected?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function FilterOption({
  label,
  isSelected = false,
  onClick,
  icon,
}: FilterOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
        isSelected
          ? "bg-oslo-gray-700 text-oslo-gray-50"
          : "text-oslo-gray-300 hover:bg-oslo-gray-800"
      }`}
    >
      {icon && <span className="h-4 w-4 flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

/**
 * Divider for grouping options
 */
export function FilterDivider() {
  return <div className="my-2 border-t border-oslo-gray-800" />;
}
