"use client";

/**
 * AUTH MODAL
 *
 * Modal para autenticación estilo Realtor.com
 * Aparece cuando usuario no autenticado intenta guardar favoritos
 *
 * Opciones:
 * 1. Email + Continue (redirige a signup)
 * 2. Google OAuth
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Button,
} from "@repo/ui";
import { GoogleButton } from "./google-button";
import { Users } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string;
}

export function AuthModal({ open, onOpenChange, propertyId }: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinueWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setIsLoading(true);

    // Guardar intent en localStorage para signup
    localStorage.setItem(
      "authIntent",
      JSON.stringify({
        action: "favorite",
        propertyId,
      })
    );

    // Redirigir a signup con email prefillado
    router.push(`/signup?email=${encodeURIComponent(email)}`);

    onOpenChange(false);
  };

  const handleGoogleBeforeRedirect = () => {
    // Guardar intent en localStorage antes de redirigir a Google
    // (sessionStorage se pierde durante OAuth redirect)
    localStorage.setItem(
      "authIntent",
      JSON.stringify({
        action: "favorite",
        propertyId,
      })
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        {/* Header */}
        <div className="space-y-3">
          <DialogTitle className="text-xl font-bold">
            Log in or create an account to save your favorite homes
          </DialogTitle>
          <DialogDescription className="text-base">
            Save your favorite home and enjoy it from anywhere, on any of your devices.
          </DialogDescription>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 text-sm text-oslo-gray-500">
          <Users className="h-4 w-4" />
          <span>+10,000 users already saving favorite properties</span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleContinueWithEmail} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-oslo-gray-300">
              Email address <span className="text-red-500">required</span>
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            disabled={isLoading || !email}
          >
            {isLoading ? "Loading..." : "Continue"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-oslo-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-oslo-gray-900 px-3 text-oslo-gray-500">or</span>
          </div>
        </div>

        {/* Google OAuth */}
        <div>
          <GoogleButton onBeforeRedirect={handleGoogleBeforeRedirect} />
        </div>

        {/* Terms Footer */}
        <p className="text-xs text-oslo-gray-500 text-center">
          By creating an account you agree to InmoApp's{" "}
          <a href="/terms" className="underline hover:text-oslo-gray-400">
            Terms of Use
          </a>
          {" "}and{" "}
          <a href="/privacy" className="underline hover:text-oslo-gray-400">
            Privacy Policy
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
