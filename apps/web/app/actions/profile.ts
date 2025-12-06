"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@repo/database/src/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
});

export async function updateProfileAction(formData: FormData) {
  try {
    const user = await requireRole(["AGENT", "ADMIN"]);

    const rawData = {
      name: formData.get("name"),
      phone: formData.get("phone"),
    };

    const validatedData = profileSchema.parse(rawData);

    await db.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        phone: validatedData.phone || null,
      },
    });

    revalidatePath("/dashboard/configuracion");
    return { success: true, message: "Perfil actualizado correctamente" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || "Error de validación",
      };
    }
    return {
      success: false,
      message: "Error al actualizar el perfil",
    };
  }
}
