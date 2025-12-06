"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Building2, Calendar, Heart } from "lucide-react";

export type ActivityType = "APPOINTMENT" | "FAVORITE" | "PROPERTY_CREATED";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No hay actividad reciente para mostrar.
          </p>
          <p className="text-xs text-muted-foreground">
            Cuando agregues propiedades a favoritos o programes citas,
            aparecerán aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
      <div className="space-y-6">
        {activities.map((activity) => {
          let Icon = Building2;
          let iconColor = "text-primary";
          let bgColor = "bg-primary/10";

          switch (activity.type) {
            case "APPOINTMENT":
              Icon = Calendar;
              iconColor = "text-blue-500";
              bgColor = "bg-blue-500/10";
              break;
            case "FAVORITE":
              Icon = Heart;
              iconColor = "text-red-500";
              bgColor = "bg-red-500/10";
              break;
            case "PROPERTY_CREATED":
              Icon = Building2;
              iconColor = "text-yellow-500";
              bgColor = "bg-yellow-500/10";
              break;
          }

          return (
            <div key={activity.id} className="flex items-start gap-4">
              <div className={`rounded-full p-2 ${bgColor}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground pt-1">
                  {formatDistanceToNow(new Date(activity.date), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
