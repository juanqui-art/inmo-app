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

import { useState, useCallback, useEffect, useMemo } from 'react'
import { FilterDropdown } from './filter-dropdown'
import { PriceHistogramSlider } from './price-histogram-slider'
import {
  formatPrice,
  formatNumberEcuador,
  formatPriceCompact,
} from '@/lib/utils/price-helpers'

/**
 * PriceInput Component
 * Reusable price input with formatted display and dollar sign
 */
interface PriceInputProps {
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ariaLabel: string
}

function PriceInput({ value, onChange, ariaLabel }: PriceInputProps) {
  return (
    <div className="flex-1 min-w-0 flex items-center rounded-lg bg-oslo-gray-800 border border-oslo-gray-700 focus-within:ring-2 focus-within:ring-oslo-gray-600">
      <span className="px-2 py-2 text-oslo-gray-400 font-medium text-base flex-shrink-0">$</span>
      <input
        type="text"
        value={formatNumberEcuador(value)}
        onChange={onChange}
        className="flex-1 min-w-0 px-0 py-2 pr-2 bg-oslo-gray-800 text-oslo-gray-100 text-base font-medium placeholder-oslo-gray-500 focus:outline-none"
        placeholder="0"
        aria-label={ariaLabel}
      />
    </div>
  )
}

interface PriceFilterDropdownProps {
  minPrice?: number
  maxPrice?: number
  onPriceChange: (minPrice?: number, maxPrice?: number) => void
  dbMinPrice?: number
  dbMaxPrice?: number
  distribution?: { bucket: number; count: number }[]
  onOpenChange?: (open: boolean) => void
}

export function PriceFilterDropdown({
  minPrice,
  maxPrice,
  onPriceChange,
  dbMinPrice,
  dbMaxPrice,
  distribution = [],
  onOpenChange,
}: PriceFilterDropdownProps) {
  // Determinar los límites del rango basado en BD o defaults
  const rangeMinBound = dbMinPrice ?? 0
  const rangeMaxBound = dbMaxPrice ?? 2000000

  // ✅ ESTADO DEL DROPDOWN
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  // ✅ ESTADO LOCAL (no sincronizado con URL hasta "Done")
  const [localMin, setLocalMin] = useState<number>(minPrice ?? rangeMinBound)
  const [localMax, setLocalMax] = useState<number>(maxPrice ?? rangeMaxBound)

  // ✅ Detectar si hay filtro activo (para mostrar X en el botón)
  const isFilterActive = useMemo(
    () =>
      (minPrice !== undefined && minPrice > rangeMinBound) ||
      (maxPrice !== undefined && maxPrice < rangeMaxBound),
    [minPrice, maxPrice, rangeMinBound, rangeMaxBound]
  )

  // ✅ Handler para limpiar el filtro completamente
  const handleClear = useCallback(() => {
    onPriceChange(undefined, undefined)
    setIsDropdownOpen(false)
  }, [onPriceChange])

  // Sincronizar estado local cuando props cambian (ej: opening dropdown)
  useEffect(() => {
    setLocalMin(minPrice ?? rangeMinBound)
    setLocalMax(maxPrice ?? rangeMaxBound)
  }, [minPrice, maxPrice, rangeMinBound, rangeMaxBound])


  // Display value para el botón del dropdown con formato compacto (K, M)
  // Lógica: mostrar solo el valor que cambió, o rango si ambos cambiaron
  const displayValue = useMemo(() => {
    const hasMin = minPrice !== undefined && minPrice > rangeMinBound
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
  }, [minPrice, maxPrice, rangeMinBound, rangeMaxBound])

  // Handler para cambios en el histograma slider
  const handleHistogramChange = useCallback((newMin: number, newMax: number) => {
    setLocalMin(newMin)
    setLocalMax(newMax)
  }, [])

  // Handler para cambios en input mínimo
  const handleInputMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '')
      if (value === '') {
        setLocalMin(rangeMinBound)
      } else {
        const numValue = Number(value)
        if (numValue <= localMax) {
          setLocalMin(numValue)
        }
      }
    },
    [localMax, rangeMinBound]
  )

  // Handler para cambios en input máximo
  const handleInputMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '')
      if (value === '') {
        setLocalMax(rangeMaxBound)
      } else {
        const numValue = Number(value)
        if (numValue >= localMin) {
          setLocalMax(numValue)
        }
      }
    },
    [localMin, rangeMaxBound]
  )

  // ✅ ÚNICO punto donde se actualiza URL (Realtor.com pattern)
  const handleDone = useCallback(() => {
    // Solo enviar valores si son diferentes de los bounds
    const finalMin = localMin > rangeMinBound ? localMin : undefined
    const finalMax = localMax < rangeMaxBound ? localMax : undefined

    onPriceChange(finalMin, finalMax)
    setIsDropdownOpen(false) // Cerrar dropdown
  }, [localMin, localMax, rangeMinBound, rangeMaxBound, onPriceChange])

  // Handler para resetear al cerrar sin "Done"
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsDropdownOpen(open)
      if (!open) {
        // Reset a valores de URL al cerrar
        setLocalMin(minPrice ?? rangeMinBound)
        setLocalMax(maxPrice ?? rangeMaxBound)
      }
      onOpenChange?.(open)
    },
    [minPrice, maxPrice, rangeMinBound, rangeMaxBound, onOpenChange]
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
      <div className="w-80 m-0 p-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-3 ">
          <h3 className="text-lg font-bold text-oslo-gray-100">Precio</h3>
        </div>

        {/* Histograma Interactivo */}
        <div className="px-3">
          <PriceHistogramSlider
            distribution={distribution}
            localMin={localMin}
            localMax={localMax}
            onRangeChange={handleHistogramChange}
          />
        </div>

        {/* Inputs Numéricos con Formato de Moneda */}
        <div className="flex items-center gap-2 min-w-0 px-4">
          <PriceInput value={localMin} onChange={handleInputMinChange} ariaLabel="Precio mínimo" />
          <span className="text-oslo-gray-400 flex-shrink-0">-</span>
          <PriceInput value={localMax} onChange={handleInputMaxChange} ariaLabel="Precio máximo" />
        </div>


        {/* Botón "Listo" */}
        <div className="px-4">
          <button
            onClick={handleDone}
            className="w-full px-4 py-2 rounded-lg bg-oslo-gray-700 text-oslo-gray-100 font-medium text-base hover:bg-oslo-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-oslo-gray-600"
          >
            Listo
          </button>
        </div>

        {/* Info text */}
        <div className="text-xs text-oslo-gray-500 text-center px-4 pb-4">
          {localMin > rangeMinBound || localMax < rangeMaxBound
            ? `${formatPrice(localMin)} - ${formatPrice(localMax)}`
            : 'Cualquier precio'}
        </div>
      </div>
    </FilterDropdown>
  )
}
