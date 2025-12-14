/**
 * UPGRADE HINT
 * 
 * Non-intrusive banner for FREE/PLUS users
 * Promotes upgrade to AGENT tier for advanced analytics.
 */

import { Button } from "@repo/ui";
import { BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";

interface UpgradeHintProps {
  /** Current user tier */
  currentTier: "FREE" | "PLUS";
}

export function UpgradeHint({ currentTier }: UpgradeHintProps) {
  const targetPrice = currentTier === "FREE" ? "$9.99" : "$29.99";
  
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-5">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Desbloquea Analytics Avanzados
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {currentTier === "FREE" 
                ? "Obtén tendencias, favoritos detallados y más con Plus"
                : "Gráficos de tendencia, reportes y estadísticas profesionales"
              }
            </p>
          </div>
        </div>
        
        <Link href="/vender#planes">
          <Button variant="default" size="sm" className="gap-2 whitespace-nowrap">
            <Sparkles className="h-4 w-4" />
            Ver planes desde {targetPrice}
          </Button>
        </Link>
      </div>
    </div>
  );
}
