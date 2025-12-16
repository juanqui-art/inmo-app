"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@repo/database/src/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  bio: z.string().max(500, "La biografía no puede exceder 500 caracteres").optional(),
  licenseId: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  brandColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Color inválido").optional(),
  logoUrl: z.string().url("URL de logo inválida").optional().or(z.literal("")),
});

export async function updateProfileAction(formData: FormData) {
  try {
    const user = await requireRole(["AGENT", "ADMIN"]);

    const rawData = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      bio: formData.get("bio"),
      licenseId: formData.get("licenseId"),
      website: formData.get("website"),
      brandColor: formData.get("brandColor"),
      logoUrl: formData.get("logoUrl"),
    };

    const validatedData = profileSchema.parse(rawData);

    await db.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        phone: validatedData.phone || null,
        bio: validatedData.bio || null,
        licenseId: validatedData.licenseId || null,
        website: validatedData.website || null,
        brandColor: validatedData.brandColor || null,
        logoUrl: validatedData.logoUrl || null,
      },
    });

    revalidatePath("/dashboard/configuracion");
    revalidatePath(`/agentes/${user.id}`);
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
