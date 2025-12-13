"use client";

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
      className={`group relative flex flex-col p-8 rounded-2xl border transition-all duration-500 ${
        tier.highlighted
          ? "border-indigo-500/30 dark:border-indigo-400/30 bg-gradient-to-br from-oslo-gray-50 to-indigo-50/30 dark:from-oslo-gray-800 dark:to-oslo-gray-900 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-400/20 scale-105 hover:scale-[1.07] hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/30"
          : "border-oslo-gray-200/50 dark:border-oslo-gray-700/50 bg-white/80 dark:bg-oslo-gray-900/80 backdrop-blur-sm shadow-lg hover:border-oslo-gray-300 dark:hover:border-oslo-gray-600 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
      }`}
    >
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/3 to-purple-500/3 dark:from-indigo-400/5 dark:to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Badge "Popular" */}
      {tier.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 text-white text-xs font-bold rounded-full shadow-lg uppercase tracking-wider">
          ⭐ Más Popular
        </div>
      )}

      {/* Nombre del plan */}
      <div className="text-center mb-6 relative z-10">
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
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-sm font-semibold text-oslo-gray-600 dark:text-oslo-gray-400">
            {tier.currency}
          </span>
          <span className={`text-6xl font-extrabold ${
            tier.highlighted
              ? "bg-gradient-to-br from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
              : "text-oslo-gray-900 dark:text-oslo-gray-50"
          }`}>
            {tier.price}
          </span>
        </div>
        <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 mt-1 font-medium">
          {tier.period}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-oslo-gray-200 dark:via-oslo-gray-700 to-transparent mb-6" />

      {/* Features */}
      <ul className="space-y-3.5 mb-8 flex-grow relative z-10">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 group/item">
            <CheckCircle
              className={`w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110 ${
                tier.highlighted
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            />
            <span className="text-sm text-oslo-gray-700 dark:text-oslo-gray-300 leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href={tier.ctaUrl}
        prefetch={true}
        className={`relative block w-full text-center px-6 py-3.5 rounded-xl font-bold transition-all duration-300 overflow-hidden z-10 ${
          tier.highlighted
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 dark:hover:shadow-indigo-400/30"
            : "bg-oslo-gray-900 dark:bg-oslo-gray-100 text-white dark:text-oslo-gray-900 hover:bg-oslo-gray-800 dark:hover:bg-oslo-gray-200 shadow-md hover:shadow-lg"
        }`}
      >
        <span className="relative z-10">{tier.ctaText}</span>
        {tier.highlighted && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </Link>
    </div>
  );
}
