'use client'

/**
 * Price Histogram Slider (Realtor.com Style)
 *
 * Patrón profesional separado en dos capas:
 * 1. Histograma visual (solo barras, sin interacción)
 * 2. Slider interactivo (en línea separada debajo)
 *
 * Características:
 * - Histograma puro: visualización de distribución de precios
 * - Radix Range Slider: control preciso en línea horizontal clara
 * - Índices de buckets: sincronización perfecta entre visual y control
 * - Sin overlays: claridad visual máxima
 * - Patrón profesional: igual a Realtor.com, Zillow, etc.
 */

import { useCallback, useMemo } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { findBucketIndex, isBucketInRange } from '@/lib/utils/price-helpers'

interface PriceHistogramSliderProps {
  distribution: { bucket: number; count: number }[]
  localMin: number
  localMax: number
  onRangeChange: (min: number, max: number) => void
}

export function PriceHistogramSlider({
  distribution,
  localMin,
  localMax,
  onRangeChange,
}: PriceHistogramSliderProps) {
  // Distribución visible (excluir primer bucket $0 que es outlier)
  const visibleDistribution = distribution!.length > 1 ? distribution!.slice(1) : distribution!

  // Dimensiones del SVG (más compacto, solo visualización)
  const SVG_WIDTH = 300
  const SVG_HEIGHT = 100
  const BAR_HEIGHT = SVG_HEIGHT - 20 // Espacio para margen

  // Altura máxima del histograma basada en distribución visible
  const maxCount = Math.max(...visibleDistribution.map((d) => d.count), 1)

  // Ancho de cada barra basado en distribución visible
  const barWidth = SVG_WIDTH / Math.max(visibleDistribution.length, 1)

  // Calcular índices actuales basados en localMin/localMax
  const minIndex = useMemo(() => {
    return findBucketIndex(localMin, distribution!)
  }, [localMin, distribution])

  const maxIndex = useMemo(() => {
    return findBucketIndex(localMax, distribution!)
  }, [localMax, distribution])

  // Handler para Radix Slider onChange (recibe ÍNDICES, no precios)
  const handleSliderChange = useCallback(
    (indices: number[]) => {
      if (indices.length === 2 && distribution! && distribution!.length > 0) {
        const minIdx = Math.max(0, indices[0]!)
        const maxIdx = Math.min(distribution!.length - 1, indices[1]!)

        // Convertir índices a precios usando buckets
        const newMin = distribution![minIdx]!.bucket
        const newMax = distribution![maxIdx]!.bucket

        // Validar que min <= max
        if (newMin <= newMax) {
          onRangeChange(newMin, newMax)
        }
      }
    },
    [distribution, onRangeChange]
  )

  return (
    <div className="w-full space-y-3">
      {/* 1. HISTOGRAMA VISUAL PURO - Sin interacción */}
      <div className="w-full">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-24 border border-oslo-gray-700 rounded-lg bg-oslo-gray-950/50"
          style={{ userSelect: 'none' }}
        >
          {/* Barras del histograma (sin primer bucket outlier) */}
          {visibleDistribution.map((bucket, index) => {
            const x = index * barWidth
            const height = (bucket.count / maxCount) * BAR_HEIGHT
            const isInRange = isBucketInRange(bucket, localMin, localMax)

            return (
              <g key={`bar-${index}`}>
                {/* Barra */}
                <rect
                  x={x}
                  y={SVG_HEIGHT - height - 10}
                  width={Math.max(barWidth - 0.5, 0)}
                  height={height}
                  fill={isInRange ? '#6366f1' : '#4b5563'}
                  opacity={isInRange ? 1 : 0.3}
                  className="transition-colors duration-150"
                />
              </g>
            )
          })}

          {/* Línea base */}
          <line
            x1={0}
            y1={SVG_HEIGHT - 10}
            x2={SVG_WIDTH}
            y2={SVG_HEIGHT - 10}
            stroke="#4b5563"
            strokeWidth={1}
          />
        </svg>
      </div>

      {/* 2. SLIDER INTERACTIVO SEPARADO - Línea horizontal clara */}
      {distribution! && distribution!.length > 0 && (
        <div className="w-full pt-2 pb-1">
          <Slider.Root
            className="relative flex w-full touch-none select-none items-center"
            value={[minIndex, maxIndex]}
            onValueChange={handleSliderChange}
            min={0}
            max={distribution!.length - 1}
            step={1}
            minStepsBetweenThumbs={0}
          >
            <Slider.Track className="relative h-1 w-full grow rounded-full bg-oslo-gray-700">
              <Slider.Range className="absolute h-full rounded-full bg-indigo-500" />
            </Slider.Track>

            {/* Handle mínimo */}
            <Slider.Thumb
              className="block h-5 w-5 rounded-full border-2 border-oslo-gray-100 bg-white shadow-md transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900"
              aria-label="Min price"
            />

            {/* Handle máximo */}
            <Slider.Thumb
              className="block h-5 w-5 rounded-full border-2 border-oslo-gray-100 bg-white shadow-md transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900"
              aria-label="Max price"
            />
          </Slider.Root>
        </div>
      )}

      {/* Info debajo */}
      <div className="text-xs text-oslo-gray-500 text-center">
        {visibleDistribution && visibleDistribution.length > 0
          ? `${visibleDistribution.length + 1} rangos de precio`
          : 'No hay datos de distribución'}
      </div>
    </div>
  )
}
