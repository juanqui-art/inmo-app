"use client";

/**
 * PropertyGridPagination - Page navigation for properties grid
 *
 * Shows previous/next buttons and page numbers
 * Preserves all filter parameters when navigating pages
 *
 * STATE MANAGEMENT:
 * - Reads pagination state from PropertyGridStore (Zustand)
 * - No props needed: store is hydrated by PropertyGridStoreInitializer
 */

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePropertyGridStore } from "@/stores/property-grid-store";
import { cn } from "@repo/ui";

export function PropertyGridPagination() {
  // Read pagination state from store
  const { currentPage, totalPages } = usePropertyGridStore();

  // Get search params to build filter query string
  const searchParams = useSearchParams();
  const filters = searchParams.toString();

  // Compute pagination state (derived from store)
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Generate page numbers to display (always show first, last, and pages around current)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Pages to show around current page

    // Always show page 1
    pages.push(1);

    // Show pages around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page (if > 1)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const prevPageUrl = `/propiedades?page=${currentPage - 1}${filters ? `&${filters}` : ""}`;
  const nextPageUrl = `/propiedades?page=${currentPage + 1}${filters ? `&${filters}` : ""}`;

  return (
    <div className="mt-12 flex justify-center items-center gap-2">
      {/* Previous Button */}
      {hasPrevPage ? (
        <Link
          href={prevPageUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-oslo-gray-700 text-oslo-gray-300 hover:bg-oslo-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-oslo-gray-800 text-oslo-gray-600 cursor-not-allowed opacity-50">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </div>
      )}

      {/* Page Numbers */}
      <div className="flex gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-oslo-gray-400"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage;
          const pageUrl = `/propiedades?page=${pageNum}${filters ? `&${filters}` : ""}`;

          return (
            <Link
              key={pageNum}
              href={pageUrl}
              className={cn(
                "px-3 py-2 rounded-lg transition-colors",
                isCurrentPage
                  ? "bg-indigo-600 text-white"
                  : "border border-oslo-gray-700 text-oslo-gray-300 hover:bg-oslo-gray-800",
              )}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {hasNextPage ? (
        <Link
          href={nextPageUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-oslo-gray-700 text-oslo-gray-300 hover:bg-oslo-gray-800 transition-colors"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-oslo-gray-800 text-oslo-gray-600 cursor-not-allowed opacity-50">
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
