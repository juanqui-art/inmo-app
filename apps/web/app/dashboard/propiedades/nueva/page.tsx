import dynamic from "next/dynamic";
import { requireRole } from "@/lib/auth";
import { canCreateProperty, getImageLimit } from "@/lib/permissions/property-limits";

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
import { db } from "@repo/database";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

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
    return (
      <div className="container max-w-2xl py-20">
        <Card className="border-destructive/20 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Límite de Propiedades Alcanzado</CardTitle>
            <CardDescription className="text-lg pt-2">
              {permission.reason}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>
              Tu plan actual tiene un límite de <strong>{permission.limit} {permission.limit === 1 ? 'propiedad' : 'propiedades'}</strong>.
              Para seguir publicando, necesitas actualizar tu suscripción.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
            <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard?upgrade=true">
                Actualizar Plan ahora
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard/propiedades">
                Gestionar mis propiedades
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 3. Render Wizard if allowed
  return <NewPropertyClient maxImages={imageLimit} />;
}
