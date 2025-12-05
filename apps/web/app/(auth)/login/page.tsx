/**
 * LOGIN PAGE
 * URL: /login
 *
 * Features:
 * - Email/password authentication
 * - Google OAuth
 * - Redirect parameter support
 * - Rate limiting protection
 */

import { Suspense } from "react";
import { LoginFormStyled } from "@/components/auth/login-form-styled";

function LoginFormFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
      <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
      <div className="space-y-4 mt-8">
        <div className="h-12 bg-muted rounded" />
        <div className="h-12 bg-muted rounded" />
        <div className="h-12 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Bienvenido
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inicia sesión para acceder a tu cuenta
        </p>
      </div>

      {/* Form */}
      <Suspense fallback={<LoginFormFallback />}>
        <LoginFormStyled />
      </Suspense>
    </div>
  );
}
