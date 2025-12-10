"use client";

import {
    checkIfFavoriteAction,
    toggleFavoriteAction,
} from "@/app/actions/favorites";
import { getPropertyPreviewAction } from "@/app/actions/properties";
import { ModalCarousel } from "@/components/properties/modal-carousel";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@repo/ui";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Separator } from "@repo/ui/components/ui/separator";
import {
    Bath,
    Bed,
    Calendar,
    Car,
    Heart,
    Loader2,
    MapPin,
    Maximize,
    Share2,
    User
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface PropertyPreviewData {
  id: string;
  title: string;
  price: number;
  description: string | null;
  address: string;
  city: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking?: number;
  yearBuilt?: number;
  images: { url: string; alt: string | null }[];
  agent: {
    name: string | null;
    email: string;
    image?: string | null;
    phone?: string | null;
  } | null;
  features?: string[];
  status?: string;
}

export default function PropertyPreviewModal({
  params,
}: {
  params: Promise<{ "id-slug": string }>;
}) {
  const router = useRouter();
  const [property, setProperty] = useState<PropertyPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Extract ID from id-slug parameter
  const extractId = useCallback((idSlug: string): string => {
    const uuidLength = 36;
    return idSlug.substring(0, uuidLength);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadProperty() {
      try {
        const resolvedParams = await params;
        const propertyId = extractId(resolvedParams["id-slug"]);

        // Fetch property and favorite status in parallel
        const [propertyResult, favoriteResult] = await Promise.all([
          getPropertyPreviewAction(propertyId),
          checkIfFavoriteAction(propertyId),
        ]);

        if (!isMounted) return;

        if (!propertyResult.success || !propertyResult.data) {
          setError(propertyResult.error || "Propiedad no encontrada");
          return;
        }

        setProperty(propertyResult.data as unknown as PropertyPreviewData); // Temporary cast until types align completely
        setIsFavorite(favoriteResult.success && favoriteResult.isFavorite);
      } catch {
        if (isMounted) setError("Error al cargar la propiedad");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProperty();
    return () => { isMounted = false; };
  }, [params, extractId]);

  const handleOpenChange = (open: boolean | undefined) => {
    if (!open) {
      router.back();
    }
  };

  const handleFavoriteToggle = () => {
    if (!property) return;

    startTransition(async () => {
      const result = await toggleFavoriteAction(property.id);
      if (result.success && result.isFavorite !== undefined) {
        setIsFavorite(result.isFavorite);
        toast.success(
          result.isFavorite ? "Agregado a favoritos" : "Eliminado de favoritos",
        );
      } else {
        toast.error(result.error || "Error al actualizar favoritos");
      }
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado al portapapeles");
  };

  const formattedPrice = property
    ? new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(property.price)
    : "";

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-5xl p-0 overflow-hidden sm:rounded-2xl max-h-[92vh] flex flex-col md:flex-row gap-0 bg-background border-border shadow-2xl">
        <DialogTitle className="sr-only">
          {property ? property.title : "Vista previa de propiedad"}
        </DialogTitle>
        
        {isLoading ? (
          <div className="w-full h-[60vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
           <div className="w-full h-[40vh] flex flex-col items-center justify-center gap-4">
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={() => router.back()} variant="outline">
              Volver
            </Button>
          </div>
        ) : property ? (
          <>
            {/* Left Column: Image Carousel */}
            <div className="w-full md:w-[55%] lg:w-[60%] bg-muted dark:bg-black/20 h-[40vh] md:h-auto md:max-h-[92vh] flex flex-col relative">
              <div className="flex-1 overflow-hidden relative">
                 <ModalCarousel images={property.images} title={property.title} />
                 
                 {/* Floating Actions on Image */}
                 <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-9 w-9 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-0 rounded-full"
                      onClick={handleShare}
                      title="Compartir"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-9 w-9 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-0 rounded-full"
                      onClick={handleFavoriteToggle}
                      disabled={isPending}
                      title={isFavorite ? "Quitar de favoritos" : "Guardar"}
                    >
                       <Heart className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                 </div>
                 
                 {property.status && (
                    <Badge className="absolute top-4 left-4 z-20 bg-primary text-primary-foreground">
                      {property.status}
                    </Badge>
                 )}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-background relative z-10">
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                       <motion.h2 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-bold leading-tight"
                       >
                         {property.title}
                       </motion.h2>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-1.5 text-muted-foreground"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm">
                        {property.address}
                        {property.city && `, ${property.city}`}
                      </span>
                    </motion.div>
                  </div>

                  {/* Price & Primary Stats */}
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="p-4 bg-muted/50 rounded-xl border border-border/50"
                  >
                     <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
                        {formattedPrice}
                     </p>
                     
                     <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center gap-1">
                           <div className="p-2 bg-background rounded-full shadow-sm">
                             <Bed className="h-4 w-4 text-muted-foreground" />
                           </div>
                           <span className="text-sm font-semibold">{property.bedrooms}</span>
                           <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Hab.</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                           <div className="p-2 bg-background rounded-full shadow-sm">
                             <Bath className="h-4 w-4 text-muted-foreground" />
                           </div>
                           <span className="text-sm font-semibold">{property.bathrooms}</span>
                           <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Baños</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                           <div className="p-2 bg-background rounded-full shadow-sm">
                             <Maximize className="h-4 w-4 text-muted-foreground" />
                           </div>
                           <span className="text-sm font-semibold">{property.area}</span>
                           <span className="text-[10px] text-muted-foreground uppercase tracking-wider">m²</span>
                        </div>
                     </div>
                  </motion.div>

                  {/* Description */}
                  {property.description && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Descripción</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                        {property.description}
                      </p>
                    </motion.div>
                  )}
                  
                  <Separator />

                  {/* Extra Details Grid */}
                  <motion.div 
                     className="grid grid-cols-2 gap-y-4 gap-x-2"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.4 }}
                  >
                     {property.parking !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Car className="h-4 w-4" />
                           <span>{property.parking} Estacionamientos</span>
                        </div>
                     )}
                     {property.yearBuilt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Calendar className="h-4 w-4" />
                           <span>Año {property.yearBuilt}</span>
                        </div>
                     )}
                  </motion.div>

                  {/* Agent Card */}
                  {property.agent && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4 p-4 rounded-xl border border-border/60 bg-gradient-to-br from-background to-muted/30"
                    >
                      <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Agente Inmobiliario</h3>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden relative">
                           {property.agent.image ? (
                              <img src={property.agent.image} alt={property.agent.name || "Agente"} className="w-full h-full object-cover" />
                           ) : (
                              <User className="h-5 w-5" />
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{property.agent.name || "Agente Inmobiliario"}</p>
                          <p className="text-sm text-muted-foreground truncate">{property.agent.email}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Footer Actions */}
              <div className="p-4 border-t border-border bg-background/95 backdrop-blur-sm sticky bottom-0 z-10 w-full mt-auto">
                 <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full" asChild>
                       <Link href={`/propiedades/${property.id}`} prefetch={false}>
                          Ver completa
                       </Link>
                    </Button>
                    <Button className="w-full" onClick={() => {
                        // Logic to open contact form or similar
                        toast.info("Función de contacto rápido próximamente");
                    }}>
                       Contactar
                    </Button>
                 </div>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
