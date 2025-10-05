'use client'

/**
 * SIGNUP FORM (Registro)
 *
 * Similar al LoginForm pero con más campos:
 * - Nombre
 * - Email
 * - Password
 * - Rol (CLIENT, AGENT, ADMIN)
 */

import { signupAction } from '@/app/actions/auth'
import { Button } from '@repo/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, undefined)

  return (
    <form action={formAction} className="space-y-4">
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
        {state?.error && 'name' in state.error && state.error.name && (
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
        {state?.error && 'email' in state.error && state.error.email && (
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
        {state?.error && 'password' in state.error && state.error.password && (
          <p className="text-sm text-red-600">{state.error.password[0]}</p>
        )}
        <p className="text-xs text-gray-500">
          Mínimo 8 caracteres, debe incluir letras y números
        </p>
      </div>

      {/* Rol (Select) */}
      <div className="space-y-2">
        <Label htmlFor="role">Tipo de cuenta</Label>
        <select
          id="role"
          name="role"
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          defaultValue="CLIENT"
        >
          <option value="CLIENT">Cliente (Busco propiedades)</option>
          <option value="AGENT">Agente (Publico propiedades)</option>
          <option value="ADMIN">Administrador</option>
        </select>
        {state?.error && 'role' in state.error && state.error.role && (
          <p className="text-sm text-red-600">{state.error.role[0]}</p>
        )}
      </div>

      {/* Error general */}
      {state?.error && 'general' in state.error && state.error.general && (
        <p className="text-sm text-red-600">{state.error.general}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
