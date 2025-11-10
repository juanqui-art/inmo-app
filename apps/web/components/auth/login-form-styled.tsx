"use client";

import { Button } from "@repo/ui";
import { Checkbox } from "@repo/ui";
import { Label } from "@repo/ui";
import { PasswordInput } from "@repo/ui";
import { Input } from "@repo/ui";
import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { GoogleButton } from "./google-button";

export function LoginFormStyled() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className=" text-4xl font-bold text-foreground mb-2">Bienvenido</h1>
        <p className="text-muted-foreground text-pretty">
          Inicia sesión para acceder a tu cuenta
        </p>
      </div>

      <form action={formAction} className="space-y-6">
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
        <a
          href="/signup"
          className="text-foreground hover:underline font-semibold transition-colors"
        >
          Regístrate aquí
        </a>
      </p>
    </div>
  );
}
