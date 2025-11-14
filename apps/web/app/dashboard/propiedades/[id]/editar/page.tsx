/**
 * EDITAR PROPIEDAD
 * Formulario para editar una propiedad existente
 * Solo el owner o ADMIN pueden editar
 */

import { propertyRepository } from "@repo/database";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePropertyAction } from "@/app/actions/properties";
import { ImageGallery } from "@/components/properties/image-gallery";
import { ImageUpload } from "@/components/properties/image-upload";
import { PropertyForm } from "@/components/properties/property-form";
import { requireRole } from "@/lib/auth";

interface EditarPropiedadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarPropiedadPage({
  params,
}: EditarPropiedadPageProps) {
  // Verificar autenticación
  const user = await requireRole(["AGENT", "ADMIN"]);

  // Obtener ID de la propiedad
  const { id } = await params;

  // Cargar propiedad
  const property = await propertyRepository.findById(id);

  if (!property) {
    notFound();
  }

  // Verificar ownership (ADMIN puede editar cualquier propiedad)
  if (property.agentId !== user.id && user.role !== "ADMIN") {
    throw new Error("No tienes permiso para editar esta propiedad");
  }

  // Note: property is already serialized (Decimal → number) by findByIdCached

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/propiedades"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Volver a propiedades
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Propiedad</h1>
        <p className="text-muted-foreground">{property.title}</p>
      </div>

      {/* Form */}
      <div className="max-w-3xl space-y-6">
        {/* Información de la propiedad */}
        <div className="rounded-lg border border-border bg-card p-6">
          <PropertyForm
            property={property}
            action={updatePropertyAction}
            submitLabel="Guardar Cambios"
          />
        </div>

        {/* Sección de imágenes */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">
                Imágenes de la Propiedad
              </h2>
              <p className="text-sm text-muted-foreground">
                La primera imagen será la imagen principal de la propiedad
              </p>
            </div>

            {/* Galería de imágenes existentes */}
            <div>
              <h3 className="text-sm font-medium mb-3">Imágenes Actuales</h3>
              <ImageGallery images={property.images} propertyId={id} />
            </div>

            {/* Upload de nuevas imágenes */}
            <div>
              <h3 className="text-sm font-medium mb-3">Agregar Más Imágenes</h3>
              <ImageUpload propertyId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
