"use client";

import { Step1 } from "@/components/dashboard/property-wizard/steps/basic-info";
import { Step3 } from "@/components/dashboard/property-wizard/steps/features";
import { Step4 } from "@/components/dashboard/property-wizard/steps/images";
import { Step2 } from "@/components/dashboard/property-wizard/steps/location";
import { Step5 } from "@/components/dashboard/property-wizard/steps/review";
import { WizardLayout } from "@/components/dashboard/property-wizard/wizard-layout";
import { usePropertyWizardStore } from "@/lib/stores/property-wizard-store";

import { useEffect } from "react";

interface NewPropertyClientProps {
  maxImages: number;
}

export function NewPropertyClient({ maxImages }: NewPropertyClientProps) {
  const { currentStep, setLimits } = usePropertyWizardStore();

  useEffect(() => {
    setLimits({ maxImages });
  }, [maxImages, setLimits]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      default:
        return <Step1 />;
    }
  };

  return (
    <WizardLayout
      title="Nueva Propiedad"
      description="Completa la información para publicar tu propiedad."
      formId="wizard-step-form"
    >
      <div className="mt-4">{renderStep()}</div>
    </WizardLayout>
  );
}
