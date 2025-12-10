import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PropertyFormData = {
  // Step 1: Basic Info
  title: string;
  description: string;
  price: number;
  transactionType: "SALE" | "RENT";
  category: string;
  
  // Step 2: Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;

  // Step 3: Features
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];

  // Step 4: Images
  images: File[]; // Note: Files cannot be persisted easily, handled separately or just in memory
  imageUrls: string[]; // Public URLs of uploaded images (persisted)
};

interface WizardState {
  currentStep: number;
  totalSteps: number;
  formData: PropertyFormData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<PropertyFormData>) => void;
  resetWizard: () => void;
  limits: {
    maxImages: number;
  };
  setLimits: (limits: { maxImages: number }) => void;
}

const initialFormData: PropertyFormData = {
  title: "",
  description: "",
  price: 0,
  transactionType: "SALE",
  category: "HOUSE",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  latitude: null,
  longitude: null,
  bedrooms: 0,
  bathrooms: 0,
  area: 0,
  amenities: [],
  images: [],
  imageUrls: [],
};

export const usePropertyWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      totalSteps: 5,
      formData: initialFormData,
      limits: {
        maxImages: 5, // Default safe limit
      },
      setLimits: (limits) => set((state) => ({ limits: { ...state.limits, ...limits } })),
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, state.totalSteps) 
      })),
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 1) 
      })),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetWizard: () =>
        set({
          currentStep: 1,
          formData: initialFormData,
          limits: { maxImages: 5 },
        }),
    }),
    {
      name: "property-wizard-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: {
            ...state.formData,
            images: [] // Don't persist File objects
        },
        limits: state.limits, // Persist limits so they survive reload if not re-initialized immediately
      }),
    }
  )
);
