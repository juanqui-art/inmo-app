"use client";

/**
 * Share Property Modal - Premium Edition
 * 
 * Allows agents to share their properties on social media with UTM tracking
 * Features glassmorphism design, property preview, and smooth animations
 * Uses official brand SVG icons for visual consistency
 */

import { Button, Dialog, DialogContent } from "@repo/ui";
import { Check, Copy, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Official Brand SVG Icons
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.75 2.9 2.9 0 0 1 2.31-4.64 2.87 2.87 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.4-.05z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface SharePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  propertyPrice?: number;
  propertyImage?: string;
}

export function SharePropertyModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  propertyPrice,
  propertyImage,
}: SharePropertyModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate property URL with UTM params for tracking
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const propertyUrl = `${baseUrl}/propiedades/${propertyId}`;
  
  const getShareUrl = (platform: string) => {
    const utm = `utm_source=${platform}&utm_medium=social&utm_campaign=property_share`;
    return `${propertyUrl}?${utm}`;
  };

  const shareText = propertyPrice 
    ? `${propertyTitle} - $${propertyPrice.toLocaleString()}`
    : propertyTitle;

  const handleCopyLink = async () => {
    const url = getShareUrl("copy_link");
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("¡Enlace copiado al portapapeles!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(getShareUrl(platform));
    const text = encodeURIComponent(shareText);
    
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "instagram":
      case "tiktok":
        // These platforms don't have direct share, copy to clipboard
        navigator.clipboard.writeText(getShareUrl(platform));
        toast.success(`Enlace copiado. Pégalo en ${platform === "instagram" ? "Instagram Stories o DM" : "TikTok"}`);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      toast.success(`Compartiendo en ${platform}...`);
    }
  };

  // Social buttons with official SVG icons
  const socialButtons = [
    { 
      platform: "whatsapp",
      Icon: WhatsAppIcon,
      label: "WhatsApp",
      gradient: "from-[#25D366] to-[#128C7E]",
    },
    { 
      platform: "facebook",
      Icon: FacebookIcon,
      label: "Facebook",
      gradient: "from-[#1877F2] to-[#0C63D4]",
    },
    { 
      platform: "instagram",
      Icon: InstagramIcon,
      label: "Instagram",
      gradient: "from-[#E4405F] via-[#C13584] to-[#833AB4]",
    },
    { 
      platform: "tiktok",
      Icon: TikTokIcon,
      label: "TikTok",
      gradient: "from-black to-slate-700 dark:from-white dark:to-slate-300",
      darkIcon: true,
    },
    { 
      platform: "twitter",
      Icon: TwitterIcon,
      label: "X (Twitter)",
      gradient: "from-black to-slate-800 dark:from-white dark:to-slate-200",
      darkIcon: true,
    },
    { 
      platform: "linkedin",
      Icon: LinkedInIcon,
      label: "LinkedIn",
      gradient: "from-[#0A66C2] to-[#004182]",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg border-border/50 bg-background/95 backdrop-blur-xl">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-t-xl -mx-6 -mt-6 px-6 pt-6 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Compartir Propiedad
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Con tracking automático de origen
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 pt-2">
          {/* Property Preview Card */}
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
            {propertyImage && (
              <div className="relative h-32 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={propertyImage} 
                  alt={propertyTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className={propertyImage ? "p-4" : "p-4"}>
              <p className="font-semibold text-sm line-clamp-2 mb-1">{propertyTitle}</p>
              {propertyPrice && (
                <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  ${propertyPrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Social Buttons Grid */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Compartir en redes sociales
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {socialButtons.map(({ platform, Icon, label, gradient, darkIcon }) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-card hover:bg-muted/50 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} shadow-sm`}>
                      <Icon className={`w-5 h-5 ${darkIcon ? "text-white dark:text-black" : "text-white"}`} />
                    </div>
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Link Section */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              O copia el enlace
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative overflow-hidden rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm">
                <input 
                  type="text" 
                  value={propertyUrl}
                  readOnly
                  className="w-full px-4 py-3 bg-transparent text-sm font-mono truncate focus:outline-none"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopyLink}
                className={`h-12 w-12 rounded-xl transition-all duration-300 ${
                  copied 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20" 
                    : "hover:scale-105 active:scale-95"
                }`}
              >
                {copied ? (
                  <Check className="w-5 h-5 animate-in zoom-in duration-200" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <Check className="w-3.5 h-3.5" />
                ¡Enlace copiado con tracking UTM!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
