'use client'

/**
 * Price Filter Dropdown (Realtor.com Style - v2)
 *
 * Improved price range selector with:
 * - Interactive histogram slider (SVG custom)
 * - Local state (no URL sync until "Done")
 * - Explicit confirmation pattern
 * - Snap to buckets (discrete, round values)
 * - Real-time property counter
 * - Realtor.com inspired design
 *
 * STATE PATTERN:
 * - localMin/localMax: Internal state (interactive, ephemeral)
 * - minPrice/maxPrice (props): External state from URL (persistent)
 * - Sync happens ONLY when user clicks "Done"
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react' // Add useRef
import { FilterDropdown } from './filter-dropdown'
import { PriceHistogramSlider } from './price-histogram-slider'
import {
  formatPrice,
  formatPriceCompact,
} from '@/lib/utils/price-helpers'
import { useMapStore } from '@/stores/map-store';


// Simple SVG Spinner component
function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}


interface PriceFilterDropdownProps {
  minPrice?: number
  maxPrice?: number
  onPriceChange: (minPrice?: number, maxPrice?: number) => void
  onOpenChange?: (open: boolean) => void
}

export function PriceFilterDropdown({
  minPrice,
  maxPrice,
  onPriceChange,
  onOpenChange,
}: PriceFilterDropdownProps) {
  // Obtener datos del store de Zustand de forma granular
  const priceDistribution = useMapStore((state) => state.priceDistribution);
  const priceRangeMax = useMapStore((state) => state.priceRangeMax);
  const isLoading = useMapStore((state) => state.isLoading);
  const setIsLoading = useMapStore((state) => state.setIsLoading);

  // Determinar los límites del rango basado en BD o defaults (ahora del store)
  // ✅ UI minimum is ALWAYS 0 (separated from database minimum)
  const rangeMaxBound = priceRangeMax ?? 2000000

  // ✅ ESTADO DEL DROPDOWN
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  // ✅ ESTADO LOCAL (no sincronizado con URL hasta "Done")
  const [localMin, setLocalMin] = useState<number>(minPrice ?? 0)
  const [localMax, setLocalMax] = useState<number>(maxPrice ?? rangeMaxBound)

  // Ref to track previous loading state
  const wasLoadingRef = useRef(false);

  // ✅ Detectar si hay filtro activo (para mostrar X en el botón)
  const isFilterActive = useMemo(
    () =>
      (minPrice !== undefined && minPrice > 0) ||
      (maxPrice !== undefined && maxPrice < rangeMaxBound),
    [minPrice, maxPrice, rangeMaxBound]
  )

  // ✅ Handler para limpiar el filtro completamente
  const handleClear = useCallback(() => {
    onPriceChange(undefined, undefined)
    setIsDropdownOpen(false)
  }, [onPriceChange])

  // Sincronizar estado local cuando props cambian (ej: opening dropdown)
  useEffect(() => {
    setLocalMin(minPrice ?? 0)
    setLocalMax(maxPrice ?? rangeMaxBound)
  }, [minPrice, maxPrice, rangeMaxBound])

  // Effect to close dropdown when loading is finished
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      setIsDropdownOpen(false);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);


  // Display value para el botón del dropdown con formato compacto (K, M)
  // Lógica: mostrar solo el valor que cambió, o rango si ambos cambiaron
  const displayValue = useMemo(() => {
    const hasMin = minPrice !== undefined && minPrice > 0
    const hasMax = maxPrice !== undefined && maxPrice < rangeMaxBound

    if (hasMin && hasMax) {
      // Ambos valores cambiaron: mostrar rango
      return `$${formatPriceCompact(minPrice)} - $${formatPriceCompact(maxPrice)}`
    } else if (hasMin) {
      // Solo mínimo cambió
      return `MIN $${formatPriceCompact(minPrice)}`
    } else if (hasMax) {
      // Solo máximo cambió
      return `MAX $${formatPriceCompact(maxPrice)}`
    } else {
      // Sin cambios
      return 'Precio'
    }
  }, [minPrice, maxPrice, rangeMaxBound])

  // Handler para cambios en el histograma slider
  const handleHistogramChange = useCallback((newMin: number, newMax: number) => {
    setLocalMin(newMin)
    setLocalMax(newMax)
  }, [])


  // ✅ ÚNICO punto donde se actualiza URL (Realtor.com pattern)
  const handleDone = useCallback(() => {
    setIsLoading(true); // Start loading

    // Solo enviar valores si son diferentes de los bounds
    const finalMin = localMin > 0 ? localMin : undefined
    const finalMax = localMax < rangeMaxBound ? localMax : undefined

    onPriceChange(finalMin, finalMax)
    // NO cerramos el dropdown aquí
  }, [localMin, localMax, rangeMaxBound, onPriceChange, setIsLoading])

  // Handler para resetear al cerrar sin "Done"
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (isLoading) return; // Prevent closing while loading
      setIsDropdownOpen(open)
      if (!open) {
        // Reset a valores de URL al cerrar
        setLocalMin(minPrice ?? 0)
        setLocalMax(maxPrice ?? rangeMaxBound)
      }
      onOpenChange?.(open)
    },
    [minPrice, maxPrice, rangeMaxBound, onOpenChange, isLoading]
  )

  return (
    <FilterDropdown
      label="Precio"
      value={displayValue}
      onOpenChange={handleOpenChange}
      isOpen={isDropdownOpen}
      isActive={isFilterActive}
      onClear={handleClear}
    >
      <div className="w-80 m-0 p-0 space-y-3 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-oslo-gray-900/70 flex items-center justify-center z-10 rounded-lg">
            <Spinner />
          </div>
        )}

        {/* Header con rango actual */}
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-oslo-gray-100">Precio</h3>
            <div className="text-right">
              <p className="text-xs text-oslo-gray-400">Rango</p>
              <p className="text-sm font-semibold text-indigo-400">
                {formatPrice(localMin)} - {formatPrice(localMax)}
              </p>
            </div>
          </div>
        </div>

        {/* Histograma Interactivo */}
        <div className="px-3">
          <PriceHistogramSlider
            distribution={priceDistribution}
            localMin={localMin}
            localMax={localMax}
            onRangeChange={handleHistogramChange}
          />
        </div>

        {/* Botón "Listo" */}
        <div className="px-4">
          <button
            type="button"
            onClick={handleDone}
            disabled={isLoading} // Disable button while loading
            className="w-full px-4 py-2 rounded-lg bg-oslo-gray-700 text-oslo-gray-100 font-medium text-base hover:bg-oslo-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-oslo-gray-600 disabled:bg-oslo-gray-800 disabled:cursor-not-allowed"
          >
            Listo
          </button>
        </div>

        {/* ✅ ESTADO DEL FILTRO - Indicador */}
        {(localMin > 0 || localMax < rangeMaxBound) && (
          <div className="px-4 flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-oslo-gray-400">Filtro activo</span>
          </div>
        )}
      </div>
    </FilterDropdown>
  )
}
