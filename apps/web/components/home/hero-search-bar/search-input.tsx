/**
 * SearchInput - Search field with loading indicator
 *
 * RESPONSIBILITY: Render input field with icon and loading state
 */

import { Loader2, Search } from "lucide-react";
import { forwardRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      isLoading,
      placeholder = "¿Dónde quieres vivir? Ej: Cuenca, Azogues...",
    },
    ref,
  ) => {
    return (
      <div className="relative">
        {/* Search Icon */}
        <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-white/80 pointer-events-none" />

        {/* Search Input - Glassmorphism Style with Focus Animation */}
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="
            w-full
            pl-12 sm:pl-14 pr-12 sm:pr-14
            py-4 sm:py-5
            text-base sm:text-lg text-white font-medium
            bg-oslo-gray-1000/60 hover:bg-oslo-gray-1000/70 focus:bg-oslo-gray-1000/80
            rounded-xl sm:rounded-2xl
            border border-white/30
            focus:border-white/50
            focus:outline-none
            shadow-xl hover:shadow-2xl
            transition-colors duration-200
            placeholder:text-white/60
          "
          role="combobox"
          aria-label="Buscar ubicación"
          aria-autocomplete="list"
          aria-expanded={false}
          aria-controls="search-suggestions"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <Loader2 className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-white/80 animate-spin" />
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
