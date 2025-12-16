"use client";

/**
 * USER MENU - Menu del usuario con avatar premium
 * Dropdown con opciones: Perfil, Configuración, Logout
 */

import { logoutAction } from "@/app/actions/auth";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import {
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui";
import { ChevronDown, CreditCard, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

// Type para el usuario desde DB (SafeUser del repository)
interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
  subscriptionTier?: string;
}

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  // Obtener nombre del usuario
  const name = user.name || user.email.split("@")[0];

  // Traducir rol a español
  const roleLabels: Record<string, string> = {
    CLIENT: "Cliente",
    AGENT: "Agente",
    ADMIN: "Administrador",
  };
  const roleLabel = roleLabels[user.role] || user.role;

  // Tier badge styles - FREE is the default fallback
  const defaultStyle = { bg: "bg-muted", text: "text-muted-foreground" };
  const tierStyles: Record<string, { bg: string; text: string }> = {
    FREE: defaultStyle,
    PLUS: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
    AGENT: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    PRO: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  };
  const currentTier = user.subscriptionTier || "FREE";
  const tierStyle = tierStyles[currentTier] || defaultStyle;

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
          <AgentAvatar
            name={name}
            image={user.avatar}
            size="sm"
            isVerified={user.role === "AGENT" || user.role === "ADMIN"}
          />
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold">{name}</span>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${tierStyle.bg} ${tierStyle.text} border-0`}>
                {user.subscriptionTier || "FREE"}
              </Badge>
              <span className="text-[10px] text-muted-foreground">• {roleLabel}</span>
            </div>
          </div>
          <ChevronDown className="hidden md:block w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="py-3">
          <div className="flex items-center gap-3">
            <AgentAvatar
              name={name}
              image={user.avatar}
              size="md"
              isVerified={user.role === "AGENT" || user.role === "ADMIN"}
            />
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold leading-none truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {user.email}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${tierStyle.bg} ${tierStyle.text} border-0`}>
                  {user.subscriptionTier || "FREE"}
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/perfil")} className="cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/configuracion")} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/pricing")} className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Gestionar Plan</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
