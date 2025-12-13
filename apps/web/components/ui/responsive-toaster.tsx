"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Toaster } from "sonner";

export function ResponsiveToaster() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Toaster
      position={isDesktop ? "bottom-right" : "top-center"}
      richColors
      expand={false}
      duration={4000}
      closeButton
    />
  );
}
