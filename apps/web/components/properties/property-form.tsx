/**
 * PROPERTY FORM
 * Formulario compartido para crear y editar propiedades
 * Con soporte para features tier-locked (Videos, AI Description)
 */

"use client";

import { generatePropertyDescription } from "@/app/actions/ai-description";
import { ImageGallery } from "@/components/properties/image-gallery";
import { ImageUpload } from "@/components/properties/image-upload";
import { VideoUrlInput } from "@/components/property-wizard/video-url-input";
import { VideoList } from "@/components/property-wizard/video-list";
import { getImageLimit, getTierDisplayName } from "@/lib/permissions/property-limits";
import type { SerializedProperty, SubscriptionTier } from "@repo/database";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Checkbox,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Textarea
} from "@repo/ui";
import { Loader2, Lock, Sparkles, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LimitReachedModal } from "../modals/limit-reached-modal";
import { LocationPickerMap } from "./location-picker-map";

const AMENITIES_LIST = [
  { id: "pool", label: "Piscina" },
  { id: "gym", label: "Gimnasio" },
  { id: "garage", label: "Garaje" },
  { id: "garden", label: "Jardín" },
  { id: "terrace", label: "Terraza" },
  { id: "security", label: "Seguridad 24/7" },
  { id: "elevator", label: "Ascensor" },
  { id: "ac", label: "Aire Acondicionado" },
  { id: "heating", label: "Calefacción" },
  { id: "internet", label: "Internet / Wifi" },
  { id: "furnished", label: "Amoblado" },
  { id: "pets_allowed", label: "Mascotas Permitidas" },
];

interface PropertyFormState {
  error?: {
    title?: string[];
    description?: string[];
    price?: string[];
    transactionType?: string[];
    category?: string[];
    status?: string[];
    bedrooms?: string[];
    bathrooms?: string[];
    area?: string[];
    address?: string[];
    city?: string[];
    state?: string[];
    zipCode?: string[];
    latitude?: string[];
    longitude?: string[];
    amenities?: string[];
    general?: string;
  };
  success?: boolean;
  data?: any;
  upgradeRequired?: boolean;
  currentLimit?: number;
}

interface PropertyFormProps {
  property?: SerializedProperty;
  action: any; // Server Action
  submitLabel: string;
  // Tier info for feature gating
  userTier?: SubscriptionTier;
  videoLimit?: number;
  existingVideos?: { url: string; platform: string }[];
}

