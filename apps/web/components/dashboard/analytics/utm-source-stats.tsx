"use client";

import type { UtmSourceStat } from "@/lib/dashboard/utm-analytics-helpers";
import { Card, CardContent, CardHeader, Progress } from "@repo/ui";
import { ExternalLink, Globe, Hash, Megaphone } from "lucide-react";

interface UtmSourceStatsProps {
  stats: UtmSourceStat[];
  totalLeads: number;
}

export function UtmSourceStats({ stats, totalLeads }: UtmSourceStatsProps) {
  // Helper to choose icon based on source
  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("facebook") || s.includes("instagram") || s.includes("tiktok")) return <Megaphone className="w-4 h-4" />;
    if (s.includes("google")) return <Globe className="w-4 h-4" />;
    return <ExternalLink className="w-4 h-4" />;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              Fuentes de Leads
            </h3>
            <p className="text-sm text-muted-foreground">
              ¿De dónde vienen tus clientes potenciales?
            </p>
          </div>
          <div className="text-right">
             <span className="text-2xl font-bold">{totalLeads}</span>
             <p className="text-xs text-muted-foreground">Total leads</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {stats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>No hay datos suficientes aún.</p>
            <p className="text-xs mt-1">Comparte tus propiedades para empezar a rastrear.</p>
          </div>
        ) : (
          stats.map((stat) => (
            <div key={stat.source} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                    {getSourceIcon(stat.source)}
                  </div>
                  <span className="font-medium capitalize">
                    {stat.source.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{stat.count}</span>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {stat.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <Progress value={stat.percentage} className="h-1.5" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
