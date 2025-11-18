/**
 * FavoritesDropdown - Favorites List in Navbar
 *
 * PATTERN: Client Component with Server Action integration
 *
 * FEATURES:
 * - Dropdown popover from heart icon
 * - List of favorited properties with images
 * - Quick remove from favorites
 * - View property details link
 * - Empty state message
 * - Loading skeleton
 * - Responsive sizing
 *
 * DESIGN:
 * - Dropdown from navbar heart icon
 * - Max 6 items visible (scrollable)
 * - Dark mode support
 * - Smooth animations
 *
 * PERFORMANCE:
 * - Server Action for data fetching
 * - Client state for UI (open/close)
 * - Optimistic updates via useFavorites
 */

"use client";

import { cn } from "@repo/ui";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getFavoritesWithDetailsAction } from "@/app/actions/favorites";
import { FavoriteItemCompact } from "@/components/favorites/favorite-item-compact";
import { useFavorites } from "@/hooks/use-favorites";

interface FavoriteItem {
  propertyId: string;
  property: {
    id: string;
    title: string;
    price: string;
    city: string | null;
    image?: { url: string; alt: string } | null;
  };
}

interface FavoritesDropdownProps {
  className?: string;
}

/**
 * FavoritesDropdown Component
 *
 * Displays a dropdown popover with the user's favorited properties.
 * Allows quick viewing and removal of favorites from the navbar.
 */
export function FavoritesDropdown({ className }: FavoritesDropdownProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // Use favorites store for count and sync
  const { favorites: favoriteIds, toggleFavorite } = useFavorites();
  const favoriteCount = favoriteIds.size;

  // Fetch favorites when dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getFavoritesWithDetailsAction(8);

        if (result.success && result.data && result.data.length >= 0) {
          setFavorites(result.data as FavoriteItem[]);
        } else {
          setError(result.error || "Failed to load favorites");
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Failed to load favorites");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [isOpen]);

  // Handle remove favorite
  const handleRemove = async (propertyId: string) => {
    // Optimistic update - add to removing set
    setRemovingIds((prev) => new Set(prev).add(propertyId));

    try {
      // Toggle via store (will sync with server)
      await toggleFavorite(propertyId);

      // Remove from local list
      setFavorites((prev) =>
        prev.filter((item) => item.propertyId !== propertyId),
      );

      toast.success("Removed from favorites");
    } catch (err) {
      console.error("Error removing favorite:", err);
      toast.error("Failed to remove favorite");
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is outside dropdown content
      if (!target.closest("[data-favorites-dropdown]")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div data-favorites-dropdown className={cn("relative", className)}>
      {/* Heart Button with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-1.5 rounded-full transition-all duration-200",
          "hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-300/30",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          isOpen && "bg-oslo-gray-100 dark:bg-oslo-gray-900",
        )}
        aria-label={`Favorites (${favoriteCount})`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Heart
          className={cn(
            "w-6 h-6 transition-colors",
            favoriteCount > 0
              ? "fill-red-500 text-red-500 "
              : "text-oslo-gray-600 dark:text-oslo-gray-400",
          )}
        />

        {/* Favorite Count Badge */}
        {favoriteCount > 0 && (
          <span
            className={cn(
              "absolute top-0 right-0 w-3 h-3",
              "bg-red-500 text-white text-xs font-bold",
              "rounded-full flex items-center justify-center",
            )}
          >
            {favoriteCount > 9 ? "9+" : favoriteCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" aria-hidden="true" />

          {/* Content */}
          <div
            className={cn(
              "absolute top-full right-0 mt-2 z-50",
              "w-96 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-800",
              "bg-white dark:bg-oslo-gray-1000",
              "shadow-xl",
              "max-h-[600px] overflow-y-auto",
            )}
            role="dialog"
            aria-label="Favorites"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-oslo-gray-1000 px-4 py-3 border-b border-oslo-gray-200 dark:border-oslo-gray-800">
              <h2 className="text-sm font-semibold text-oslo-gray-900 dark:text-white">
                Mis Favoritos
              </h2>
              {favoriteCount > 0 && (
                <p className="text-xs text-oslo-gray-500 dark:text-oslo-gray-400">
                  {favoriteCount} propiedad{favoriteCount !== 1 ? "es" : ""}
                </p>
              )}
            </div>

            {/* Content Area */}
            <div className="p-3">
              {isLoading ? (
                // Loading state
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex gap-3 p-3 rounded-lg bg-oslo-gray-100 dark:bg-oslo-gray-900"
                    >
                      <div className="w-20 h-20 rounded-lg bg-oslo-gray-200 dark:bg-oslo-gray-800 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded w-3/4" />
                        <div className="h-3 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                // Error state
                <div className="text-center py-8">
                  <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 mb-3">
                    {error}
                  </p>
                  <button
                    onClick={() => setIsOpen(true)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Reintentar
                  </button>
                </div>
              ) : favorites.length > 0 ? (
                // Favorites list
                <div className="space-y-2">
                  {favorites.map((item) => (
                    <FavoriteItemCompact
                      key={item.propertyId}
                      propertyId={item.property.id}
                      title={item.property.title}
                      price={item.property.price}
                      city={item.property.city || "Unknown"}
                      imageUrl={item.property.image?.url}
                      onRemove={handleRemove}
                      isRemoving={removingIds.has(item.propertyId)}
                    />
                  ))}
                </div>
              ) : (
                // Empty state
                <div className="text-center py-8">
                  <Heart className="w-8 h-8 text-oslo-gray-300 dark:text-oslo-gray-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-oslo-gray-700 dark:text-oslo-gray-300 mb-2">
                    No tienes favoritos aún
                  </p>
                  <p className="text-xs text-oslo-gray-500 dark:text-oslo-gray-500 mb-4">
                    Agrega propiedades a tu lista de favoritos
                  </p>
                  <Link
                    href="/mapa"
                    className="inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Explorar propiedades
                  </Link>
                </div>
              )}
            </div>

            {/* Footer - View All Favorites Link */}
            {favorites.length > 0 && (
              <div className="sticky bottom-0 bg-white dark:bg-oslo-gray-1000 px-4 py-3 border-t border-oslo-gray-200 dark:border-oslo-gray-800">
                <Link
                  href="/favoritos"
                  className={cn(
                    "block w-full text-center py-2 px-3 rounded-lg",
                    "text-sm font-medium text-indigo-600 dark:text-indigo-400",
                    "hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
                    "transition-colors",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Ver todos los favoritos →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
