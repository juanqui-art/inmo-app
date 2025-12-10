"use client";

import { upgradeSubscriptionAction } from "@/app/actions/subscription";
import { PricingCard } from "@/components/pricing/pricing-card";
import { getTierByName } from "@/lib/pricing/tiers";
import { Button } from "@repo/ui";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function UpgradeModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const upgradeParam = searchParams.get("upgrade");
  const [isPending, setIsPending] = useState(false);

  // Si no hay parámetro upgrade, no mostrar nada
  if (!upgradeParam) return null;

  const planName = upgradeParam.toUpperCase();
  const tier = getTierByName(planName as "PLUS" | "AGENT" | "PRO");

  // Si el plan no es válido, no mostrar nada
  if (!tier) return null;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("upgrade");
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleUpgrade = async () => {
    setIsPending(true);
    const formData = new FormData();
    formData.append("plan", planName);

    const result = await upgradeSubscriptionAction(formData);

    if (result?.success) {
      // Recargar para reflejar cambios y cerrar modal
      window.location.href = "/dashboard";
    } else {
      setIsPending(false);
      alert("Error al procesar la suscripción");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-oslo-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Left: Plan Details */}
          <div className="p-8 md:p-12 bg-gray-50 dark:bg-oslo-gray-950 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">Confirma tu plan</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Estás a un paso de potenciar tu negocio inmobiliario con las mejores herramientas del mercado.
            </p>
            
            <div className="scale-90 origin-top-left">
               <PricingCard tier={{...tier, ctaText: "Plan Seleccionado", ctaUrl: "#", highlighted: false}} />
            </div>
          </div>

          {/* Right: Payment Summary (Mock) */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-6">Resumen del pedido</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Plan {tier.displayName}</span>
                <span className="font-semibold">{tier.currency}{tier.price} / mes</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Impuestos</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between py-4 text-lg font-bold">
                <span>Total a pagar hoy</span>
                <span>{tier.currency}{tier.price}</span>
              </div>
            </div>

            {/* Mock Payment Form */}
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Información de tarjeta
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    disabled={isPending}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-8 h-5 bg-gray-200 dark:bg-gray-600 rounded" />
                    <div className="w-8 h-5 bg-gray-200 dark:bg-gray-600 rounded" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    placeholder="MM / AA"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    disabled={isPending}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-8 text-sm text-blue-700 dark:text-blue-300 flex gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                <strong>Modo Simulado:</strong> Puedes usar cualquier dato ficticio. No se realizará ningún cargo real.
              </p>
            </div>

            <Button 
              onClick={handleUpgrade} 
              disabled={isPending}
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
            >
              {isPending ? "Procesando..." : "Confirmar y Suscribirse"}
            </Button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              Al confirmar, aceptas nuestros términos y condiciones. Puedes cancelar en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
