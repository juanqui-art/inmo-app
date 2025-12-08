
"use client";

import { deletePropertyAction } from "@/app/actions/properties";
import { formatPropertyPrice, getTransactionBadgeStyle, TRANSACTION_TYPE_LABELS } from "@/lib/utils/property-formatters";
import { generateSlug } from "@/lib/utils/slug-generator";
import type { PropertyWithRelations, SerializedProperty } from "@repo/database";
import {
    Badge,
    Button
} from "@repo/ui";
import { Bath, Bed, Calendar, Edit, Eye, Heart, MapPin, Maximize, Pause, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AgentPropertyCardProps {
  property: PropertyWithRelations | SerializedProperty;
}

export function AgentPropertyCard({ property }: AgentPropertyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  const imageUrl = property.images?.[0]?.url;
  const formattedPrice = formatPropertyPrice(property.price);
  const transactionBadgeStyle = getTransactionBadgeStyle(property.transactionType);
  
  // Get status info
  const statusConfig = {
    AVAILABLE: { label: "Activa", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    SOLD: { label: "Vendida", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    RENTED: { label: "Rentada", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    PENDING: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    UNAVAILABLE: { label: "Pausada", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  };
  
  const status = statusConfig[property.status] || statusConfig.AVAILABLE;
  
  // Stats - safely access relations with optional chaining
  const stats = {
    views: ('views' in property && Array.isArray(property.views)) ? property.views.length : 0,
    favorites: ('favorites' in property && Array.isArray(property.favorites)) ? property.favorites.length : 0,
    contacts: ('appointments' in property && Array.isArray(property.appointments)) ? property.appointments.length : 0,
  };
  
  const updatedAt = new Date(property.updatedAt);
  const formattedDate = updatedAt.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      {/* Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <Maximize className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`${status.color} backdrop-blur-md border font-medium`}>
            {status.label}
          </Badge>
        </div>
        
        {/* Transaction Type Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={transactionBadgeStyle}>
            {TRANSACTION_TYPE_LABELS[property.transactionType]}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <Link 
            href={`/propiedades/${property.id}-${generateSlug(property.title)}`}
            className="block group/title"
          >
            <h3 className="font-semibold text-lg line-clamp-1 group-hover/title:text-primary transition-colors">
              {property.title}
            </h3>
          </Link>
          <p className="text-2xl font-bold text-primary mt-1">
            {formattedPrice}
          </p>
        </div>

        {/* Location */}
        {(property.city || property.state) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">
              {[property.city, property.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Property Specs */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {Number(property.bedrooms) > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              <span className="font-medium text-foreground">{property.bedrooms}</span>
            </div>
          )}
          {Number(property.bathrooms) > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              <span className="font-medium text-foreground">{Number(property.bathrooms)}</span>
            </div>
          )}
          {Number(property.area) > 0 && (
            <div className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4" />
              <span className="font-medium text-foreground">{Number(property.area)}m²</span>
            </div>
          )}
        </div>

        {/* Stats - Glassmorphism Card */}
        <div className="relative overflow-hidden rounded-lg border border-border/50 bg-background/60 backdrop-blur-xl p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
              </div>
              <p className="text-lg font-bold">{stats.views}</p>
              <p className="text-xs text-muted-foreground">Vistas</p>
            </div>
            <div className="space-y-1 border-x border-border/50">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
              </div>
              <p className="text-lg font-bold">{stats.favorites}</p>
              <p className="text-xs text-muted-foreground">Favoritos</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <p className="text-lg font-bold">{stats.contacts}</p>
              <p className="text-xs text-muted-foreground">Contactos</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Link href={`/dashboard/propiedades/${property.id}/editar`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => {
              // TODO: Implement pause/activate toggle
              console.log("Toggle status:", property.id);
            }}
          >
            {property.status === "AVAILABLE" ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Activar
              </>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={async () => {
              if (!confirm(`¿Eliminar "${property.title}"?\n\nEsta acción no se puede deshacer.`)) {
                return;
              }
              
              setIsDeleting(true);
              
              try {
                const result = await deletePropertyAction(property.id);
                
                if (result.success) {
                  toast.success("Propiedad eliminada exitosamente");
                  router.refresh();
                } else {
                  toast.error(result.error || "Error al eliminar la propiedad");
                }
              } catch (error) {
                console.error("Error deleting property:", error);
                toast.error("Error al eliminar la propiedad");
              } finally {
                setIsDeleting(false);
              }
            }}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer - Last Updated */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <Calendar className="h-3 w-3" />
          <span>Actualizada: {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
