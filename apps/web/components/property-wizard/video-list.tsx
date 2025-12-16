"use client";

import { Badge, Button } from "@repo/ui";
import { GripVertical, Trash2, Video } from "lucide-react";
import { VideoData } from "./video-url-input";

interface VideoListProps {
  videos: VideoData[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function VideoList({ videos, onRemove, disabled = false }: VideoListProps) {
  if (videos.length === 0) return null;

  return (
    <div className="space-y-3 mt-4">
      <h4 className="text-sm font-medium text-muted-foreground">Videos Agregados ({videos.length})</h4>
      <div className="space-y-2">
        {videos.map((video, index) => (
          <div
            key={`${video.url}-${index}`}
            className="flex items-center gap-3 p-3 bg-muted/40 border rounded-lg group"
          >
            <div className="cursor-move text-muted-foreground/50 hover:text-foreground">
              <GripVertical className="w-4 h-4" />
            </div>
            
            <div className="w-10 h-10 rounded bg-background border flex items-center justify-center flex-shrink-0">
               <Video className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{video.title || video.url}</p>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase">
                  {video.platform}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate opacity-70">
                {video.url}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
              disabled={disabled}
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Eliminar video</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
