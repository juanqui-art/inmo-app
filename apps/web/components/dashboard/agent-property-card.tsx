"use client";

import { deletePropertyAction } from "@/app/actions/properties";
import { formatPropertyPrice, getTransactionBadgeStyle, TRANSACTION_TYPE_LABELS } from "@/lib/utils/property-formatters";
import { generateSlug } from "@/lib/utils/slug-generator";
import type { PropertyWithRelations, SerializedProperty } from "@repo/database";
import {
    Badge,
    Button
} from "@repo/ui";
import {
    Bath,
    Bed,
    Calendar,
    Edit,
    ExternalLink,
    Eye,
    Heart,
    ImageIcon,
    MapPin,
    MoreHorizontal,
    Pause,
    Play,
    Ruler,
    Sparkles,
    Trash2,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AgentPropertyCardProps {
  property: PropertyWithRelations | SerializedProperty;
}

export function AgentPropertyCard({ property }: AgentPropertyCardProps) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const router = useRouter();
  
  const images = property.images || [];
  const imageUrl = images[0]?.url;
  const imageCount = images.length;
  const formattedPrice = formatPropertyPrice(property.price);
  const transactionBadgeStyle = getTransactionBadgeStyle(property.transactionType);
  
  // Status configuration with icons
  const statusConfig = {
    AVAILABLE: { 
      label: "Activa", 
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-500"
    },
    SOLD: { 
      label: "Vendida", 
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      dot: "bg-blue-500"
    },
    RENTED: { 
      label: "Rentada", 
      color: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      dot: "bg-violet-500"
    },
    PENDING: { 
      label: "Pendiente", 
      color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      dot: "bg-amber-500"
    },
    UNAVAILABLE: { 
      label: "Pausada", 
      color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      dot: "bg-slate-500"
    },
  };
  
  const status = statusConfig[property.status] || statusConfig.AVAILABLE;
  // Support both 'featured' (from serialized props) and 'isFeatured' (from Prisma)
  const isFeatured = Boolean(('featured' in property && property.featured) || ('isFeatured' in property && property.isFeatured));
  
  // Stats
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

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${property.title}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    setIsDeleted(true);
    toast.loading("Eliminando propiedad...", { id: `delete-${property.id}` });
    
    try {
      const result = await deletePropertyAction(property.id);
      
      if (result.success) {
        toast.success("Propiedad eliminada exitosamente", { id: `delete-${property.id}` });
        router.refresh();
      } else {
        setIsDeleted(false);
        toast.error(result.error || "Error al eliminar la propiedad", { id: `delete-${property.id}` });
      }
    } catch (error) {
      setIsDeleted(false);
      console.error("Error deleting property:", error);
      toast.error("Error al eliminar la propiedad", { id: `delete-${property.id}` });
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div 
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Featured Ribbon */}
      {isFeatured && (
        <div className="absolute top-4 -left-8 z-20 rotate-[-45deg]">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-10 py-1 shadow-lg">
            <Sparkles className="w-3 h-3 inline mr-1" />
            DESTACADA
          </div>
        </div>
      )}

      {/* Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Sin imágenes</p>
            </div>
          </div>
        )}
        
        {/* Image Count Badge */}
        {imageCount > 0 && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 text-white text-xs font-medium">
              <ImageIcon className="w-3.5 h-3.5" />
              {imageCount} {imageCount === 1 ? 'foto' : 'fotos'}
            </div>
          </div>
        )}

        {/* Status Badge with animated dot */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`${status.color} backdrop-blur-md border font-medium flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
            {status.label}
          </Badge>
        </div>
        
        {/* Transaction Type Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`${transactionBadgeStyle} backdrop-blur-md`}>
            {TRANSACTION_TYPE_LABELS[property.transactionType]}
          </Badge>
        </div>

        {/* Quick View Overlay */}
        <Link 
          href={`/propiedades/${property.id}-${generateSlug(property.title)}`}
          className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="transform transition-all duration-300 scale-90 group-hover:scale-100">
            <Button variant="secondary" size="sm" className="gap-2 shadow-lg">
              <ExternalLink className="w-4 h-4" />
              Ver Propiedad
            </Button>
          </div>
        </Link>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Header with Price */}
        <div className="space-y-1">
          <Link 
            href={`/propiedades/${property.id}-${generateSlug(property.title)}`}
            className="block group/title"
          >
            <h3 className="font-bold text-lg line-clamp-1 group-hover/title:text-primary transition-colors duration-200">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {formattedPrice}
            </p>
            {property.transactionType === "RENT" && (
              <span className="text-sm text-muted-foreground font-medium">/mes</span>
            )}
          </div>
        </div>

        {/* Location */}
        {(property.city || property.state) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground group/loc">
            <div className="p-1.5 rounded-md bg-muted/50 group-hover/loc:bg-primary/10 transition-colors">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <span className="line-clamp-1 font-medium">
              {[property.city, property.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Property Specs - Pill Style */}
        <div className="flex flex-wrap gap-2">
          {Number(property.bedrooms) > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
              <Bed className="h-4 w-4 text-primary" />
              <span className="font-semibold">{property.bedrooms}</span>
              <span className="text-muted-foreground text-xs">hab.</span>
            </div>
          )}
          {Number(property.bathrooms) > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
              <Bath className="h-4 w-4 text-primary" />
              <span className="font-semibold">{Number(property.bathrooms)}</span>
              <span className="text-muted-foreground text-xs">baños</span>
            </div>
          )}
          {Number(property.area) > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
              <Ruler className="h-4 w-4 text-primary" />
              <span className="font-semibold">{Number(property.area)}</span>
              <span className="text-muted-foreground text-xs">m²</span>
            </div>
          )}
        </div>

        {/* Stats - Modern Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-3 border border-blue-500/10">
            <div className="flex flex-col items-center">
              <Eye className="h-4 w-4 text-blue-500 mb-1" />
              <p className="text-xl font-bold">{stats.views}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vistas</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 p-3 border border-rose-500/10">
            <div className="flex flex-col items-center">
              <Heart className="h-4 w-4 text-rose-500 mb-1" />
              <p className="text-xl font-bold">{stats.favorites}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Favoritos</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-3 border border-emerald-500/10">
            <div className="flex flex-col items-center">
              <TrendingUp className="h-4 w-4 text-emerald-500 mb-1" />
              <p className="text-xl font-bold">{stats.contacts}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Contactos</p>
            </div>
          </div>
        </div>

        {/* Actions - Modern Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/50">
          <Link href={`/dashboard/propiedades/${property.id}/editar`} className="flex-1">
            <Button variant="default" size="sm" className="w-full gap-2 font-semibold">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 gap-2"
            onClick={() => {
              // TODO: Implement pause/activate toggle
              toast.info("Próximamente: Pausar/Activar propiedad");
            }}
          >
            {property.status === "AVAILABLE" ? (
              <>
                <Pause className="h-4 w-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Activar
              </>
            )}
          </Button>
          
          {/* More Actions Dropdown */}
          <div className="relative group/more">
            <Button 
              variant="ghost" 
              size="sm"
              className="px-2.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer - Updated Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span>Actualizada {formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
