/**
 * ADMIN LAYOUT
 * Layout para todas las páginas de administración
 * Incluye sidebar con navegación específica de admin
 */

import { requireRole } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar que el usuario es ADMIN
  const user = await requireRole(["ADMIN"]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar userName={user.name || "Administrador"} />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
