"use client";

import { Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamic import - react-player works at runtime, types just need to be ignored
// This is a common pattern for libraries that don't have perfect Next.js dynamic typing
const ReactPlayer = dynamic(() => import("react-player"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-oslo-gray-900">
      <Play className="w-12 h-12 text-oslo-gray-400 animate-pulse" />
    </div>
  ),
});

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

export function PropertyVideoPlayer({ videos }: PropertyVideoPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!videos || videos.length === 0) return null;

  const activeVideo = videos[activeIndex];
  if (!activeVideo) return null;

  // Type assertion for ReactPlayer props - known runtime compatibility
  const playerProps = {
    url: activeVideo.url,
    width: "100%",
    height: "100%",
    controls: true,
    light: true,
    playing: false,
  };

  return (
    <div 
      className="bg-white dark:bg-oslo-gray-900 rounded-2xl overflow-hidden shadow-sm border border-oslo-gray-100 dark:border-oslo-gray-800"
    >
      <div className="p-6 border-b border-oslo-gray-100 dark:border-oslo-gray-800">
        <h3 className="text-xl font-semibold text-oslo-gray-950 dark:text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          Video Tour
        </h3>
        {videos.length > 1 && (
          <p className="text-sm text-oslo-gray-500 dark:text-oslo-gray-400 mt-1">
            {videos.length} videos disponibles
          </p>
        )}
      </div>

      {/* Video Tabs (if multiple videos) */}
      {videos.length > 1 && (
        <div className="flex gap-2 p-4 border-b border-oslo-gray-100 dark:border-oslo-gray-800 overflow-x-auto">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setActiveIndex(index)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeIndex === index 
                  ? "bg-primary text-white" 
                  : "bg-oslo-gray-100 dark:bg-oslo-gray-800 text-oslo-gray-600 dark:text-oslo-gray-300 hover:bg-oslo-gray-200 dark:hover:bg-oslo-gray-700"}
              `}
            >
              {video.title || getPlatformDisplayName(video.platform)}
            </button>
          ))}
        </div>
      )}

      {/* Video Player */}
      <div className="aspect-video bg-black">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ReactPlayer {...(playerProps as any)} />
      </div>

      {/* Video Source Badge */}
      <div className="p-4 bg-oslo-gray-50 dark:bg-oslo-gray-850">
        <span className="inline-flex items-center gap-1.5 text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
          <Play className="w-4 h-4" />
          {activeVideo.title || `Video de ${getPlatformDisplayName(activeVideo.platform)}`}
        </span>
      </div>
    </div>
  );
}
