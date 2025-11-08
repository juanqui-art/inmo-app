/**
 * useSearchHistory - Manage search history with localStorage
 *
 * Features:
 * - Persist search history across sessions
 * - Limit to last 5 searches
 * - Prevent duplicates (move to front)
 * - Timestamp tracking
 * - Easy to clear
 */

import { useEffect, useState } from "react";

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  type: "city" | "query"; // city: selected city, query: text search
}

const STORAGE_KEY = "inmo_search_history";
const MAX_HISTORY = 5;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  }, [history, isLoaded]);

  /**
   * Add a new search to history
   * If it already exists, move it to the front
   * If history exceeds MAX_HISTORY, remove oldest
   */
  const addSearch = (query: string, type: "city" | "query" = "city") => {
    if (!query.trim()) return;

    setHistory((prev) => {
      // Remove if already exists (to move it to front)
      const filtered = prev.filter(
        (item) => !(item.query === query && item.type === type),
      );

      // Add to front with current timestamp
      const updated = [
        {
          query: query.trim(),
          timestamp: Date.now(),
          type,
        },
        ...filtered,
      ];

      // Keep only last 5
      return updated.slice(0, MAX_HISTORY);
    });
  };

  /**
   * Clear all search history
   */
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  /**
   * Get formatted time since search
   */
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return "Hace más de una semana";
  };

  return {
    history,
    addSearch,
    clearHistory,
    getTimeAgo,
    isLoaded,
  };
}
