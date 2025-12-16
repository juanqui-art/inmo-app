"use client";

import { Button, Input, Label } from "@repo/ui";
import { Loader2, Plus, Video } from "lucide-react";
import { useState } from "react";
import ReactPlayer from "react-player";
import { toast } from "sonner";

export interface VideoData {
  url: string;
  platform: string;
  title?: string;
}

interface VideoUrlInputProps {
  onAdd: (video: VideoData) => void;
  disabled?: boolean;
}

export function VideoUrlInput({ onAdd, disabled = false }: VideoUrlInputProps) {
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleAdd = () => {
    if (!url) return;

    const canPlay = ReactPlayer.canPlay ? ReactPlayer.canPlay(url) : true; // Fallback to true if undefined (runtime check)
    if (!canPlay) {
      toast.error("URL de video no soportada", {
        description: "Por favor ingresa una URL válida de YouTube, Vimeo, TikTok, Facebook, etc."
      });
      return;
    }

    setIsChecking(true);

    // Simple platform detection based on URL
    let platform = "OTHER";
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes("youtube") || lowerUrl.includes("youtu.be")) platform = "YOUTUBE";
    else if (lowerUrl.includes("tiktok")) platform = "TIKTOK";
    else if (lowerUrl.includes("facebook") || lowerUrl.includes("fb.watch")) platform = "FACEBOOK";
    else if (lowerUrl.includes("instagram")) platform = "INSTAGRAM";
    else if (lowerUrl.includes("vimeo")) platform = "VIMEO";

    // Simulate a brief check or metadata fetch if we had a backend service
    // For now, we trust the URL is playable since ReactPlayer.canPlay passed
    setTimeout(() => {
      onAdd({
        url,
        platform,
      });
      setUrl("");
      setIsChecking(false);
      toast.success("Video agregado correctamente");
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="video-url">Agregar Video</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="video-url"
            placeholder="Pega la URL del video (YouTube, TikTok, Instagram...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isChecking}
            className="pl-9"
          />
          <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button 
          type="button" 
          onClick={handleAdd} 
          disabled={!url || disabled || isChecking}
        >
          {isChecking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Soportamos YouTube, Vimeo, Facebook, TikTok, Instagram y más.
      </p>
    </div>
  );
}
