"use client";

/**
 * Price Range Slider
 *
 * Interactive range slider using Radix UI
 * - Two handles (min/max)
 * - Visual track showing selected range
 * - Real-time value sync
 * - Dark mode styled
 */

import * as Slider from "@radix-ui/react-slider";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onValueChange: (values: [number, number]) => void;
}

export function PriceRangeSlider({
  min,
  max,
  step = 10000,
  minValue,
  maxValue,
  onValueChange,
}: PriceRangeSliderProps) {
  return (
    <div className="">
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5 bg"
        value={[minValue, maxValue]}
        onValueChange={(values) => {
          if (
            values.length === 2 &&
            typeof values[0] === "number" &&
            typeof values[1] === "number"
          ) {
            onValueChange([values[0], values[1]]);
          }
        }}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={1}
      >
        {/* Track background */}
        <Slider.Track className="relative grow rounded-full bg-oslo-gray-800 h-1.5">
          {/* Range highlight */}
          <Slider.Range className="absolute rounded-full bg-oslo-gray-600 h-1.5" />
        </Slider.Track>

        {/* Min thumb */}
        <Slider.Thumb
          className="block h-5 w-5 rounded-full bg-oslo-gray-100 border-2 border-oslo-gray-600 shadow-lg shadow-oslo-gray-600/30 cursor-pointer hover:shadow-lg hover:shadow-oslo-gray-600/50 focus:outline-none focus:ring-2 focus:ring-oslo-gray-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-950 transition-shadow"
          aria-label="Minimum price"
        />

        {/* Max thumb */}
        <Slider.Thumb
          className="block h-5 w-5 rounded-full bg-oslo-gray-100 border-2 border-oslo-gray-600 shadow-lg shadow-oslo-gray-600/30 cursor-pointer hover:shadow-lg hover:shadow-oslo-gray-600/50 focus:outline-none focus:ring-2 focus:ring-oslo-gray-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-950 transition-shadow"
          aria-label="Maximum price"
        />
      </Slider.Root>
    </div>
  );
}
