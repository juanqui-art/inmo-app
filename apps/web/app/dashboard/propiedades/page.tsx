/**
 * PROPIEDADES - Lista de propiedades del agente
 * Muestra todas las propiedades que pertenecen al agente autenticado
 */

import { propertyRepository } from "@repo/database";
import { Button } from "@repo/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import { requireRole } from "@/lib/auth";

export default async function PropiedadesPage() {
  // Verificar que el usuario es AGENT o ADMIN
  const user = await requireRole(["AGENT", "ADMIN"]);

  // Obtener propiedades del agente
  const { properties } = await propertyRepository.list({
    filters: { agentId: user.id },
    take: 100, // Límite temporal
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Propiedades</h1>
          <p className="text-muted-foreground">
            Gestiona tus propiedades publicadas
          </p>
        </div>

        <Link href="/dashboard/propiedades/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Propiedad
          </Button>
        </Link>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No tienes propiedades publicadas aún
          </p>
          <Link href="/dashboard/propiedades/nueva">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear tu primera propiedad
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {properties.length > 0 && (
        <div className="mt-8 p-4 rounded-lg border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold">{properties.length}</span>{" "}
            {properties.length === 1 ? "propiedad" : "propiedades"}
          </p>
        </div>
      )}
    </div>
  );
}
