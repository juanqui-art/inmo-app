'use client'

/**
 * Price Histogram Slider (Interactive SVG + Radix Range)
 *
 * Histograma interactivo con Radix Range Slider superpuesto
 * - Barras del histograma con datos reales de distribución
 * - Radix Range Slider para handles precisos y robustos
 * - Snap automático a buckets
 * - Highlight dinámico de barras en rango
 * - Touch & mouse compatible (mejor UX con Radix)
 */

import { useCallback } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { findNearestBucket, isBucketInRange } from '@/lib/utils/price-helpers'

interface PriceHistogramSliderProps {
  distribution: { bucket: number; count: number }[]
  minPrice: number
  maxPrice: number
  localMin: number
  localMax: number
  onRangeChange: (min: number, max: number) => void
}

export function PriceHistogramSlider({
  distribution,
  minPrice,
  maxPrice,
  localMin,
  localMax,
  onRangeChange,
}: PriceHistogramSliderProps) {
  // Dimensiones del SVG
  const SVG_WIDTH = 300
  const SVG_HEIGHT = 120
  const BAR_HEIGHT = SVG_HEIGHT - 30 // Espacio para handles

  // Altura máxima del histograma
  const maxCount = Math.max(...distribution.map((d) => d.count), 1)

  // Ancho de cada barra
  const barWidth = SVG_WIDTH / Math.max(distribution.length, 1)

  // Handler para Radix Slider onChange
  const handleSliderChange = useCallback(
    (values: number[]) => {
      if (values.length === 2 && distribution!.length > 0) {
        // Snapear al bucket más cercano
        const min = values[0]!
        const max = values[1]!
        const snappedMin = findNearestBucket(min, distribution!)
        const snappedMax = findNearestBucket(max, distribution!)
        onRangeChange(snappedMin, snappedMax)
      }
    },
    [distribution, onRangeChange]
  )

  return (
    <div className="w-full space-y-3">
      {/* Contenedor con SVG e slider superpuesto */}
      <div className="relative w-full">
        {/* SVG del Histograma */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-24 border border-oslo-gray-800 rounded-lg bg-oslo-gray-950/50"
          style={{ userSelect: 'none' }}
          pointerEvents="none"
        >
          {/* Barras del histograma */}
          {distribution.map((bucket, index) => {
            const x = index * barWidth
            const height = (bucket.count / maxCount) * BAR_HEIGHT
            const isInRange = isBucketInRange(bucket, localMin, localMax)

            return (
              <g key={`bar-${index}`}>
                {/* Barra */}
                <rect
                  x={x}
                  y={SVG_HEIGHT - height - 10}
                  width={Math.max(barWidth - 1, 0)}
                  height={height}
                  fill={isInRange ? '#6366f1' : '#4b5563'}
                  opacity={isInRange ? 1 : 0.3}
                  className="transition-opacity"
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
            strokeWidth={2}
          />
        </svg>

        {/* Radix Range Slider superpuesto */}
        <div className="absolute inset-0 flex items-center px-0">
          <Slider.Root
            className="relative flex w-full touch-none select-none items-center"
            value={[localMin, localMax]}
            onValueChange={handleSliderChange}
            min={minPrice}
            max={maxPrice}
            step={1}
            minStepsBetweenThumbs={1}
          >
            <Slider.Track className="relative h-2 w-full grow rounded-full bg-transparent">
              <Slider.Range className="absolute h-full rounded-full bg-transparent" />
            </Slider.Track>

            {/* Handle mínimo */}
            <Slider.Thumb
              className="block h-5 w-5 rounded-full border-2 border-oslo-gray-100 bg-white shadow-lg transition-colors hover:border-oslo-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900"
              aria-label="Min price"
            />

            {/* Handle máximo */}
            <Slider.Thumb
              className="block h-5 w-5 rounded-full border-2 border-oslo-gray-100 bg-white shadow-lg transition-colors hover:border-oslo-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900"
              aria-label="Max price"
            />
          </Slider.Root>
        </div>
      </div>

      {/* Info debajo del histograma */}
      <div className="text-xs text-oslo-gray-500 text-center">
        {distribution.length > 0
          ? `${distribution.length} buckets • Usa el slider para ajustar`
          : 'No hay datos de distribución'}
      </div>
    </div>
  )
}
