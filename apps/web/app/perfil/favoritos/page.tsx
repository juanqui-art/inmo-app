/**
 * PERFIL - FAVORITOS PAGE
 *
 * Lista de propiedades favoritas del usuario
 * Permite ver y eliminar favoritos
 */

import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { getFavoritesWithDetailsAction } from "@/app/actions/favorites";
import { requireAuth } from "@/lib/auth";
import { FavoritesList } from "./favorites-list";

export default async function PerfilFavoritosPage() {
  const user = await requireAuth();

  // Fetch favorites with property details
  const { data: favorites, error } = await getFavoritesWithDetailsAction(100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/perfil"
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Volver al perfil"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Mis Favoritos</h1>
              <p className="text-sm text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? "propiedad guardada" : "propiedades guardadas"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div>
                <h2 className="text-xl font-semibold mb-2">No tienes favoritos</h2>
                <p className="text-muted-foreground mb-4">
                  Explora propiedades y guarda las que te interesen
                </p>
                <Link
                  href="/propiedades"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Buscar Propiedades
                </Link>
              </div>
            </div>
          ) : (
            <FavoritesList initialFavorites={favorites} />
          )}
        </div>
      </main>
    </div>
  );
}
