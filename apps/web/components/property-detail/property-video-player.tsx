"use client";

import { cn } from "@/lib/utils";
import { Badge, Button } from "@repo/ui";
import { ExternalLink, Play, Share2, Video } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^&?/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

/**
 * Native YouTube embed component
 */
function YouTubeEmbed({ url, title }: { url: string; title?: string }) {
  const videoId = getYouTubeId(url);
  if (!videoId) return <div className="text-white p-4">URL de YouTube inválida</div>;

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
      title={title || "YouTube Video"}
      width="100%"
      height="100%"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="border-0"
    />
  );
}

/**
 * Native Vimeo embed component
 */
function VimeoEmbed({ url, title }: { url: string; title?: string }) {
  const videoId = getVimeoId(url);
  if (!videoId) return <div className="text-white p-4">URL de Vimeo inválida</div>;

  return (
    <iframe
      src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
      title={title || "Vimeo Video"}
      width="100%"
      height="100%"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      className="border-0"
    />
  );
}

// Dynamic imports for social media embeds
const TikTokEmbed = dynamic(
  () => import("react-social-media-embed").then((mod) => mod.TikTokEmbed),
  { ssr: false, loading: () => <VideoLoadingSkeleton /> }
);

const InstagramEmbed = dynamic(
  () => import("react-social-media-embed").then((mod) => mod.InstagramEmbed),
  { ssr: false, loading: () => <VideoLoadingSkeleton /> }
);

/**
 * Loading skeleton for video players
 */
function VideoLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-oslo-gray-950/20 backdrop-blur-md min-h-[300px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-oslo-gray-400 text-sm font-medium">Cargando video...</p>
      </div>
    </div>
  );
}

interface PropertyVideo {
  id: string;
  url: string;
  platform: string;
  title?: string | null;
  order: number;
}

interface PropertyVideoPlayerProps {
  videos: PropertyVideo[];
}

/**
 * Platform configuration with display names and icons
 */
const PLATFORM_CONFIG: Record<string, { name: string; color: string; supportsEmbed: boolean }> = {
  YOUTUBE: { name: "YouTube", color: "bg-red-600", supportsEmbed: true },
  VIMEO: { name: "Vimeo", color: "bg-blue-500", supportsEmbed: true },
  TIKTOK: { name: "TikTok", color: "bg-black", supportsEmbed: true },
  INSTAGRAM: { name: "Instagram", color: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500", supportsEmbed: true },
  FACEBOOK: { name: "Facebook", color: "bg-blue-600", supportsEmbed: false }, // Fallback to external link
};

/**
 * Utility to extract IDs and thumbnails from various platforms
 */
function getVideoMetadata(url: string, platform: string): { id: string; thumbnail: string } {
  let id = "";
  let thumbnail = "";

  if (platform === "YOUTUBE") {
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    id = ytMatch?.[1] ?? "";
    thumbnail = id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : "";
  } else if (platform === "VIMEO") {
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    id = vimeoMatch?.[1] ?? "";
    // Vimeo requires API call for thumbnails - using placeholder
    thumbnail = "";
  } else if (platform === "TIKTOK") {
    // TikTok thumbnails require API - showing icon instead
    thumbnail = "";
  }

  return { id, thumbnail };
}

function getPlatformDisplayName(platform: string): string {
  return PLATFORM_CONFIG[platform]?.name || "Video";
}

/**
 * External link component for platforms without native embed support (Facebook Reels)
 */
/** Default config for unknown platforms */
const DEFAULT_PLATFORM_CONFIG = { name: "Video", color: "bg-oslo-gray-700", supportsEmbed: false };

function ExternalVideoLink({
  url,
  platform,
  title
}: {
  url: string;
  platform: string;
  title?: string | null;
}) {
  const config = PLATFORM_CONFIG[platform] ?? DEFAULT_PLATFORM_CONFIG;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-gradient-to-br from-oslo-gray-900 to-oslo-gray-950 p-8">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* Platform Icon */}
        <div className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl",
          config.color
        )}>
          <Video className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-white">
            {title || `Video de ${config.name}`}
          </h4>
          <p className="text-oslo-gray-400 text-sm">
            Este video está disponible en {config.name}. Haz clic para verlo en la plataforma original.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          asChild
          size="lg"
          className="gap-2 rounded-full px-8"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            Ver en {config.name}
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>

        {/* Security note */}
        <p className="text-oslo-gray-500 text-xs">
          Se abrirá en una nueva pestaña de forma segura
        </p>
      </div>
    </div>
  );
}

/**
 * Renders the appropriate player based on platform
 */
