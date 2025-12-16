"use client";

import { pricingTiers } from "@/lib/pricing/tiers";
import type { SubscriptionTier } from "@repo/database";
import { Badge, Button, Card, CardContent, CardHeader } from "@repo/ui";
import { Check, X } from "lucide-react";
import Link from "next/link";

interface PlanComparisonTableProps {
  currentTier: SubscriptionTier;
}

const features = [
  { label: "Propiedades activas", key: "properties" as const },
  { label: "Imágenes por propiedad", key: "images" as const },
  { label: "Videos por propiedad", key: "videos" as const },
  { label: "Propiedades destacadas", key: "featured" as const },
  { label: "Generador de descripción IA", key: "aiDescription" as const },
  { label: "CRM para leads", key: "crm" as const },
  { label: "Landing page personal", key: "landingPage" as const },
  { label: "Analytics básico", key: "analytics" as const },
];

const featureValues: Record<SubscriptionTier, Record<typeof features[number]["key"], string | boolean>> = {
  FREE: {
    properties: "1",
    images: "6",
    videos: "0",
    featured: "0",
    aiDescription: false,
    crm: false,
    landingPage: false,
    analytics: false,
  },
  PLUS: {
    properties: "3",
    images: "25",
    videos: "1",
    featured: "1",
    aiDescription: false,
    crm: false,
    landingPage: false,
    analytics: false,
  },
  AGENT: {
    properties: "10",
    images: "20",
    videos: "3",
    featured: "5",
    aiDescription: true,
    crm: true,
    landingPage: true,
    analytics: true,
  },
  PRO: {
    properties: "20",
    images: "25",
    videos: "10",
    featured: "∞",
    aiDescription: true,
    crm: true,
    landingPage: true,
    analytics: true,
  },
};

export function PlanComparisonTable({ currentTier }: PlanComparisonTableProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <h3 className="text-lg font-semibold">Compara Planes</h3>
        <p className="text-sm text-muted-foreground">
          Encuentra el plan perfecto para tus necesidades
        </p>
      </CardHeader>

      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                  Funcionalidad
                </th>
                {pricingTiers.map((tier) => (
                  <th key={tier.name} className="text-center py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-sm">{tier.displayName}</span>
                        {tier.name === currentTier && (
                          <Badge variant="secondary" className="text-xs">
                            Actual
                          </Badge>
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        ${tier.price}
                        <span className="text-xs font-normal text-muted-foreground">
                          /{tier.period}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr
                  key={feature.key}
                  className={idx % 2 === 0 ? "bg-muted/30" : ""}
                >
                  <td className="py-3 px-4 text-sm">{feature.label}</td>
                  {pricingTiers.map((tier) => {
                    const value = featureValues[tier.name as SubscriptionTier][feature.key];
                    const isCurrent = tier.name === currentTier;

                    return (
                      <td
                        key={tier.name}
                        className={`py-3 px-4 text-center ${
                          isCurrent ? "bg-primary/5 font-medium" : ""
                        }`}
                      >
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-medium">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-4 rounded-lg border-2 ${
                tier.name === currentTier
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{tier.displayName}</h4>
                    {tier.name === currentTier && (
                      <Badge variant="secondary" className="text-xs">
                        Actual
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold">
                    ${tier.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{tier.period}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {features.map((feature) => {
                  const value = featureValues[tier.name as SubscriptionTier][feature.key];
                  return (
                    <div
                      key={feature.key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{feature.label}</span>
                      {typeof value === "boolean" ? (
                        value ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30" />
                        )
                      ) : (
                        <span className="font-medium">{value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {currentTier !== "PRO" && (
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-3">
              ¿Listo para actualizar tu plan?
            </p>
            <Button asChild size="lg">
              <Link href="/vender">Ver Planes Completos</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
