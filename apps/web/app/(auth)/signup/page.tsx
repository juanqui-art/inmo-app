/**
 * PÁGINA DE SIGNUP (Registro)
 * URL: /signup
 */

import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Suspense } from "react";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Crear cuenta</h1>
          <p className="mt-2 text-sm text-gray-600">
            Únete a InmoApp y encuentra tu propiedad ideal
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
          {/* Google OAuth */}
          <Suspense fallback={<div>Cargando...</div>}>
            <GoogleButton />
          </Suspense>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                o continúa con email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <SignupForm 
            redirect={searchParams.redirect as string} 
            plan={searchParams.plan as string}
          />
        </div>

        {/* Link a Login */}
        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
