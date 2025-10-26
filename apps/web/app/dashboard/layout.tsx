/**
 * DASHBOARD LAYOUT
 *
 * Layout principal para el dashboard de agentes
 * - Sidebar con navegación
 * - User menu con logout
 * - Solo accesible para AGENT y ADMIN
 */

import { Sidebar } from "@/components/dashboard/sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { requireRole } from "@/lib/auth";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar que el usuario sea AGENT o ADMIN
  const user = await requireRole(["AGENT", "ADMIN"]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Navigation */}
      <Sidebar userRole={user.role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header con User Menu */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Dashboard</h2>
            </div>

            {/* User Menu */}
            <UserMenu user={user} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-background">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
