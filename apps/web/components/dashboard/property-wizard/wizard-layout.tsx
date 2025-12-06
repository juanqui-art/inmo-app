"use client";

import { usePropertyWizardStore } from "@/lib/stores/property-wizard-store";
import { Button, Card } from "@repo/ui";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "./step-indicator";

interface WizardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  formId?: string;
  isSubmitting?: boolean;
}

export function WizardLayout({ children, title, description, formId, isSubmitting }: WizardLayoutProps) {
  const { currentStep, totalSteps, setStep } = usePropertyWizardStore();
  const router = useRouter();

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Steps */}
      <StepIndicator />

      {/* Content Card */}
      <Card className="p-6 min-h-[400px] backdrop-blur-sm bg-background/60 border-muted/40 shadow-xl">
        {children}
      </Card>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2"
          type="button"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 1 ? "Cancelar" : "Atrás"}
        </Button>

        <div className="flex gap-2">
            {/* Save Draft Button (Optional) */}
            <Button variant="ghost" className="gap-2 text-muted-foreground" type="button">
                <Save className="w-4 h-4" />
                Guardar Borrador
            </Button>

            <Button
            type={formId ? "submit" : "button"}
            form={formId}
            className="gap-2"
            disabled={isSubmitting}
            >
            {currentStep === totalSteps ? "Publicar" : "Siguiente"}
            <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}
