"use client";

import { generatePropertyDescription } from "@/app/actions/ai-description";
import { usePropertyWizardStore } from "@/lib/stores/property-wizard-store";
import { Button } from "@repo/ui";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AIDescriptionButtonProps {
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
  canUse: boolean;
}

export function AIDescriptionButton({
  onDescriptionGenerated,
  disabled = false,
  canUse,
}: AIDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { formData } = usePropertyWizardStore();

  const handleGenerate = async () => {
    if (!canUse) {
      toast.error("Las descripciones con IA están disponibles desde el plan Agente");
      return;
    }

    setIsGenerating(true);
    toast.loading("Generando descripción...", { id: "ai-description" });

    try {
      const result = await generatePropertyDescription({
        title: formData.title,
        transactionType: formData.transactionType,
        category: formData.category,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        address: formData.address,
        city: formData.city,
        amenities: formData.amenities,
        price: formData.price,
      });

      if (result.success && result.description) {
        onDescriptionGenerated(result.description);
        toast.success("¡Descripción generada!", { id: "ai-description" });
      } else {
        toast.error(result.error || "No se pudo generar la descripción", { 
          id: "ai-description" 
        });
      }
    } catch (error) {
      toast.error("Error al generar descripción", { id: "ai-description" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!canUse) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className="gap-2 opacity-60"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">IA</span>
        <span className="text-xs text-muted-foreground">(Plan Agente+)</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className="gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30 hover:border-violet-500/50 hover:from-violet-500/20 hover:to-purple-500/20 text-violet-700 dark:text-violet-300"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Generando...</span>
        </>
      ) : (
        <>
          <Wand2 className="w-4 h-4" />
          <span className="hidden sm:inline">Generar con IA</span>
          <Sparkles className="w-3 h-3" />
        </>
      )}
    </Button>
  );
}
