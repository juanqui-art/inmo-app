/**
 * CLIENTS PAGE - CRM Lite
 * 
 * Manages agent's clients with:
 * - Lead status tracking (NEW → CLOSED)
 * - Notes per client
 * - Property interest
 * 
 * Available for AGENT tier and above.
 */

import { ClientActions } from "@/components/crm/client-actions";
import { ClientStatusBadge } from "@/components/crm/client-status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@repo/database/src/client";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    CheckCircle2,
    Clock,
    Mail,
    MessageSquare,
    Phone,
    Sparkles,
    Target,
    Users,
    XCircle
} from "lucide-react";

// Status configuration for display
const STATUS_CONFIG = {
  NEW: { label: "Nuevo", icon: Sparkles, color: "bg-blue-500" },
  CONTACTED: { label: "Contactado", icon: Phone, color: "bg-yellow-500" },
  INTERESTED: { label: "Interesado", icon: Target, color: "bg-purple-500" },
  NEGOTIATING: { label: "Negociando", icon: MessageSquare, color: "bg-orange-500" },
  CLOSED_WON: { label: "Cerrado", icon: CheckCircle2, color: "bg-green-500" },
  CLOSED_LOST: { label: "Perdido", icon: XCircle, color: "bg-red-500" },
} as const;

export default async function ClientsPage() {
  const user = await requireRole(["AGENT", "ADMIN"]);

  // Fetch clients from AgentClient model
  const agentClients = await db.agentClient.findMany({
    where: {
      agentId: user.id,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      property: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Count by status for stats
  const statusCounts = agentClients.reduce((acc, client) => {
    acc[client.status] = (acc[client.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tus leads y clientes potenciales
          </p>
        </div>
        {/* TODO: Add manual client button */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = statusCounts[status] || 0;
          const Icon = config.icon;
          return (
            <div
              key={status}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${config.color}/10`}>
                  <Icon className={`h-4 w-4 text-${config.color.replace('bg-', '')}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {config.label}
                </span>
              </div>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Clients Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {agentClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Aún no tienes clientes</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Los clientes se agregarán automáticamente cuando agenden citas o puedes agregarlos manualmente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                    Estado
                  </th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground hidden md:table-cell">
                    Propiedad de Interés
                  </th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground hidden lg:table-cell">
                    Notas
                  </th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground hidden sm:table-cell">
                    Última Actualización
                  </th>
                  <th className="h-12 px-4 text-right font-medium text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {agentClients.map((agentClient) => (
                  <tr
                    key={agentClient.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    {/* Client Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={agentClient.client.avatar || ""} />
                          <AvatarFallback>
                            {agentClient.client.name?.substring(0, 2).toUpperCase() || "CL"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {agentClient.client.name || "Usuario"}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {agentClient.client.email}
                            </span>
                            {agentClient.client.phone && (
                              <span className="hidden sm:flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {agentClient.client.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <ClientStatusBadge status={agentClient.status} />
                    </td>

                    {/* Interested Property */}
                    <td className="p-4 hidden md:table-cell">
                      {agentClient.property ? (
                        <span className="text-sm text-primary hover:underline cursor-pointer">
                          {agentClient.property.title.substring(0, 30)}
                          {agentClient.property.title.length > 30 && "..."}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>

                    {/* Notes Preview */}
                    <td className="p-4 hidden lg:table-cell max-w-xs">
                      {agentClient.notes ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {agentClient.notes}
                        </p>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">
                          Sin notas
                        </span>
                      )}
                    </td>

                    {/* Last Update */}
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(agentClient.updatedAt), "d MMM yyyy", {
                          locale: es,
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <ClientActions 
                        clientId={agentClient.id}
                        currentStatus={agentClient.status}
                        currentNotes={agentClient.notes || ""}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
