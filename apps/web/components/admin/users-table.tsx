"use client";

/**
 * USERS TABLE - Tabla de usuarios con acciones
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Shield,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { UserWithCounts } from "@/app/actions/admin";
import { deleteUserAction, updateUserRoleAction } from "@/app/actions/admin";

interface UsersTableProps {
  users: UserWithCounts[];
  currentPage: number;
  totalPages: number;
  total: number;
}

const roleLabels = {
  CLIENT: "Cliente",
  AGENT: "Agente",
  ADMIN: "Admin",
};

const roleColors = {
  CLIENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  AGENT: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  ADMIN:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const roleIcons = {
  CLIENT: User,
  AGENT: Building2,
  ADMIN: Shield,
};

export function UsersTable({
  users,
  currentPage,
  totalPages,
  total,
}: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleRoleChange = async (
    userId: string,
    newRole: "CLIENT" | "AGENT" | "ADMIN",
  ) => {
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, newRole);
      if (!result.success) {
        alert(result.error);
      }
      setActiveMenu(null);
      router.refresh();
    });
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar a ${userName}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (!result.success) {
        alert(result.error);
      }
      setActiveMenu(null);
      router.refresh();
    });
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`/admin/usuarios?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
                Propiedades
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
                Favoritos
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">
                Registro
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const RoleIcon = roleIcons[user.role];
              return (
                <tr
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">
                        {user.name || "Sin nombre"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {user._count.properties}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {user._count.favorites}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "d MMM yyyy", {
                      locale: es,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenu(activeMenu === user.id ? null : user.id)
                        }
                        className="p-2 rounded-md hover:bg-accent transition-colors"
                        disabled={isPending}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {/* Dropdown menu */}
                      {activeMenu === user.id && (
                        <div className="absolute right-0 mt-1 w-48 rounded-md border bg-popover shadow-lg z-50">
                          <div className="p-1">
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                              Cambiar rol
                            </div>
                            {(["CLIENT", "AGENT", "ADMIN"] as const).map(
                              (role) => (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() =>
                                    handleRoleChange(user.id, role)
                                  }
                                  disabled={user.role === role || isPending}
                                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors disabled:opacity-50"
                                >
                                  {roleLabels[role]}
                                </button>
                              ),
                            )}
                            <div className="my-1 border-t" />
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(user.id, user.name || user.email)
                              }
                              className="w-full text-left px-2 py-1.5 text-sm rounded text-destructive hover:bg-destructive/10 transition-colors"
                              disabled={isPending}
                            >
                              Eliminar usuario
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * 20 + 1} -{" "}
            {Math.min(currentPage * 20, total)} de {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="p-2 rounded-md border hover:bg-accent transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="p-2 rounded-md border hover:bg-accent transition-colors disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