function VideoRenderer({
  video,
  isPlaying: _isPlaying, // Not used for native iframes (autoplay enabled)
}: {
  video: PropertyVideo;
  isPlaying: boolean;
}) {
  const { platform, url } = video;

  // YouTube: Use native iframe embed
  if (platform === "YOUTUBE") {
    return <YouTubeEmbed url={url} title={video.title || undefined} />;
  }

  // Vimeo: Use native iframe embed
  if (platform === "VIMEO") {
    return <VimeoEmbed url={url} title={video.title || undefined} />;
  }

  // TikTok: Use react-social-media-embed
  if (platform === "TIKTOK") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black overflow-auto">
        <TikTokEmbed
          url={url}
          width={325}
        />
      </div>
    );
  }

  // Instagram: Use react-social-media-embed
  if (platform === "INSTAGRAM") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white overflow-auto">
        <InstagramEmbed
          url={url}
          width={328}
        />
      </div>
    );
  }

  // Facebook and others: External link fallback
  return (
    <ExternalVideoLink
      url={url}
      platform={platform}
      title={video.title}
    />
  );
}

export function PropertyVideoPlayer({ videos }: PropertyVideoPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeVideo = useMemo(() => {
    if (!videos || videos.length === 0) return null;
    return videos[activeIndex] || videos[0];
  }, [videos, activeIndex]);

  const { thumbnail } = useMemo(() => {
    if (!activeVideo) return { id: "", thumbnail: "" };
    return getVideoMetadata(activeVideo.url, activeVideo.platform);
  }, [activeVideo]);

  // Check if platform supports native embedding
  const supportsEmbed = useMemo(() => {
    if (!activeVideo) return true;
    return PLATFORM_CONFIG[activeVideo.platform]?.supportsEmbed ?? false;
  }, [activeVideo]);

  if (!videos || videos.length === 0 || !activeVideo) return null;

  const isVertical = activeVideo.platform === "TIKTOK" || activeVideo.platform === "INSTAGRAM";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white dark:bg-oslo-gray-900 rounded-3xl overflow-hidden shadow-2xl shadow-black/5 border border-oslo-gray-100 dark:border-oslo-gray-800"
    >
      {/* Header with Premium Feel */}
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-oslo-gray-100 dark:border-oslo-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
              <Video className="w-4 h-4" />
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-oslo-gray-950 dark:text-white tracking-tight">
              Video Tour
            </h3>
          </div>
          <p className="text-oslo-gray-500 dark:text-oslo-gray-400 text-sm font-medium">
            {videos.length > 1
              ? `Explora la propiedad a través de ${videos.length} perspectivas`
              : "Recorrido virtual detallado de la propiedad"}
          </p>
        </div>

        {videos.length > 1 && (
          <div className="flex items-center bg-oslo-gray-50 dark:bg-oslo-gray-850 p-1 rounded-2xl border border-oslo-gray-100 dark:border-oslo-gray-800 self-start md:self-center overflow-x-auto max-w-full hide-scrollbar">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => {
                  setActiveIndex(index);
                  setIsPlaying(false);
                }}
                className={cn(
                  "relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap",
                  activeIndex === index
                    ? "text-white shadow-lg"
                    : "text-oslo-gray-500 dark:text-oslo-gray-400 hover:text-oslo-gray-950 dark:hover:text-white"
                )}
              >
                {activeIndex === index && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {video.title || `Video ${index + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video Container Area */}
      <div className={cn(
        "relative overflow-hidden bg-black flex items-center justify-center",
        isVertical ? "aspect-[9/16] md:h-[700px]" : "aspect-video"
      )}>
        <AnimatePresence mode="wait">
          {!isPlaying && supportsEmbed ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full z-10 cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              {/* Custom Thumbnail Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={activeVideo.title || "Video Preview"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-oslo-gray-900 flex items-center justify-center">
                  <Video className="w-20 h-20 text-oslo-gray-800" />
                </div>
              )}

              {/* Central Play Button - Premium Style */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative group/play"
                >
                  <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl transition-colors group-hover/play:bg-primary group-hover/play:border-primary">
                    <Play className="w-10 h-10 fill-current ml-1" />
                  </div>
                </motion.div>
              </div>

              {/* Video Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-end justify-between">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-white/10 backdrop-blur-md border-white/20 text-white uppercase tracking-widest text-[10px] px-3 font-bold">
                      {getPlatformDisplayName(activeVideo.platform)}
                    </Badge>
                    <h4 className="text-2xl font-bold text-white leading-tight">
                      {activeVideo.title || "Recorrido Virtual Premium"}
                    </h4>
                  </div>
                  <div className="hidden md:flex gap-3">
                    <Button size="icon" variant="outline" className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10" asChild>
                      <a href={activeVideo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 w-full h-full bg-black z-30"
              style={{ pointerEvents: 'auto' }}
            >
              <VideoRenderer video={activeVideo} isPlaying={isPlaying || !supportsEmbed} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Social Proof */}
      <div className="px-6 py-4 border-t border-oslo-gray-100 dark:border-oslo-gray-800 flex items-center gap-4">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-oslo-gray-900 bg-oslo-gray-200 dark:bg-oslo-gray-700 overflow-hidden">
              <img src={`https://i.pravatar.cc/100?u=VANTagent${i}`} alt="Agent" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <p className="text-xs text-oslo-gray-500 dark:text-oslo-gray-400">
          Visto por <span className="text-oslo-gray-700 dark:text-oslo-gray-200 font-semibold">120+</span> personas esta semana
        </p>
      </div>
    </motion.div>
  );
}
