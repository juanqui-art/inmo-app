"use client";

/**
 * USER MENU - Menu del usuario con avatar
 * Dropdown con opciones: Perfil, Logout
 */

import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Type para el usuario desde DB (SafeUser del repository)
interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
}

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  // Obtener nombre del usuario
  const name = user.name || user.email.split("@")[0];

  // Obtener iniciales para avatar
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // Traducir rol a español
  const roleLabels: Record<string, string> = {
    CLIENT: "Cliente",
    AGENT: "Agente",
    ADMIN: "Administrador",
  };
  const roleLabel = roleLabels[user.role] || user.role;

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || undefined} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{name}</span>
            <Badge variant="secondary" className="text-xs">
              {roleLabel}
            </Badge>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <Badge variant="secondary" className="w-fit mt-1">
              {roleLabel}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/perfil")}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
