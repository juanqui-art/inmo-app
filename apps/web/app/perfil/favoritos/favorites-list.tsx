/**
 * FAVORITES LIST - Client Component
 *
 * Handles interactive favorites list with remove functionality
 */

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleFavoriteAction } from "@/app/actions/favorites";
import { FavoriteItemCompact } from "@/components/favorites/favorite-item-compact";

interface FavoriteProperty {
  propertyId: string;
  property: {
    id: string;
    title: string;
    price: string;
    city: string;
    image: { url: string; alt: string | null } | null;
  };
}

interface FavoritesListProps {
  initialFavorites: FavoriteProperty[];
}

export function FavoritesList({ initialFavorites }: FavoritesListProps) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRemove = async (propertyId: string) => {
    setRemovingId(propertyId);

    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction(propertyId);

        if (result.success && !result.isFavorite) {
          // Remove from local state
          setFavorites((prev) => prev.filter((f) => f.propertyId !== propertyId));
          toast.success("Propiedad eliminada de favoritos");
        } else if (!result.success) {
          toast.error(result.error || "Error al eliminar favorito");
        }
      } catch {
        toast.error("Error al eliminar favorito");
      } finally {
        setRemovingId(null);
      }
    });
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Has eliminado todos tus favoritos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {favorites.map((favorite) => (
        <FavoriteItemCompact
          key={favorite.propertyId}
          propertyId={favorite.propertyId}
          title={favorite.property.title}
          price={favorite.property.price}
          city={favorite.property.city}
          imageUrl={favorite.property.image?.url}
          onRemove={handleRemove}
          isRemoving={removingId === favorite.propertyId || isPending}
        />
      ))}
    </div>
  );
}
