/**
 * Zustand Store for Authentication
 *
 * This store holds the client-side state for the current user and their
 * authentication status. It allows any component in the tree to access
 * this information without prop drilling.
 */

import { create } from "zustand";
import type { SafeUser } from "@/lib/auth";

// 1. DEFINE THE STORE'S STATE AND ACTIONS

interface AuthState {
  user: SafeUser | null;
  isAuthenticated: boolean;
  setUser: (user: SafeUser | null) => void;
}

// 2. CREATE THE STORE

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,

  // Action to update the state
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
}));
