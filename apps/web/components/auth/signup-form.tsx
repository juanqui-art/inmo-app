"use client";

/**
 * SIGNUP FORM (Registro)
 *
 * Campos requeridos:
 * - Nombre
 * - Email
 * - Password
 *
 * NOTA: Todos los usuarios son AGENT por defecto
 */

import { signupAction } from "@/app/actions/auth";
import { Button, Input, Label } from "@repo/ui";
import { useActionState } from "react";

export function SignupForm({ redirect }: { redirect?: string }) {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      {redirect && <input type="hidden" name="redirect" value={redirect} />}
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Juan Pérez"
          required
        />
        {state?.error && "name" in state.error && state.error.name && (
          <p className="text-sm text-red-600">{state.error.name[0]}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
        />
        {state?.error && "email" in state.error && state.error.email && (
          <p className="text-sm text-red-600">{state.error.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
        {state?.error && "password" in state.error && state.error.password && (
          <p className="text-sm text-red-600">{state.error.password[0]}</p>
        )}
        <p className="text-xs text-oslo-gray-500 dark:text-oslo-gray-400">
          Mínimo 8 caracteres, debe incluir letras y números
        </p>
      </div>

      {/* Error general */}
      {state?.error && "general" in state.error && state.error.general && (
        <p className="text-sm text-red-600">{state.error.general}</p>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
