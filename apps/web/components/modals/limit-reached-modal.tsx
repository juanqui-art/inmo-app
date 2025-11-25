"use client";

import { getTierFeatures } from "@/lib/permissions/property-limits";
import type { SubscriptionTier } from "@repo/database";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@repo/ui";
import { Check, Rocket } from "lucide-react";
import Link from "next/link";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "property" | "image" | "featured";
  currentTier: SubscriptionTier;
  limit: number;
}

export function LimitReachedModal({
  isOpen,
  onClose,
  limitType,
  currentTier,
  limit,
}: LimitReachedModalProps) {
  const nextTier = currentTier === "FREE" ? "BASIC" : "PRO";
  const nextTierFeatures = getTierFeatures(nextTier);

  const titles = {
    property: "Límite de propiedades alcanzado",
    image: "Límite de imágenes alcanzado",
    featured: "Límite de destacados alcanzado",
  };

  const descriptions = {
    property: `Has alcanzado el límite de ${limit} propiedades de tu plan ${currentTier}.`,
    image: `Has alcanzado el límite de ${limit} imágenes por propiedad de tu plan ${currentTier}.`,
    featured: `Has alcanzado el límite de ${limit} destacados de tu plan ${currentTier}.`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {titles[limitType]}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {descriptions[limitType]}
            <br />
            Actualiza a <span className="font-bold text-primary">Plan {nextTier}</span> para desbloquear más.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg my-4 space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            Beneficios del Plan {nextTier}
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>
                {nextTierFeatures.propertyLimit} Propiedades publicadas
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>
                {nextTierFeatures.imageLimit} Imágenes por propiedad
              </span>
            </li>
            {nextTierFeatures.hasFeatured && (
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>
                  {nextTierFeatures.hasUnlimitedFeatured
                    ? "Destacados ilimitados"
                    : `${nextTierFeatures.featuredLimit} Propiedades destacadas`}
                </span>
              </li>
            )}
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button asChild className="w-full" size="lg">
            <Link href="/pricing">
              Actualizar Plan
            </Link>
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            No por ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
