"use client";

import { Toaster } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";

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