export function PropertyForm({
  property,
  action,
  submitLabel,
  userTier = "FREE",
  videoLimit = 0,
  existingVideos = [],
}: PropertyFormProps) {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [state, formAction, isPending] =
    useActionState<PropertyFormState | null>(action, null);
  const router = useRouter();
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitData, setLimitData] = useState<{
    currentTier: SubscriptionTier;
    limit: number;
  } | null>(null);

  // Estados locales para mapa, amenities y videos
  const [latitude, setLatitude] = useState<number>(property?.latitude || -2.9001); // Cuenca default
  const [longitude, setLongitude] = useState<number>(property?.longitude || -79.0059);
  const [amenities, setAmenities] = useState<string[]>(property?.amenities || []);
  const [videos, setVideos] = useState<{ url: string; platform: string }[]>(existingVideos);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Feature access checks
  const canUseAI = userTier === "BUSINESS" || userTier === "PRO";
  const tierDisplayName = getTierDisplayName(userTier);
  const imageLimit = getImageLimit(userTier);
  const currentImageCount = property?.images?.length || 0;



  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleAmenityToggle = (amenityId: string) => {
    setAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(a => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  useEffect(() => {
    if (state?.upgradeRequired) {
      setLimitData({
        currentTier: "FREE", 
        limit: state.currentLimit || 0,
      });
      setLimitModalOpen(true);
    }
  }, [state]);

  // Handle AI description generation
  const handleGenerateDescription = async () => {
    if (!canUseAI) {
      toast.error("Las descripciones con IA están disponibles desde el plan Agente");
      return;
    }

    setIsGeneratingAI(true);
    toast.loading("Generando descripción...", { id: "ai-description" });

    try {
      const result = await generatePropertyDescription({
        title: property?.title || "",
        transactionType: property?.transactionType || "SALE",
        category: property?.category || "HOUSE",
        bedrooms: property?.bedrooms || 0,
        bathrooms: property?.bathrooms || 0,
        area: property?.area || 0,
        address: property?.address || "",
        city: property?.city || "",
        amenities: amenities,
        price: property?.price || 0,
      });

      if (result.success && result.description && descriptionRef.current) {
        descriptionRef.current.value = result.description;
        toast.success("¡Descripción generada!", { id: "ai-description" });
      } else {
        toast.error(result.error || "No se pudo generar la descripción", { 
          id: "ai-description" 
        });
      }
    } catch {
      toast.error("Error al generar descripción", { id: "ai-description" });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <>
      <form action={formAction} className="space-y-10">
        {/* Hidden inputs for non-standard form fields */}
        {property && <input type="hidden" name="id" value={property.id} />}
        <input type="hidden" name="latitude" value={latitude} />
        <input type="hidden" name="longitude" value={longitude} />
        <input type="hidden" name="videos" value={JSON.stringify(videos)} />
        {amenities.map(amenity => (
           <input key={amenity} type="hidden" name="amenities" value={amenity} /> 
        ))}

        {/* --- SECCIÓN 1: Información Principal --- */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Detalles principales para publicar tu propiedad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={property?.title}
                placeholder="Ej: Hermosa casa en zona residencial"
                className="text-lg"
                required
              />
              {state?.error?.title && (
                <p className="text-sm text-destructive">{state.error.title[0]}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Precio (USD) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={property?.price}
                    placeholder="150000"
                    className="pl-7"
                    required
                  />
                </div>
                {state?.error?.price && (
                  <p className="text-sm text-destructive">{state.error.price[0]}</p>
                )}
              </div>

              {/* Status (solo en edición) */}
              {property && (
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select name="status" defaultValue={property.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Disponible</SelectItem>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="SOLD">Vendida</SelectItem>
                      <SelectItem value="RENTED">Rentada</SelectItem>
                    </SelectContent>
                  </Select>
                  {state?.error?.status && (
                    <p className="text-sm text-destructive">
                      {state.error.status[0]}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Description with AI Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">
                  Descripción <span className="text-destructive">*</span>
                </Label>
                {/* AI Description Button */}
                {canUseAI ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingAI}
                    className="gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30 hover:border-violet-500/50 hover:from-violet-500/20 hover:to-purple-500/20 text-violet-700 dark:text-violet-300"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Generando...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Generar con IA</span>
                        <Sparkles className="w-3 h-3" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                    className="gap-2 opacity-60"
                  >
                    <Lock className="w-3 h-3" />
                    <span className="hidden sm:inline">IA</span>
                    <span className="text-xs text-muted-foreground">(Agente+)</span>
                  </Button>
                )}
              </div>
              <Textarea
                id="description"
                name="description"
                ref={descriptionRef}
                defaultValue={property?.description || ""}
                placeholder="Describe las características, ventajas y detalles únicos de la propiedad..."
                rows={5}
                required
              />
              {state?.error?.description && (
                <p className="text-sm text-destructive">
                  {state.error.description[0]}
                </p>
              )}
            </div>

            <Separator />

            {/* Category & Transaction */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transactionType">Tipo de Transacción</Label>
                <Select
                  name="transactionType"
                  defaultValue={property?.transactionType || "SALE"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona operación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALE">Venta</SelectItem>
                    <SelectItem value="RENT">Arriendo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Tipo de Inmueble</Label>
                <Select
                  name="category"
                  defaultValue={property?.category || "HOUSE"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOUSE">Casa</SelectItem>
                    <SelectItem value="APARTMENT">Departamento</SelectItem>
                    <SelectItem value="SUITE">Suite</SelectItem>
                    <SelectItem value="VILLA">Villa</SelectItem>
                    <SelectItem value="PENTHOUSE">Penthouse</SelectItem>
                    <SelectItem value="DUPLEX">Dúplex</SelectItem>
                    <SelectItem value="LOFT">Loft</SelectItem>
                    <SelectItem value="LAND">Terreno</SelectItem>
                    <SelectItem value="COMMERCIAL">Local Comercial</SelectItem>
                    <SelectItem value="OFFICE">Oficina</SelectItem>
                    <SelectItem value="WAREHOUSE">Bodega</SelectItem>
                    <SelectItem value="FARM">Finca/Hacienda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- SECCIÓN 2: Imágenes --- */}
        {property && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Galería de Imágenes</CardTitle>
              <CardDescription>
                Gestiona las fotos de tu propiedad. La primera será la principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-sm font-medium mb-3">Imágenes Actuales</h3>
                <ImageGallery
                  images={property.images || []}
                  propertyId={property.id}
                  onImageDeleted={() => router.refresh()}
                  onImagesReordered={() => router.refresh()}
                  userTier={userTier}
                />
              </div>

              <div className="pt-4 border-t">
                 <h3 className="text-sm font-medium mb-3">Subir Nuevas Fotos</h3>
                 <ImageUpload
                   propertyId={property.id}
                   onUploadComplete={() => router.refresh()}
                   maxImages={imageLimit}
                   currentImageCount={currentImageCount}
                   tier={userTier}
                 />
              </div>
            </CardContent>
          </Card>
        )}

        {/* --- SECCIÓN 3: Detalles y Amenidades --- */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Características Detalladas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Dimensions Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Dormitorios</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  defaultValue={property?.bedrooms || undefined}
                  placeholder="Ej: 3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  step="0.5"
                  min="0"
                  defaultValue={property?.bathrooms ?? undefined}
                  placeholder="Ej: 2.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área (m²)</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={property?.area ?? undefined}
                  placeholder="Ej: 120"
                />
              </div>
            </div>

            <Separator />

            {/* Amenities Grid */}
            <div className="space-y-4">
              <Label className="text-base">Amenidades y Servicios</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {AMENITIES_LIST.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex flex-row items-center space-x-3 rounded-md border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={amenities.includes(amenity.id)}
                      onCheckedChange={() => handleAmenityToggle(amenity.id)}
                    />
                    <Label
                      htmlFor={`amenity-${amenity.id}`}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- SECCIÓN 3: Videos (Tier-locked) --- */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Videos</span>
              <span className={`text-xs font-normal px-2 py-1 rounded-full ${
                videoLimit > 0 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {videoLimit > 0 ? `Plan ${tierDisplayName}` : "Plan Plus+"}
              </span>
            </CardTitle>
            <CardDescription>
              Agrega videos de YouTube, TikTok, Instagram, Facebook o Vimeo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {videoLimit > 0 ? (
              <>
                <VideoUrlInput
                  onAdd={(video) => {
                    setVideos([...videos, video]);
                  }}
                  disabled={videos.length >= videoLimit}
                />

                {videos.length >= videoLimit && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Has alcanzado el límite de {videoLimit} videos de tu plan.
                  </p>
                )}

                <VideoList
                  videos={videos}
                  onRemove={(index) => {
                    setVideos(videos.filter((_, i) => i !== index));
                  }}
                />
              </>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Los videos están disponibles desde el plan Plus</p>
                <p className="text-xs mt-1">Actualiza tu plan para agregar videos a tus propiedades</p>
              </div>
            )}

            {/* Hidden inputs for video URLs */}
            {videos.map((video, index) => (
              <input
                key={`video-${index}`}
                type="hidden"
                name="videoUrls"
                value={JSON.stringify(video)}
              />
            ))}
          </CardContent>
        </Card>

        {/* --- SECCIÓN 4: Ubicación y Mapa --- */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Ubicación</CardTitle>
            <CardDescription>
              Define la dirección exacta y ajusta el pin en el mapa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección Completa</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={property?.address || ""}
                  placeholder="Calle Principal 123 y Secundaria"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={property?.city || ""}
                  placeholder="Ej: Quito"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Provincia / Estado</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={property?.state || ""}
                  placeholder="Ej: Pichincha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">Código Postal</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  defaultValue={property?.zipCode || ""}
                  placeholder="Ej: 170150"
                  className="bg-background"
                />
              </div>
            </div>

            <Separator />

            {/* Manual Coordinates */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Coordenadas Geográficas</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Útil para ubicaciones rurales donde la dirección no es suficiente.
                  Se actualizan automáticamente al mover el pin en el mapa.
                </p>
              </div>
              <div className="grid gap-6 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude-input">Latitud</Label>
                  <Input
                    id="latitude-input"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    placeholder="-2.9001"
                    className="font-mono text-sm bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude-input">Longitud</Label>
                  <Input
                    id="longitude-input"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    placeholder="-79.0059"
                    className="font-mono text-sm bg-background"
                  />
                </div>
              </div>
            </div>


            {/* MAPA */}
            <div className="space-y-3 pt-2">
              <Label>Ubicación en el Mapa (Arrastra el marcador)</Label>
              <div className="rounded-md border overflow-hidden">
                <LocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* General Error */}
        {state?.error?.general && (
          <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
            <p className="text-sm font-medium text-destructive">{state.error.general}</p>
          </div>
        )}

        {/* Sticky Action Bar */}
        <div className="sticky bottom-0 z-10 -mx-6 -mb-6 p-6 bg-background/80 backdrop-blur-sm border-t flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </form>

      <LimitReachedModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        limitType="property"
        currentTier={limitData?.currentTier || "FREE"}
        limit={limitData?.limit || 0}
      />
    </>
  );
}
