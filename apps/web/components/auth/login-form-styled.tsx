"use client";

import { loginAction } from "@/app/actions/auth";
import { Button, Checkbox, Input, Label, PasswordInput } from "@repo/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { GoogleButton } from "./google-button";

export function LoginFormStyled() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const [rememberMe, setRememberMe] = useState(false);
  const searchParams = useSearchParams();

  return (
    <div className="w-full space-y-8">
      {/* Header removed - provided by Dialog modal */}

      <form action={formAction} className="space-y-6">
        {/* Campo oculto para pasar el parámetro redirect a la Server Action */}
        {searchParams.get("redirect") && (
          <input
            type="hidden"
            name="redirect"
            value={searchParams.get("redirect") || ""}
          />
        )}
        {/* Campo oculto para pasar el plan seleccionado */}
        {searchParams.get("plan") && (
          <input
            type="hidden"
            name="plan"
            value={searchParams.get("plan") || ""}
          />
        )}
        {/* Email Field */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-foreground font-semibold block"
          >
            Correo electrónico
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            className="h-12 border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
          {state?.error && "email" in state.error && state.error.email && (
            <p className="text-sm text-red-600">{state.error.email[0]}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-foreground font-semibold block"
            >
              Contraseña
            </Label>
            <a
              href="/recuperar"
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            required
            className="h-12 border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
          {state?.error &&
            "password" in state.error &&
            state.error.password && (
              <p className="text-sm text-red-600">{state.error.password[0]}</p>
            )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            name="rememberMe"
            className="w-4 h-4 border-border bg-card checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50"
            checked={rememberMe}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              setRememberMe(checked === true)
            }
          />
          <Label
            htmlFor="remember"
            className="text-sm font-medium text-foreground cursor-pointer hover:text-muted-foreground transition-colors"
          >
            Recuerda mi sesión
          </Label>
        </div>

        {/* General Error Message */}
        {state?.error && "general" in state.error && state.error.general && (
          <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
            <p className="text-sm text-destructive">{state.error.general}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isPending}
        >
          {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O continúa con
            </span>
          </div>
        </div>

        {/* Google Login */}
        <GoogleButton />
      </form>

      {/* Signup Link */}
      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes una cuenta?{" "}
        <Link
          href={`/signup${
            searchParams.get("redirect") || searchParams.get("plan")
              ? "?" +
                new URLSearchParams({
                  ...(searchParams.get("redirect") && {
                    redirect: searchParams.get("redirect")!,
                  }),
                  ...(searchParams.get("plan") && {
                    plan: searchParams.get("plan")!,
                  }),
                }).toString()
              : ""
          }`}
          className="text-foreground hover:underline font-semibold transition-colors"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
