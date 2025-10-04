'use client'

/**
 * LOGIN FORM
 *
 * ¿Por qué 'use client'?
 * - Necesitamos useState para manejar errores
 * - useActionState es un hook que solo funciona en cliente
 *
 * ¿Cómo funciona?
 * 1. Usuario llena email/password
 * 2. Click en "Iniciar sesión"
 * 3. Form llama a loginAction (que corre en servidor)
 * 4. Si hay error, lo mostramos
 * 5. Si es exitoso, loginAction redirige automáticamente
 */

import { loginAction } from '@/app/actions/auth'
import { Button } from '@repo/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'

export function LoginForm() {
  // useActionState maneja el estado de la Server Action
  // state contiene el resultado (error, success, etc.)
  // formAction es la función que se llama al hacer submit
  const [state, formAction, isPending] = useActionState(loginAction, undefined)

  return (
    <form action={formAction} className="space-y-4">
      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
        />
        {/* Mostrar error si existe */}
        {state?.error?.email && (
          <p className="text-sm text-red-600">{state.error.email[0]}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
        {state?.error?.password && (
          <p className="text-sm text-red-600">{state.error.password[0]}</p>
        )}
      </div>

      {/* Error general (credenciales inválidas) */}
      {state?.error?.general && (
        <p className="text-sm text-red-600">{state.error.general}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
