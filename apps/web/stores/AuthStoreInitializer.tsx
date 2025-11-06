"use client";

import { useRef } from "react";
import { useAuthStore } from "./auth-store";
import type { SafeUser } from "@/lib/auth";

interface AuthStoreInitializerProps {
  user: SafeUser | null;
}

/**
 * This component is responsible for initializing the AuthStore with data
 * fetched from a Server Component. It should be rendered once in the component tree.
 */
function AuthStoreInitializer({ user }: AuthStoreInitializerProps) {
  const initialized = useRef(false);

  // We use a ref to ensure this runs only once
  if (!initialized.current) {
    useAuthStore.getState().setUser(user);
    initialized.current = true;
  }

  return null; // This component renders nothing
}

export default AuthStoreInitializer;
