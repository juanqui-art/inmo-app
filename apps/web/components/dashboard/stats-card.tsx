import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
  index?: number; // For staggered animation delay
  chart?: React.ReactNode;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  index = 0,
  chart,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
        className,
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Background Gradient Blob (Optional aesthetic touch) */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-primary/20" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </h3>
          </div>
        </div>

        <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {trend && (
            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
              {trend}
            </span>
          )}
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        {chart && <div className="flex-1 max-w-[100px]">{chart}</div>}
      </div>

      {/* Bottom Border Gradient */}
      <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-gradient-to-r from-primary to-cyan-500 transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}
