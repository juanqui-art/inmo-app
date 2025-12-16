import { requireRole } from "@/lib/auth";
import { canCreateProperty, getImageLimit } from "@/lib/permissions/property-limits";
import { db } from "@repo/database";
import { Button } from "@repo/ui";
import { AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Lazy load property form (heavy component with validation + image uploads)
// Reduces initial bundle size by ~50-100KB
// Note: Client Component is automatically detected (no ssr: false needed in Next.js 16)
const NewPropertyClient = dynamic(
  () =>
    import("@/components/dashboard/property-wizard/new-property-client").then(
      (mod) => ({ default: mod.NewPropertyClient })
    ),
  {
    loading: () => (
      <div className="container max-w-4xl py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600" />
          <p className="text-sm text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    ),
  }
);

export default async function NewPropertyPage() {
  // 1. Verify Authentication & Role
  const user = await requireRole(["AGENT", "ADMIN"]);

  // 2. Check Limits
  const permission = await canCreateProperty(user.id);
  
  // 2.1 Get specifically the image limit for this user's tier
  // We need to fetch the user again or rely on canCreateProperty? canCreateProperty mostly checks count.
  // Converting requireRole result to have subscriptionTier if available?
  // requireRole returns User from auth/session, we might need DB user for tier if not in session.
  // Actually requireRole often returns enough info, but let's be safe and fetch simple tier if needed.
  // Wait, I can trust canCreateProperty logic or just fetch simple tier.
  // Optimizing: reuse the user object if it has tier, or simple fetch.
  // Let's do a quick fetch to be 100% sure of current tier.
  const dbUser = await db.user.findUnique({ 
    where: { id: user.id },
    select: { subscriptionTier: true }
  });
  
  const imageLimit = getImageLimit(dbUser?.subscriptionTier || "FREE");

  if (!permission.allowed) {
    const currentTier = dbUser?.subscriptionTier || "FREE";
    const nextTier = currentTier === "FREE" ? "PLUS" : currentTier === "PLUS" ? "AGENT" : "PRO";
    const nextTierLimit = nextTier === "PLUS" ? 3 : nextTier === "AGENT" ? 10 : 20;
    const nextTierPrice = nextTier === "PLUS" ? "$9.99" : nextTier === "AGENT" ? "$29.99" : "$59.99";

    return (
      <div className="container max-w-3xl py-12 px-4">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background via-background to-muted/30 shadow-xl">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative p-8 lg:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mb-5 border border-amber-500/30">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">
                Has alcanzado tu límite
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Tu plan <span className="font-semibold text-foreground">{currentTier}</span> permite <span className="font-semibold text-foreground">{permission.limit} {permission.limit === 1 ? 'propiedad' : 'propiedades'}</span>
              </p>
            </div>

            {/* Upgrade Comparison */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {/* Current Plan */}
              <div className="p-5 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Plan Actual</span>
                </div>
                <div className="text-xl font-bold mb-1">{currentTier}</div>
                <div className="text-sm text-muted-foreground">
                  {permission.limit} {permission.limit === 1 ? 'propiedad' : 'propiedades'} • {currentTier === "FREE" ? "6" : "25"} imágenes
                </div>
              </div>

              {/* Next Plan */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Recomendado</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl font-bold">{nextTier}</span>
                  <span className="text-sm text-muted-foreground">desde {nextTierPrice}/mes</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {nextTierLimit} propiedades • {nextTier === "PLUS" ? "25" : "20+"} imágenes
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Sin compromiso</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Cancela cuando quieras</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Activa al instante</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 px-8">
                <Link href="/pricing" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Ver planes disponibles
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/propiedades">
                  Gestionar propiedades
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Tienes dudas? <Link href="/vender#planes" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Compara todos los planes</Link>
        </p>
      </div>
    );
  }

  // 3. Render Wizard if allowed
  return <NewPropertyClient maxImages={imageLimit} />;
}
