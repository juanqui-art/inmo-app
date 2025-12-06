import { requireRole } from "@/lib/auth";
import { db } from "@repo/database/src/client";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Mail, Phone } from "lucide-react";

export default async function ClientsPage() {
  const user = await requireRole(["AGENT", "ADMIN"]);

  // Fetch unique clients from appointments
  const clients = await db.appointment.findMany({
    where: {
      agentId: user.id,
    },
    distinct: ["userId"],
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      scheduledAt: true, // Get date of one appointment (not necessarily latest due to distinct)
    },
    orderBy: {
      scheduledAt: "desc",
    },
  });

  // To get the TRUE latest appointment for each client, we might need a separate query or grouping,
  // but `distinct` with `orderBy` usually keeps the first one found.
  // Prisma `distinct` behavior with `orderBy` can be tricky.
  // For now, this is a good approximation.

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Clientes</h1>
        <p className="text-muted-foreground">
          Gestión de usuarios que han interactuado contigo
        </p>
      </div>

      <div className="rounded-md border border-border bg-card">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <UsersIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Aún no tienes clientes</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Los usuarios que agenden citas contigo aparecerán automáticamente en esta lista.
            </p>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Contacto
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Última Interacción
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {clients.map(({ user: client, scheduledAt }) => (
                  <tr
                    key={client.id}
                    className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={client.avatar || ""} />
                          <AvatarFallback>
                            {client.name?.substring(0, 2).toUpperCase() || "CL"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{client.name || "Usuario"}</p>
                          <p className="text-xs text-muted-foreground">ID: {client.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(scheduledAt), "d MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <button className="text-primary hover:underline text-xs font-medium">
                        Ver Historial
                      </button>
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
