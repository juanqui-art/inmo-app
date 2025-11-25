"use client";

/**
 * PROPERTIES TABLE - Tabla de propiedades con acciones
 */

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PropertyWithAgent } from "@/app/actions/admin";
import {
  deletePropertyAction,
  updatePropertyStatusAction,
} from "@/app/actions/admin";

interface PropertiesTableProps {
  properties: PropertyWithAgent[];
  currentPage: number;
  totalPages: number;
  total: number;
}

const statusLabels = {
  AVAILABLE: "Disponible",
  PENDING: "Pendiente",
  SOLD: "Vendido",
  RENTED: "Rentado",
};

const statusColors = {
  AVAILABLE:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  SOLD: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  RENTED:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const transactionLabels = {
  SALE: "Venta",
  RENT: "Renta",
};

const categoryLabels: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  SUITE: "Suite",
  VILLA: "Villa",
  PENTHOUSE: "Penthouse",
  DUPLEX: "Dúplex",
  LOFT: "Loft",
  LAND: "Terreno",
  COMMERCIAL: "Local Comercial",
  OFFICE: "Oficina",
  WAREHOUSE: "Bodega",
  FARM: "Finca",
};

export function PropertiesTable({
  properties,
  currentPage,
  totalPages,
  total,
}: PropertiesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleStatusChange = async (
    propertyId: string,
    newStatus: "AVAILABLE" | "PENDING" | "SOLD" | "RENTED",
  ) => {
    startTransition(async () => {
      const result = await updatePropertyStatusAction(propertyId, newStatus);
      if (!result.success) {
        alert(result.error);
      }
      setActiveMenu(null);
      router.refresh();
    });
  };

  const handleDelete = async (propertyId: string, propertyTitle: string) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar "${propertyTitle}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deletePropertyAction(propertyId);
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
    router.push(`/admin/propiedades?${params.toString()}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Propiedad
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
                Precio
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">
                Agente
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3" />
                  <Calendar className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {properties.map((property) => (
              <tr
                key={property.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium line-clamp-1">
                      {property.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {categoryLabels[property.category] || property.category} ·{" "}
                      {
                        transactionLabels[
                          property.transactionType as keyof typeof transactionLabels
                        ]
                      }
                      {property.city && ` · ${property.city}`}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell font-medium">
                  {formatPrice(property.price)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}
                  >
                    {statusLabels[property.status]}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="text-sm">
                    <div>{property.agent.name || "Sin nombre"}</div>
                    <div className="text-muted-foreground">
                      {property.agent.email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {property._count.favorites}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {property._count.appointments}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === property.id ? null : property.id,
                        )
                      }
                      className="p-2 rounded-md hover:bg-accent transition-colors"
                      disabled={isPending}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {/* Dropdown menu */}
                    {activeMenu === property.id && (
                      <div className="absolute right-0 mt-1 w-48 rounded-md border bg-popover shadow-lg z-50">
                        <div className="p-1">
                          <Link
                            href={`/propiedades/${property.id}`}
                            target="_blank"
                            className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver propiedad
                          </Link>
                          <div className="my-1 border-t" />
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            Cambiar estado
                          </div>
                          {(
                            ["AVAILABLE", "PENDING", "SOLD", "RENTED"] as const
                          ).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                handleStatusChange(property.id, status)
                              }
                              disabled={property.status === status || isPending}
                              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors disabled:opacity-50"
                            >
                              {statusLabels[status]}
                            </button>
                          ))}
                          <div className="my-1 border-t" />
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(property.id, property.title)
                            }
                            className="w-full text-left px-2 py-1.5 text-sm rounded text-destructive hover:bg-destructive/10 transition-colors"
                            disabled={isPending}
                          >
                            Eliminar propiedad
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {properties.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron propiedades
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
