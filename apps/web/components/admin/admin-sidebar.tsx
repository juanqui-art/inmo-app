"use client";

/**
 * ADMIN SIDEBAR - Navegación del Panel de Administración
 */

import { Separator } from "@repo/ui";
import {
  BarChart3,
  Building2,
  Home,
  LogOut,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

interface AdminSidebarProps {
  userName: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    title: "Panel Admin",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Propiedades",
    href: "/admin/propiedades",
    icon: Building2,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Admin Panel</span>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{userName}</p>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}

        {/* Separator before secondary links */}
        <div className="pt-4">
          <Separator className="mb-4" />
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Building2 className="h-4 w-4" />
            Mi Dashboard
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-4">
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ModeToggle />
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
