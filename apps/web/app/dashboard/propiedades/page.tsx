/**
 * PROPIEDADES - Lista de propiedades del agente
 * Muestra todas las propiedades que pertenecen al agente autenticado
 * 
 * DASHBOARD-SPECIFIC QUERY: Includes favorites, views, and appointments counts
 * for accurate statistics display in AgentPropertyCard
 */

import { AgentPropertyCard } from "@/components/dashboard/agent-property-card";
import { requireRole } from "@/lib/auth";
import { db } from "@repo/database/src/client";
import { Button } from "@repo/ui";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function PropiedadesPage() {
  // Verificar que el usuario es AGENT o ADMIN
  const user = await requireRole(["AGENT", "ADMIN"]);

  // Dashboard-specific query: includes favorites, views, and appointments
  // This differs from propertyRepository.list() which doesn't include these relations
  const properties = await db.property.findMany({
    where: { agentId: user.id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      transactionType: true,
      category: true,
      status: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      latitude: true,
      longitude: true,
      agentId: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true,
      images: {
        select: {
          id: true,
          url: true,
          alt: true,
          order: true,
        },
        orderBy: { order: "asc" },
      },
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      // Include relations for stats
      // Exclude agent's own favorites to show only real client interest
      favorites: { 
        select: { id: true },
        where: { userId: { not: user.id } }
      },
      views: { select: { id: true } },
      appointments: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Serialize Decimal values for client component compatibility
  // Also map isFeatured to featured for AgentPropertyCard compatibility
  const serializedProperties = properties.map((p) => ({
    ...p,
    price: Number(p.price),
    bathrooms: p.bathrooms ? Number(p.bathrooms) : null,
    area: p.area ? Number(p.area) : null,
    latitude: p.latitude ? Number(p.latitude) : null,
    longitude: p.longitude ? Number(p.longitude) : null,
    featured: p.isFeatured, // Map to field expected by AgentPropertyCard
  }));

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

        {serializedProperties.length > 0 && (
          <Link href="/dashboard/propiedades/nueva">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Propiedad
            </Button>
          </Link>
        )}
      </div>

      {/* Properties Grid */}
      {serializedProperties.length === 0 ? (
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 isolate">
          {serializedProperties.map((property) => (
            <AgentPropertyCard key={property.id} property={property as any} />
          ))}
        </div>
      )}

      {/* Stats */}
      {serializedProperties.length > 0 && (
        <div className="mt-8 p-4 rounded-lg border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold">{serializedProperties.length}</span>{" "}
            {serializedProperties.length === 1 ? "propiedad" : "propiedades"}
          </p>
        </div>
      )}
    </div>
  );
}
