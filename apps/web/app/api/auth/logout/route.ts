/**
 * Logout API Route
 *
 * POST /api/auth/logout
 *
 * PURPOSE:
 * - Sign out user from Supabase Auth
 * - Clear auth cookies
 * - Redirect to homepage
 *
 * WHY API Route?
 * - Form actions need POST endpoint
 * - Supabase signOut() is server-only
 * - Need to handle redirect after logout
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST() {
  try {
    const supabase = await createClient();

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Redirect to homepage
    return NextResponse.redirect(new URL("/", env.NEXT_PUBLIC_SITE_URL), {
      status: 303,
    });
  } catch (error) {
    console.error("Unexpected logout error:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
