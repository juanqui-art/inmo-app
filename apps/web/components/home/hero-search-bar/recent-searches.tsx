/**
 * RecentSearches - Displays search history
 *
 * RESPONSIBILITY: Render recent searches list with clear button
 */

import { Clock } from "lucide-react";

interface SearchHistoryItem {
  query: string;
  type: string;
  timestamp: number;
}

interface RecentSearchesProps {
  history: SearchHistoryItem[];
  onSelect: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
  getTimeAgo: (timestamp: number) => string;
}

export function RecentSearches({
  history,
  onSelect,
  onClearHistory,
  getTimeAgo,
}: RecentSearchesProps) {
  return (
    <>
      <div className="sticky top-0 px-4 sm:px-5 py-3 border-b border-white/10 bg-white/5 backdrop-blur-sm z-10 flex items-center justify-between">
        <p className="text-xs sm:text-sm font-semibold text-white/70 uppercase tracking-wide flex items-center gap-2">
          <Clock className="w-4 h-4" /> Búsquedas recientes
        </p>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-oslo-gray-200 hover:text-white/80 transition-colors"
          aria-label="Clear search history"
        >
          Limpiar
        </button>
      </div>
      <div className="py-3 px-3 sm:px-4 space-y-2">
        {history.map((item) => (
          <div
            key={`${item.type}-${item.query}`}
            className="px-4 sm:px-5 py-3 sm:py-4 cursor-pointer rounded-lg bg-oslo-gray-900/45 hover:bg-indigo-500/30 active:bg-indigo-400/20 border border-white/15 hover:border-indigo-400 transition-all duration-150"
            onClick={() => onSelect(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSelect(item);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white/95 truncate text-base sm:text-lg">
                  {item.query}
                </p>
                <p className="text-xs sm:text-sm text-white/50 mt-1">
                  {getTimeAgo(item.timestamp)}
                </p>
              </div>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 flex-shrink-0 ml-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
