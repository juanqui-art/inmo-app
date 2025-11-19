/**
 * ADMIN - Gestión de Propiedades
 * Lista todas las propiedades con filtros y acciones
 */

import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { getAllPropertiesAction } from "@/app/actions/admin";
import { PropertiesTable } from "@/components/admin/properties-table";
import { PropertiesFilters } from "@/components/admin/properties-filters";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function PropiedadesPage({ searchParams }: PageProps) {
  await requireRole(["ADMIN"]);

  const params = await searchParams;
  const status = params.status as "AVAILABLE" | "PENDING" | "SOLD" | "RENTED" | undefined;
  const search = params.search;
  const page = Number(params.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const { properties, total } = await getAllPropertiesAction({
    status,
    search,
    skip,
    take,
  });

  const totalPages = Math.ceil(total / take);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Propiedades</h1>
        <p className="text-muted-foreground">
          Administra todas las propiedades de la plataforma
        </p>
      </div>

      {/* Filters */}
      <PropertiesFilters
        currentStatus={status}
        currentSearch={search}
      />

      {/* Stats summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">Total Propiedades</p>
        </div>
      </div>

      {/* Properties table */}
      <Suspense fallback={<div>Cargando propiedades...</div>}>
        <PropertiesTable
          properties={properties}
          currentPage={page}
          totalPages={totalPages}
          total={total}
        />
      </Suspense>
    </div>
  );
}
