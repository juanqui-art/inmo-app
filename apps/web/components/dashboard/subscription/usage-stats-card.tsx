"use client";

import type { UsageWithLimits } from "@/lib/dashboard/subscription-helpers";
import { getUsagePercentage, getWarningLevel } from "@/lib/dashboard/subscription-helpers";
import { Card, CardContent, CardHeader, Progress } from "@repo/ui";
import { AlertTriangle, Home, Image, Sparkles, Star, Video } from "lucide-react";
import Link from "next/link";

interface UsageStatsCardProps {
  usage: UsageWithLimits;
}

interface UsageItemProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  limit: number;
  unit?: string;
  isUnitLimit?: boolean;
}

function UsageItem({ icon, label, current, limit, unit = "", isUnitLimit = false }: UsageItemProps) {
  const percentage = getUsagePercentage(current, limit);
  const warningLevel = getWarningLevel(percentage);
  const isUnlimited = limit === Infinity;

  // Color schemes based on warning level
  const colors = {
    safe: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  const textColors = {
    safe: "text-green-700 dark:text-green-400",
    warning: "text-yellow-700 dark:text-yellow-400",
    danger: "text-red-700 dark:text-red-400",
  };
  
  // Special rendering for Per-Property Limits (Images, Videos)
  if (isUnitLimit) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">{icon}</div>
            <span className="text-sm font-medium">{label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
             <span className="font-semibold">{isUnlimited ? "∞" : limit}</span>
             <span className="text-muted-foreground">por propiedad</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground pl-7">
          {current} {unit} subid{unit.endsWith('s') ? 'as' : 'os'} en total (informativo)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">{icon}</div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold">{current}</span>
          <span className="text-sm text-muted-foreground">
            / {isUnlimited ? "∞" : limit} {unit}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {!isUnlimited && (
        <div className="space-y-1">
          <Progress
            value={percentage}
            className="h-2"
            indicatorClassName={colors[warningLevel]}
          />
          <div className="flex items-center justify-between text-xs">
            <span className={textColors[warningLevel]}>
              {percentage.toFixed(0)}% usado
            </span>
            {warningLevel === "danger" && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                <AlertTriangle className="w-3 h-3" />
                Cerca del límite
              </span>
            )}
            {warningLevel === "warning" && (
              <span className="text-yellow-600 dark:text-yellow-400">
                Considera actualizar
              </span>
            )}
          </div>
        </div>
      )}

      {isUnlimited && (
        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          Ilimitado
        </div>
      )}
    </div>
  );
}

export function UsageStatsCard({ usage }: UsageStatsCardProps) {
  // Check if any resource is at danger level
  const hasDangerLevel = [usage.properties, usage.images, usage.videos, usage.featured].some(
    ({ current, limit }) => {
      const percentage = getUsagePercentage(current, limit);
      return getWarningLevel(percentage) === "danger";
    }
  );

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Uso de Recursos</h3>
          {hasDangerLevel && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Límite alcanzado
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Monitorea tu consumo y límites del plan
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Properties */}
        <UsageItem
          icon={<Home className="w-5 h-5" />}
          label="Propiedades Activas"
          current={usage.properties.current}
          limit={usage.properties.limit}
        />

        {/* Images */}
        <UsageItem
          icon={<Image className="w-5 h-5" />}
          label="Imágenes"
          current={usage.images.current}
          limit={usage.images.limit}
          unit="imgs"
          isUnitLimit={usage.images.isUnitLimit}
        />

        {/* Videos */}
        {usage.videos.limit > 0 && (
          <UsageItem
            icon={<Video className="w-5 h-5" />}
            label="Videos"
            current={usage.videos.current}
            limit={usage.videos.limit}
            unit="videos"
            isUnitLimit={usage.videos.isUnitLimit}
          />
        )}

        {/* Featured Properties */}
        {usage.featured.limit > 0 && (
          <UsageItem
            icon={<Star className="w-5 h-5" />}
            label="Propiedades Destacadas"
            current={usage.featured.current}
            limit={usage.featured.limit}
          />
        )}

        {/* AI Description (Rate Limit Info) */}
        {/* We assume usage.videos.limit > 1 means AGENT or PRO (who have AI) */}
        {usage.videos.limit > 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground"><Sparkles className="w-5 h-5" /></div>
                <span className="text-sm font-medium">Generador IA</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">Activo</span>
                <span>• 30/hora</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pl-7">
              Genera descripciones automáticas para tus propiedades.
            </p>
          </div>
        )}

        {/* Upgrade CTA if hitting limits */}
        {hasDangerLevel && (
          <div className="pt-4 border-t">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <p className="text-sm font-medium mb-2">
                ¿Necesitas más espacio?
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Actualiza tu plan para obtener más propiedades, imágenes y funcionalidades.
              </p>
              <Link
                href="/dashboard/suscripcion/upgrade"
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver planes disponibles →
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
