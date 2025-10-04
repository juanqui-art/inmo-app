'use client'

/**
 * SIDEBAR - Navegación del Dashboard
 * Muestra links según el rol del usuario
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Building2, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'
import { Separator } from '@/components/ui/separator'

type UserRole = 'CLIENT' | 'AGENT' | 'ADMIN'

interface SidebarProps {
  userRole: UserRole
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['AGENT', 'ADMIN'],
  },
  {
    title: 'Propiedades',
    href: '/dashboard/propiedades',
    icon: Building2,
    roles: ['AGENT', 'ADMIN'],
  },
  {
    title: 'Citas',
    href: '/dashboard/citas',
    icon: Calendar,
    roles: ['AGENT', 'ADMIN'],
  },
  {
    title: 'Clientes',
    href: '/dashboard/clientes',
    icon: Users,
    roles: ['AGENT', 'ADMIN'],
  },
  {
    title: 'Perfil',
    href: '/dashboard/perfil',
    icon: Settings,
    roles: ['AGENT', 'ADMIN'],
  },
]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  // Filtrar items según rol
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <aside className="w-64 border-r border-border bg-card h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">InmoApp</span>
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-4">
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ModeToggle />
        </div>
      </div>
    </aside>
  )
}
