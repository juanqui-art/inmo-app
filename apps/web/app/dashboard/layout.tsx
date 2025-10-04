/**
 * DASHBOARD LAYOUT
 * Layout persistente para todas las páginas del dashboard
 * Incluye Sidebar y UserMenu
 */

import { getUserWithRole } from '@/lib/auth'
import { Sidebar } from '@/components/dashboard/sidebar'
import { UserMenu } from '@/components/dashboard/user-menu'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { dbUser, ...authUser } = await getUserWithRole()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar userRole={dbUser.role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-6">
            <div>
              <h2 className="text-lg font-semibold">
                {/* Esto se puede mejorar con breadcrumbs dinámicos */}
              </h2>
            </div>
            <UserMenu
              user={{
                email: authUser.email!,
                user_metadata: {
                  name: dbUser.name || undefined,
                  role: dbUser.role,
                  avatar_url: dbUser.avatar || undefined,
                },
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}
