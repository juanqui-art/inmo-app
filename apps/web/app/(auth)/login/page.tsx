/**
 * PÁGINA DE LOGIN
 * URL: /login
 */

import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Accede a tu cuenta de InmoApp
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <LoginForm />
        </div>

        {/* Link a Signup */}
        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
