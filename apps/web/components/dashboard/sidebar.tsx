"use client";

/**
 * SIDEBAR - Navegación del Dashboard
 * Muestra links según el rol del usuario
 */

import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage, Button, Separator } from "@repo/ui";
import { Building2, Calendar, Home, LogOut, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlanUsage } from "./plan-usage";

interface SidebarProps {
  user: {
    name: string | null;
    email: string;
    avatar: string | null;
    role: "CLIENT" | "AGENT" | "ADMIN";
  };
  usageStats?: {
    tier: "FREE" | "BASIC" | "PRO";
    propertyCount: number;
    propertyLimit: number;
    imageLimit: number;
  };
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["AGENT", "ADMIN"],
  },
  {
    title: "Propiedades",
    href: "/dashboard/propiedades",
    icon: Building2,
    roles: ["AGENT", "ADMIN"],
  },
  {
    title: "Citas",
    href: "/dashboard/citas",
    icon: Calendar,
    roles: ["AGENT", "ADMIN"],
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
    roles: ["AGENT", "ADMIN"],
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
    roles: ["AGENT", "ADMIN"],
  },
];

export function Sidebar({ user, usageStats }: SidebarProps) {
  const pathname = usePathname();

  // Filtrar items según rol
  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );

  return (
    <aside className="w-72 border-r border-white/10 bg-background/95 backdrop-blur-xl h-screen sticky top-0 flex flex-col shadow-xl shadow-black/5">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight">InmoApp</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
              )}
              <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="mt-auto">
        {/* Plan Usage Stats */}
        {usageStats && (
          <div className="px-6 pb-6">
            <PlanUsage {...usageStats} />
          </div>
        )}

        <Separator className="bg-border/50" />

        {/* User Profile */}
        <div className="p-4 m-2 rounded-xl bg-muted/30 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name || "Usuario"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="flex-1">
                <ModeToggle />
             </div>
             <form action="/auth/signout" method="post">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Cerrar Sesión">
                  <LogOut className="h-4 w-4" />
                </Button>
             </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
