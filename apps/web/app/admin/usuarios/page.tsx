/**
 * ADMIN - Gestión de Usuarios
 * Lista todos los usuarios con filtros y acciones
 */

import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { getUsersAction } from "@/app/actions/admin";
import { UsersTable } from "@/components/admin/users-table";
import { UsersFilters } from "@/components/admin/users-filters";

interface PageProps {
  searchParams: Promise<{
    role?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  await requireRole(["ADMIN"]);

  const params = await searchParams;
  const role = params.role as "CLIENT" | "AGENT" | "ADMIN" | undefined;
  const search = params.search;
  const page = Number(params.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const { users, total } = await getUsersAction({
    role,
    search,
    skip,
    take,
  });

  const totalPages = Math.ceil(total / take);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra usuarios, cambia roles y gestiona cuentas
        </p>
      </div>

      {/* Filters */}
      <UsersFilters
        currentRole={role}
        currentSearch={search}
      />

      {/* Stats summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">Total Usuarios</p>
        </div>
      </div>

      {/* Users table */}
      <Suspense fallback={<div>Cargando usuarios...</div>}>
        <UsersTable
          users={users}
          currentPage={page}
          totalPages={totalPages}
          total={total}
        />
      </Suspense>
    </div>
  );
}
