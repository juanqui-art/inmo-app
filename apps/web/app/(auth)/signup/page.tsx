/**
 * PÁGINA DE SIGNUP (Registro)
 * URL: /signup
 */

import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Únete a InmoApp y encuentra tu propiedad ideal
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <SignupForm />
        </div>

        {/* Link a Login */}
        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
