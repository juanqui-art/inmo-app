"use client";

import { createPropertyFromWizard } from "@/app/actions/wizard";
import { usePropertyWizardStore } from "@/lib/stores/property-wizard-store";
import { Card } from "@repo/ui";
import { Bath, BedDouble, CheckCircle2, Image as ImageIcon, MapPin, Ruler } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Helper for formatting price if the utility doesn't exist or is not exported
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

export function Step5() {
  const { formData, resetWizard } = usePropertyWizardStore();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      // Images are already uploaded in Step4, just create property with URLs
      console.log("[Review] Submitting property with imageUrls:", formData.imageUrls);
      
      const result = await createPropertyFromWizard({
        title: formData.title,
        description: formData.description,
        price: formData.price,
        transactionType: formData.transactionType,
        category: formData.category,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        amenities: formData.amenities,
        imageUrls: formData.imageUrls, // URLs from Step4
      });

      if (result.success) {
        console.log("Property created successfully:", result.propertyId);
        resetWizard();
        router.push("/dashboard/propiedades");
      } else {
        console.error("Error creating property:", result.error);
        alert(result.error || "Error al crear la propiedad");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      alert(error instanceof Error ? error.message : "Error al crear la propiedad");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Revisar y Publicar</h2>
        <p className="text-sm text-muted-foreground">
          Verifica que toda la información sea correcta antes de publicar tu propiedad.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Info Card */}
        <Card className="p-6 space-y-4 md:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{formData.title}</h3>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {formData.address}, {formData.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatPrice(formData.price)}</p>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                {formData.transactionType === "SALE" ? "Venta" : "Alquiler"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y">
            <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-lg">
              <BedDouble className="w-5 h-5 mb-1 text-muted-foreground" />
              <span className="font-semibold">{formData.bedrooms}</span>
              <span className="text-xs text-muted-foreground">Habitaciones</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-lg">
              <Bath className="w-5 h-5 mb-1 text-muted-foreground" />
              <span className="font-semibold">{formData.bathrooms}</span>
              <span className="text-xs text-muted-foreground">Baños</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-lg">
              <Ruler className="w-5 h-5 mb-1 text-muted-foreground" />
              <span className="font-semibold">{formData.area} m²</span>
              <span className="text-xs text-muted-foreground">Área</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Descripción</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {formData.description || "Sin descripción."}
            </p>
          </div>
        </Card>

        {/* Amenities */}
        <Card className="p-6 space-y-4">
          <h4 className="font-semibold">Amenidades</h4>
          {formData.amenities.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {formData.amenities.map((amenity) => (
                <li key={amenity} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="capitalize">{amenity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No se seleccionaron amenidades.</p>
          )}
        </Card>

        {/* Images Preview */}
        <Card className="p-6 space-y-4">
          <h4 className="font-semibold flex items-center justify-between">
            Galería
            <span className="text-xs font-normal text-muted-foreground">
              {formData.images.length} imágenes
            </span>
          </h4>
          
          {formData.images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {formData.images.slice(0, 6).map((file, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    fill
                    className="object-cover"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                </div>
              ))}
              {formData.images.length > 6 && (
                <div className="flex items-center justify-center bg-muted rounded-md text-sm font-medium text-muted-foreground">
                  +{formData.images.length - 6} más
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Sin imágenes</p>
            </div>
          )}
        </Card>
      </div>

      {/* Hidden submit button to be triggered by WizardLayout */}
      <form id="wizard-step-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="hidden">
        <button type="submit"></button>
      </form>
    </div>
  );
}
