'use client'

/**
 * Price Histogram Slider (Interactive SVG)
 *
 * Histograma interactivo con handles arrastrables
 * - Barras del histograma con datos reales de distribución
 * - Dos handles (min/max) arrastrables
 * - Snap automático a buckets
 * - Highlight dinámico de barras en rango
 * - Touch & mouse compatible
 */

import { useRef, useState, useCallback, useEffect } from 'react'
import { priceToX, xToPrice, findNearestBucket, isBucketInRange } from '@/lib/utils/price-helpers'

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
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Estados para drag
  const [draggingHandle, setDraggingHandle] = useState<'min' | 'max' | null>(null)

  // Dimensiones del SVG
  const SVG_WIDTH = 300
  const SVG_HEIGHT = 120
  const BAR_HEIGHT = SVG_HEIGHT - 30 // Espacio para handles

  // Altura máxima del histograma
  const maxCount = Math.max(...distribution.map((d) => d.count), 1)

  // Ancho de cada barra
  const barWidth = SVG_WIDTH / Math.max(distribution.length, 1)

  // Handler para mover handle mínimo
  const handleMinMouseDown = useCallback(
    (e: React.MouseEvent<SVGCircleElement>) => {
      e.preventDefault()
      setDraggingHandle('min')
    },
    []
  )

  // Handler para mover handle máximo
  const handleMaxMouseDown = useCallback(
    (e: React.MouseEvent<SVGCircleElement>) => {
      e.preventDefault()
      setDraggingHandle('max')
    },
    []
  )

  // Handler para mouse move (drag)
  useEffect(() => {
    if (!draggingHandle || !svgRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const svg = svgRef.current
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const x = e.clientX - rect.left

      // Convertir X a precio
      const newPrice = xToPrice(x, SVG_WIDTH, minPrice, maxPrice)

      // Snapear al bucket más cercano
      const snappedPrice = findNearestBucket(newPrice, distribution)

      if (draggingHandle === 'min') {
        // No permitir que min > max
        if (snappedPrice <= localMax) {
          onRangeChange(snappedPrice, localMax)
        }
      } else if (draggingHandle === 'max') {
        // No permitir que max < min
        if (snappedPrice >= localMin) {
          onRangeChange(localMin, snappedPrice)
        }
      }
    }

    const handleMouseUp = () => {
      setDraggingHandle(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingHandle, distribution, localMin, localMax, minPrice, maxPrice, onRangeChange])

  // Touch support
  useEffect(() => {
    if (!draggingHandle || !svgRef.current) return

    const handleTouchMove = (e: TouchEvent) => {
      const svg = svgRef.current
      if (!svg || e.touches.length === 0) return

      const rect = svg.getBoundingClientRect()
      const touch = e.touches[0]
      if (!touch) return
      const x = touch.clientX - rect.left

      const newPrice = xToPrice(x, SVG_WIDTH, minPrice, maxPrice)
      const snappedPrice = findNearestBucket(newPrice, distribution)

      if (draggingHandle === 'min') {
        if (snappedPrice <= localMax) {
          onRangeChange(snappedPrice, localMax)
        }
      } else if (draggingHandle === 'max') {
        if (snappedPrice >= localMin) {
          onRangeChange(localMin, snappedPrice)
        }
      }
    }

    const handleTouchEnd = () => {
      setDraggingHandle(null)
    }

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [draggingHandle, distribution, localMin, localMax, minPrice, maxPrice, onRangeChange])

  // Posiciones X de los handles
  const minX = priceToX(localMin, SVG_WIDTH, minPrice, maxPrice)
  const maxX = priceToX(localMax, SVG_WIDTH, minPrice, maxPrice)

  return (
    <div ref={containerRef} className="w-full space-y-3">
      {/* SVG del Histograma */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full h-24 border border-oslo-gray-800 rounded-lg bg-oslo-gray-950/50"
        style={{ userSelect: 'none' }}
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

        {/* Rango seleccionado (línea gruesa entre handles) */}
        <line
          x1={Math.min(minX, maxX)}
          y1={SVG_HEIGHT - 10}
          x2={Math.max(minX, maxX)}
          y2={SVG_HEIGHT - 10}
          stroke="#6366f1"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Handle mínimo */}
        <circle
          cx={minX}
          cy={SVG_HEIGHT - 10}
          r={8}
          fill="white"
          stroke="#6366f1"
          strokeWidth={2}
          style={{
            cursor: draggingHandle === 'min' ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMinMouseDown}
          onTouchStart={handleMinMouseDown as any}
        />

        {/* Handle máximo */}
        <circle
          cx={maxX}
          cy={SVG_HEIGHT - 10}
          r={8}
          fill="white"
          stroke="#6366f1"
          strokeWidth={2}
          style={{
            cursor: draggingHandle === 'max' ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMaxMouseDown}
          onTouchStart={handleMaxMouseDown as any}
        />

        {/* Labels opcionales (precios en los handles) */}
        {/* Min price label */}
        <text
          x={minX}
          y={SVG_HEIGHT - 15}
          textAnchor="middle"
          fontSize="10"
          fill="#9ca3af"
          pointerEvents="none"
          className="select-none"
        >
          ${Math.round(localMin / 1000)}k
        </text>

        {/* Max price label */}
        <text
          x={maxX}
          y={SVG_HEIGHT - 15}
          textAnchor="middle"
          fontSize="10"
          fill="#9ca3af"
          pointerEvents="none"
          className="select-none"
        >
          ${Math.round(localMax / 1000)}k
        </text>
      </svg>

      {/* Info debajo del histograma */}
      <div className="text-xs text-oslo-gray-500 text-center">
        {distribution.length > 0
          ? `${distribution.length} buckets • Arrastra los círculos para ajustar`
          : 'No hay datos de distribución'}
      </div>
    </div>
  )
}
