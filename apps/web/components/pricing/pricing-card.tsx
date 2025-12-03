/**
 * PRICING CARD Component
 *
 * Componente reutilizable para mostrar planes de suscripción
 *
 * USO:
 * - /vender page (sección de pricing)
 * - /pricing page (página dedicada)
 * - Dashboard (upgrade modals)
 */

import { CheckCircle } from "lucide-react";
import Link from "next/link";

export interface PricingTier {
  name: string;
  displayName: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  ctaUrl: string;
}

interface PricingCardProps {
  tier: PricingTier;
  compact?: boolean; // Versión compacta para /vender
}

export function PricingCard({ tier, compact = false }: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
        tier.highlighted
          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xl scale-105"
          : "border-oslo-gray-200 dark:border-oslo-gray-800 bg-white dark:bg-oslo-gray-950 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Badge "Popular" */}
      {tier.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg">
          Más Popular
        </div>
      )}

      {/* Nombre del plan */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-oslo-gray-900 dark:text-oslo-gray-50">
          {tier.displayName}
        </h3>
        {!compact && (
          <p className="mt-2 text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
            {tier.description}
          </p>
        )}
      </div>

      {/* Precio */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
            {tier.currency}
          </span>
          <span className="text-5xl font-extrabold text-oslo-gray-900 dark:text-oslo-gray-50">
            {tier.price}
          </span>
        </div>
        <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 mt-1">
          {tier.period}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-grow">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle
              className={`w-5 h-5 flex-shrink-0 ${
                tier.highlighted
                  ? "text-indigo-600"
                  : "text-green-500"
              }`}
            />
            <span className="text-sm text-oslo-gray-700 dark:text-oslo-gray-300">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href={tier.ctaUrl}
        className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all ${
          tier.highlighted
            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:scale-105"
            : "bg-oslo-gray-100 dark:bg-oslo-gray-800 text-oslo-gray-900 dark:text-oslo-gray-50 hover:bg-oslo-gray-200 dark:hover:bg-oslo-gray-700"
        }`}
      >
        {tier.ctaText}
      </Link>
    </div>
  );
}
