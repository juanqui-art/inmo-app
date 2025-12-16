import { ProfileForm } from "@/components/dashboard/profile-form";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";
import { requireRole } from "@/lib/auth";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function ConfigurationPage() {
  const user = await requireRole(["AGENT", "ADMIN"]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil de agente y tu suscripción
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil Profesional</CardTitle>
            <CardDescription>
              Esta información será visible para tus clientes en tus propiedades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialName={user.name}
              initialPhone={user.phone}
            />
          </CardContent>
        </Card>

        {/* Subscription & Account */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Suscripción
              </CardTitle>
              <CardDescription>
                Plan actual y límites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plan Actual</p>
                  <p className="text-2xl font-bold text-primary">{user.subscriptionTier}</p>
                </div>
                {user.subscriptionTier !== "PRO" && (
                  <Link href="/pricing">
                    <Button variant="outline" size="sm">Mejorar Plan</Button>
                  </Link>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                ¿Necesitas cancelar o cambiar tu facturación? Contacta a soporte.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfil Público</CardTitle>
              <CardDescription>
                Ve cómo te ven tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/perfil" target="_blank">
                <Button variant="secondary" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver mi Perfil de Cliente
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <UpgradeModal />
    </div>
  );
}
