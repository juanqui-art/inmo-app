"use client";

import { Button } from "@repo/ui";
import { Link2, Play, Trash2, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VideoEntry {
  url: string;
  platform: string;
  title?: string;
}

interface VideoUrlInputProps {
  videos: VideoEntry[];
  maxVideos: number;
  tierName: string;
  onVideosChange: (videos: VideoEntry[]) => void;
}

// Pattern matchers for supported platforms
const PLATFORM_PATTERNS: Record<string, RegExp> = {
  YOUTUBE: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  TIKTOK: /tiktok\.com\/@[^/]+\/video\/(\d+)/,
  INSTAGRAM: /instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/,
  FACEBOOK: /facebook\.com\/(?:watch\/?\?v=|.*\/videos\/)(\d+)/,
  VIMEO: /vimeo\.com\/(\d+)/,
};

/**
 * Detect video platform from URL
 */
function detectPlatform(url: string): string | null {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return null;
}

/**
 * Validate if URL is a valid video URL
 */
function isValidVideoUrl(url: string): boolean {
  try {
    new URL(url);
    return detectPlatform(url) !== null;
  } catch {
    return false;
  }
}

/**
 * Get platform display name
 */
function getPlatformDisplayName(platform: string): string {
  switch (platform) {
    case "YOUTUBE": return "YouTube";
    case "TIKTOK": return "TikTok";
    case "INSTAGRAM": return "Instagram";
    case "FACEBOOK": return "Facebook";
    case "VIMEO": return "Vimeo";
    default: return "Video";
  }
}

/**
 * Get platform icon
 */
function PlatformIcon({ platform }: { platform: string }) {
  // We use Play as default, YouTube has its own icon
  if (platform === "YOUTUBE") {
    return <Youtube className="w-5 h-5 text-red-500" />;
  }
  return <Play className="w-5 h-5 text-primary" />;
}

export function VideoUrlInput({
  videos = [],
  maxVideos = 0,
  tierName,
  onVideosChange,
}: VideoUrlInputProps) {
  const [inputUrl, setInputUrl] = useState("");

  // Safe check with default empty array
  const videoList = videos ?? [];
  const canAddMore = videoList.length < maxVideos;
  const isDisabled = maxVideos === 0;

  const handleAddVideo = () => {
    if (!inputUrl.trim()) {
      toast.error("Ingresa una URL de video");
      return;
    }

    if (!isValidVideoUrl(inputUrl)) {
      toast.error("URL no válida. Soportamos: YouTube, TikTok, Instagram, Facebook, Vimeo");
      return;
    }

    // Check for duplicates
    if (videoList.some(v => v.url === inputUrl.trim())) {
      toast.error("Este video ya fue agregado");
      return;
    }

    const platform = detectPlatform(inputUrl.trim());
    if (!platform) {
      toast.error("No se pudo detectar la plataforma");
      return;
    }

    const newVideo: VideoEntry = {
      url: inputUrl.trim(),
      platform,
    };

    onVideosChange([...videoList, newVideo]);
    setInputUrl("");
    toast.success(`Video de ${getPlatformDisplayName(platform)} agregado`);
  };

  const handleRemoveVideo = (index: number) => {
    const updated = videoList.filter((_, i) => i !== index);
    onVideosChange(updated);
    toast.info("Video eliminado");
  };

  if (isDisabled) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium flex items-center gap-2">
            <Play className="w-5 h-5" />
            Videos
          </h3>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground border-muted-foreground/20">
            No disponible en {tierName}
          </span>
        </div>
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30">
          <Play className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Vincula videos externos desde el plan Plus.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pega enlaces de YouTube, TikTok, Instagram y más. Sin límite de almacenamiento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium flex items-center gap-2">
          <Play className="w-5 h-5" />
          Videos Externos
        </h3>
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
          Plan {tierName} • {videoList.length}/{maxVideos} videos
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Pega enlaces de YouTube, TikTok, Instagram, Facebook o Vimeo. Los videos se muestran desde las plataformas originales.
      </p>

      {/* Video List */}
      {videoList.length > 0 && (
        <div className="space-y-2">
          {videoList.map((video, index) => (
            <div 
              key={video.url}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group"
            >
              <PlatformIcon platform={video.platform} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {getPlatformDisplayName(video.platform)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {video.url}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleRemoveVideo(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Video Input */}
      {canAddMore && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddVideo();
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddVideo}
            disabled={!inputUrl.trim()}
          >
            Agregar
          </Button>
        </div>
      )}

      {/* Limit reached message */}
      {!canAddMore && videoList.length > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Has alcanzado el límite de {maxVideos} {maxVideos === 1 ? "video" : "videos"} de tu plan.
        </p>
      )}
    </div>
  );
}
