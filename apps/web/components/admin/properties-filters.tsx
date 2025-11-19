"use client";

/**
 * PROPERTIES FILTERS - Filtros para tabla de propiedades
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

interface PropertiesFiltersProps {
  currentStatus?: "AVAILABLE" | "PENDING" | "SOLD" | "RENTED";
  currentSearch?: string;
}

export function PropertiesFilters({ currentStatus, currentSearch }: PropertiesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch || "");

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filtering
    params.delete("page");

    startTransition(() => {
      router.push(`/admin/propiedades?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", search || null);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título, dirección o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </form>

      {/* Status filter */}
      <select
        value={currentStatus || ""}
        onChange={(e) => updateParams("status", e.target.value || null)}
        className="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        disabled={isPending}
      >
        <option value="">Todos los estados</option>
        <option value="AVAILABLE">Disponible</option>
        <option value="PENDING">Pendiente</option>
        <option value="SOLD">Vendido</option>
        <option value="RENTED">Rentado</option>
      </select>

      {/* Clear filters */}
      {(currentStatus || currentSearch) && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            router.push("/admin/propiedades");
          }}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors"
          disabled={isPending}
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
