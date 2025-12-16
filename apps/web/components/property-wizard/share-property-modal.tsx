"use client";

/**
 * Share Property Modal
 * 
 * Allows agents to share their properties on social media
 * Available for all tier levels
 */

import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui";
import { Check, Copy, Facebook, Linkedin, MessageCircle, Share2, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
    const url = getShareUrl("copy");
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("¡Enlace copiado!");
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
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const socialButtons = [
    { 
      platform: "facebook",
      icon: Facebook, 
      label: "Facebook",
      className: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2]"
    },
    { 
      platform: "twitter",
      icon: Twitter, 
      label: "Twitter/X",
      className: "bg-black/10 hover:bg-black/20 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
    },
    { 
      platform: "whatsapp",
      icon: MessageCircle, 
      label: "WhatsApp",
      className: "bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366]"
    },
    { 
      platform: "linkedin",
      icon: Linkedin, 
      label: "LinkedIn",
      className: "bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2]"
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Compartir Propiedad
          </DialogTitle>
          <DialogDescription>
            Comparte esta propiedad en redes sociales
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Preview */}
          <div className="p-3 rounded-lg bg-oslo-gray-50 dark:bg-oslo-gray-900 border border-oslo-gray-200 dark:border-oslo-gray-800">
            <p className="font-medium text-sm truncate">{propertyTitle}</p>
            {propertyPrice && (
              <p className="text-lg font-bold text-primary">${propertyPrice.toLocaleString()}</p>
            )}
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {socialButtons.map(({ platform, icon: Icon, label, className }) => (
              <Button
                key={platform}
                variant="outline"
                size="lg"
                onClick={() => handleShare(platform)}
                className={`flex items-center gap-2 h-12 ${className}`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-oslo-gray-100 dark:bg-oslo-gray-800 text-sm truncate">
              {propertyUrl}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopyLink}
              className={copied ? "bg-green-500/10 text-green-600 border-green-500/30" : ""}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
