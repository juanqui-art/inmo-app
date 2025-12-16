/**
 * CRM SERVER ACTIONS
 * 
 * Actions for managing AgentClient records:
 * - Update client status
 * - Update client notes
 * - Create new client (from appointment/favorite/manual)
 */

"use server";

import { requireRole } from "@/lib/auth";
import type { LeadStatus } from "@/lib/types/crm";
import { db } from "@repo/database/src/client";
import { revalidatePath } from "next/cache";

/**
 * Update client lead status
 */
export async function updateClientStatusAction(
  agentClientId: string,
  newStatus: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(["AGENT", "ADMIN"]);

    // Verify ownership
    const agentClient = await db.agentClient.findFirst({
      where: {
        id: agentClientId,
        agentId: user.id,
      },
    });

    if (!agentClient) {
      return { success: false, error: "Cliente no encontrado" };
    }

    // Update status
    await db.agentClient.update({
      where: { id: agentClientId },
      data: { status: newStatus },
    });

    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error) {
    console.error("Error updating client status:", error);
    return { success: false, error: "Error al actualizar estado" };
  }
}

/**
 * Update client notes
 */
export async function updateClientNotesAction(
  agentClientId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(["AGENT", "ADMIN"]);

    // Verify ownership
    const agentClient = await db.agentClient.findFirst({
      where: {
        id: agentClientId,
        agentId: user.id,
      },
    });

    if (!agentClient) {
      return { success: false, error: "Cliente no encontrado" };
    }

    // Update notes
    await db.agentClient.update({
      where: { id: agentClientId },
      data: { notes },
    });

    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error) {
    console.error("Error updating client notes:", error);
    return { success: false, error: "Error al actualizar notas" };
  }
}

/**
 * Create or get AgentClient record
 * Called when a client interacts with an agent (appointment, favorite, etc.)
 * 
 * Note: UTM fields require manual migration (see migrations/manual_utm_tracking.sql)
 */
export async function getOrCreateAgentClient(
  agentId: string,
  clientId: string,
  source: string,
  propertyId?: string,
  utmParams?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }
): Promise<{ success: boolean; agentClientId?: string; error?: string }> {
  try {
    // Check if relationship already exists
    const existing = await db.agentClient.findUnique({
      where: {
        agentId_clientId: {
          agentId,
          clientId,
        },
      },
    });

    if (existing) {
      // Update UTM if new data provided and existing doesn't have UTM
      // Note: utmSource field added via manual migration
      const existingWithUtm = existing as typeof existing & { utmSource?: string };
      if (utmParams?.utmSource && !existingWithUtm.utmSource) {
        await db.agentClient.update({
          where: { id: existing.id },
          data: {
            utmSource: utmParams.utmSource,
            utmMedium: utmParams.utmMedium,
            utmCampaign: utmParams.utmCampaign,
          } as any, // UTM fields added via manual migration
        });
      }
      return { success: true, agentClientId: existing.id };
    }

    // Create new relationship with UTM data
    const agentClient = await db.agentClient.create({
      data: {
        agentId,
        clientId,
        source,
        propertyId,
        status: "NEW",
        // UTM fields added via manual migration (manual_utm_tracking.sql)
        ...(utmParams?.utmSource && {
          utmSource: utmParams.utmSource,
          utmMedium: utmParams.utmMedium,
          utmCampaign: utmParams.utmCampaign,
        }),
      } as any, // Type assertion for fields added via manual migration
    });

    return { success: true, agentClientId: agentClient.id };
  } catch (error) {
    console.error("Error creating agent client:", error);
    return { success: false, error: "Error al crear relación cliente-agente" };
  }
}

/**
 * Delete client from CRM
 */
export async function deleteAgentClientAction(
  agentClientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(["AGENT", "ADMIN"]);

    // Verify ownership
    const agentClient = await db.agentClient.findFirst({
      where: {
        id: agentClientId,
        agentId: user.id,
      },
    });

    if (!agentClient) {
      return { success: false, error: "Cliente no encontrado" };
    }

    await db.agentClient.delete({
      where: { id: agentClientId },
    });

    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting agent client:", error);
    return { success: false, error: "Error al eliminar cliente" };
  }
}
