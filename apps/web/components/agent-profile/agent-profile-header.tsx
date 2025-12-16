"use client";

import { Avatar, AvatarFallback, AvatarImage, Button } from "@repo/ui";
import { BadgeCheck, Calendar, FileText, Globe, Mail, MapPin, MessageCircle, Share2, Star } from "lucide-react";

interface AgentProfileHeaderProps {
  agent: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
    bio: string | null;
    licenseId: string | null;
    website: string | null;
    brandColor: string | null;
    logoUrl: string | null;
    createdAt: Date;
    _count: {
      properties: number;
    };
  };
}

export function AgentProfileHeader({ agent }: AgentProfileHeaderProps) {
  // Format member since date
  const memberSince = new Intl.DateTimeFormat("es-EC", {
    month: "long",
    year: "numeric",
  }).format(new Date(agent.createdAt));

  const initials = agent.name
    ? agent.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AG";

  const brandColor = agent.brandColor || "#4F46E5"; // Default indigo-600

  const handleWhatsApp = () => {
    if (!agent.phone) return;
    const phone = agent.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=Hola, vi tu perfil en InmoApp`, "_blank");
  };

  const handleEmail = () => {
    window.location.href = `mailto:${agent.email}`;
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Perfil de ${agent.name || "Agente"} | InmoApp`,
        text: `Mira las propiedades de ${agent.name || "este agente"} en InmoApp`,
        url: window.location.href,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  return (
    <div className="relative">
      {/* Cover Image Placeholder with Brand Overlay */}
      <div className="h-48 md:h-64 w-full bg-oslo-gray-900 overflow-hidden relative group">
          <div 
            className="absolute inset-0 opacity-80 mix-blend-multiply transition-colors duration-500" 
            style={{ backgroundColor: brandColor }}
          />
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 pb-6 border-b border-oslo-gray-200 dark:border-oslo-gray-800">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white dark:border-oslo-gray-950 shadow-xl bg-white dark:bg-oslo-gray-900 overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={agent.avatar || ""} alt={agent.name || "Agente"} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-oslo-gray-100 text-oslo-gray-500">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-2 border-white dark:border-oslo-gray-950 flex items-center justify-center">
                 <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Agent Info */}
            <div className="flex-1 space-y-4 md:mb-2 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  
                  {/* Agency Logo (if present) */}
                  {agent.logoUrl && (
                     <div className="mb-2 h-10 flex items-center">
                        <img src={agent.logoUrl} alt="Logo Agencia" className="h-full object-contain" />
                     </div>
                  )}

                  <div className="flex items-center gap-2">
                     <h1 className="text-3xl font-bold text-oslo-gray-950 dark:text-white">
                        {agent.name || "Agente Inmobiliario"}
                     </h1>
                     {agent.licenseId && (
                        <div title={`Licencia: ${agent.licenseId}`} className="text-green-600 dark:text-green-400">
                           <BadgeCheck className="w-6 h-6 fill-green-100 dark:fill-green-900/30" />
                        </div>
                     )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-oslo-gray-500 dark:text-oslo-gray-400">
                    <span className="flex items-center gap-1.5">
                       <MapPin className="w-4 h-4" />
                       Ecuador
                    </span>
                    <span className="flex items-center gap-1.5">
                       <Calendar className="w-4 h-4" />
                       Miembro desde {memberSince}
                    </span>
                    {agent.website && (
                      <a 
                        href={agent.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        style={{ color: brandColor }}
                      >
                         <Globe className="w-4 h-4" />
                         Sitio Web
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                   <Button variant="outline" size="icon" onClick={handleShare}>
                     <Share2 className="w-4 h-4" />
                   </Button>
                </div>
              </div>

              {/* Bio Section with Brand Border */}
              {agent.bio && (
                 <div 
                   className="bg-oslo-gray-50 dark:bg-oslo-gray-800/50 p-4 rounded-xl border-l-4 text-sm leading-relaxed text-oslo-gray-600 dark:text-oslo-gray-300 max-w-3xl"
                   style={{ borderLeftColor: brandColor }}
                 >
                    <p>{agent.bio}</p>
                 </div>
              )}

              {/* Stats & Badges */}
              <div className="flex flex-wrap items-center gap-3">
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    <Star className="w-3.5 h-3.5 fill-primary" />
                    Agente Verificado
                 </div>
                 {agent.licenseId && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium border border-green-500/20">
                       <FileText className="w-3.5 h-3.5" />
                       Licencia: {agent.licenseId}
                    </div>
                 )}
                 <div className="text-sm text-oslo-gray-600 dark:text-oslo-gray-300 ml-auto md:ml-0">
                    <strong className="text-oslo-gray-900 dark:text-white font-semibold">{agent._count.properties}</strong> propiedades activas
                 </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:self-center lg:self-end md:mb-4">
              {agent.phone && (
                <Button 
                  onClick={handleWhatsApp}
                  className="text-white border-0 shadow-lg transition-all hover:brightness-110"
                  style={{ backgroundColor: brandColor, boxShadow: `0 10px 15px -3px ${brandColor}40` }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              <Button onClick={handleEmail} variant="outline" className="bg-white dark:bg-oslo-gray-900 shadow-sm border-gray-200 dark:border-gray-800">
                <Mail className="w-4 h-4 mr-2" />
                Contactar
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
