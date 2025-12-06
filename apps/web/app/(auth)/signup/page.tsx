/**
 * SIGNUP PAGE
 * URL: /signup
 *
 * Features:
 * - Email/password registration
 * - Google OAuth
 * - Plan selection support (from /vender flow)
 * - Redirect parameter support
 * - Rate limiting protection
 *
 * Query params:
 * - plan: "free" | "basic" | "pro" - Selected pricing tier
 * - redirect: URL to redirect after signup
 */

import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Suspense } from "react";

/** Plan display configuration */
const PLAN_CONFIG: Record<
  string,
  { name: string; color: string; bgColor: string }
> = {
  free: {
    name: "Gratuito",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  basic: {
    name: "Básico",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  pro: {
    name: "Pro",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
};

function SignupFormFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-muted rounded" />
      <div className="h-px bg-muted" />
      <div className="space-y-4">
        <div className="h-12 bg-muted rounded" />
        <div className="h-12 bg-muted rounded" />
        <div className="h-12 bg-muted rounded" />
        <div className="h-12 bg-muted rounded" />
      </div>
    </div>
  );
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const plan = typeof params.plan === "string" ? params.plan : undefined;
  const redirect =
    typeof params.redirect === "string" ? params.redirect : undefined;
  const planConfig = plan ? PLAN_CONFIG[plan.toLowerCase()] : null;

  return (
    <div className="space-y-6">
      {/* Plan Badge - Only if plan is selected */}
      {planConfig && (
        <div
          className={`px-4 py-3 ${planConfig.bgColor} rounded-lg border border-current/10`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">
              Plan seleccionado:
            </span>
            <span className={`text-sm font-bold ${planConfig.color}`}>
              {planConfig.name}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {planConfig ? (
            <>
              Completa tu registro para activar el plan{" "}
              <span className={`font-semibold ${planConfig.color}`}>
                {planConfig.name}
              </span>
            </>
          ) : (
            "Únete a InmoApp y encuentra tu propiedad ideal"
          )}
        </p>
      </div>

      {/* Form */}
      <Suspense fallback={<SignupFormFallback />}>
        <div className="space-y-6">
          {/* Google OAuth */}
          <GoogleButton />

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                o continúa con email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <SignupForm redirect={redirect} plan={plan} />
        </div>
      </Suspense>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/login${
            plan || redirect
              ? "?" +
                new URLSearchParams({
                  ...(plan && { plan }),
                  ...(redirect && { redirect }),
                }).toString()
              : ""
          }`}
          className="font-semibold text-foreground hover:underline transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
