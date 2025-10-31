'use client'

/**
 * Price Histogram Slider (Interactive SVG + Radix Range)
 *
 * Histograma interactivo con Radix Range Slider superpuesto
 * - Barras del histograma con datos reales de distribución
 * - Radix Range Slider usar ÍNDICES de buckets para sincronización perfecta
 * - Handles alineados 1:1 con barras del histograma
 * - Snap automático a buckets (step=1 en índices)
 * - Highlight dinámico de barras en rango
 * - Touch & mouse compatible (mejor UX con Radix)
 */

import { useCallback, useMemo } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { findBucketIndex, isBucketInRange } from '@/lib/utils/price-helpers'

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
  localMin,
  localMax,
  onRangeChange,
}: PriceHistogramSliderProps) {
  // Dimensiones del SVG
  const SVG_WIDTH = 300
  const SVG_HEIGHT = 160
  const BAR_HEIGHT = SVG_HEIGHT - 25 // Espacio para handles + margen inferior

  // Altura máxima del histograma (excluir primer bucket si es outlier)
  // Esto permite que el resto de barras tengan mejor visibilidad
  const maxCount = Math.max(
    ...(distribution!.length > 1
      ? distribution!.slice(1).map((d) => d.count)
      : distribution!.map((d) => d.count)),
    1
  )

  // Ancho de cada barra
  const barWidth = SVG_WIDTH / Math.max(distribution.length, 1)

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
      {/* Contenedor con SVG e slider superpuesto */}
      <div className="relative w-full">
        {/* SVG del Histograma */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-40 border border-oslo-gray-800 rounded-lg bg-oslo-gray-950/50"
          style={{ userSelect: 'none' }}
          pointerEvents="none"
        >
          {/* Barras del histograma */}
          {distribution!.map((bucket, index) => {
            const x = index * barWidth
            const height = (bucket.count / maxCount) * BAR_HEIGHT
            const isInRange = isBucketInRange(bucket, localMin, localMax)

            return (
              <g key={`bar-${index}`}>
                {/* Barra */}
                <rect
                  x={x}
                  y={SVG_HEIGHT - height - 15}
                  width={Math.max(barWidth - 0.5, 0)}
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
            y1={SVG_HEIGHT - 15}
            x2={SVG_WIDTH}
            y2={SVG_HEIGHT - 15}
            stroke="#4b5563"
            strokeWidth={2}
          />
        </svg>

        {/* Radix Range Slider superpuesto */}
        {distribution! && distribution!.length > 0 && (
          <div className="absolute inset-0 flex items-center px-0">
            <Slider.Root
              className="relative flex w-full touch-none select-none items-center"
              value={[minIndex, maxIndex]}
              onValueChange={handleSliderChange}
              min={0}
              max={distribution!.length - 1}
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
        )}
      </div>

      {/* Info debajo del histograma */}
      <div className="text-xs text-oslo-gray-500 text-center">
        {distribution! && distribution!.length > 0
          ? `${distribution!.length} buckets • Usa el slider para ajustar`
          : 'No hay datos de distribución'}
      </div>
    </div>
  )
}
