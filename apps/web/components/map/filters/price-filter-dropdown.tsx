"use client";

/**
 * Price Filter Dropdown (Realtor.com Style)
 *
 * Advanced price range selector with:
 * - Interactive range slider (Radix UI)
 * - Dropdown selects for exact values
 * - Real-time sync with URL
 * - Realtor.com inspired design
 */

import { useState, useCallback, useEffect } from "react";
import { FilterDropdown } from "./filter-dropdown";
import { PriceRangeSlider } from "./price-range-slider";
import { PriceDropdownSelect } from "./price-dropdown-select";

interface PriceFilterDropdownProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (minPrice?: number, maxPrice?: number) => void;
  dbMinPrice?: number;
  dbMaxPrice?: number;
}

const MIN_PRICE = 0;
const MAX_PRICE = 2000000;

export function PriceFilterDropdown({
  minPrice,
  maxPrice,
  onPriceChange,
  dbMinPrice,
  dbMaxPrice,
}: PriceFilterDropdownProps) {
  // Use dynamic database ranges if available, otherwise use hardcoded defaults
  const sliderMinBound = dbMinPrice ?? MIN_PRICE;
  const sliderMaxBound = dbMaxPrice ?? MAX_PRICE;

  const [sliderMin, setSliderMin] = useState<number>(
    minPrice ?? sliderMinBound,
  );
  const [sliderMax, setSliderMax] = useState<number>(
    maxPrice ?? sliderMaxBound,
  );
  const [dropdownMin, setDropdownMin] = useState<number | undefined>(minPrice);
  const [dropdownMax, setDropdownMax] = useState<number | undefined>(maxPrice);

  // Sync state when props change
  useEffect(() => {
    setSliderMin(minPrice ?? sliderMinBound);
    setDropdownMin(minPrice);
  }, [minPrice, sliderMinBound]);

  useEffect(() => {
    setSliderMax(maxPrice ?? sliderMaxBound);
    setDropdownMax(maxPrice);
  }, [maxPrice, sliderMaxBound]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const displayValue =
    minPrice || maxPrice
      ? `${minPrice ? formatPrice(minPrice) : "$0"} - ${
          maxPrice ? formatPrice(maxPrice) : "$2.000.000"
        }`
      : "Precio";

  const handleSliderChange = useCallback(
    ([min, max]: [number, number]) => {
      setSliderMin(min);
      setSliderMax(max);
      setDropdownMin(min > sliderMinBound ? min : undefined);
      setDropdownMax(max < sliderMaxBound ? max : undefined);
      onPriceChange(
        min > sliderMinBound ? min : undefined,
        max < sliderMaxBound ? max : undefined,
      );
    },
    [onPriceChange, sliderMinBound, sliderMaxBound],
  );

  const handleDropdownMinChange = useCallback(
    (value: number | undefined) => {
      setDropdownMin(value);
      const newMin = value ?? sliderMinBound;
      setSliderMin(newMin);

      // Ensure min doesn't exceed max
      const finalMax = dropdownMax ?? sliderMaxBound;
      if (newMin <= finalMax) {
        onPriceChange(value, dropdownMax);
      }
    },
    [dropdownMax, onPriceChange, sliderMinBound, sliderMaxBound],
  );

  const handleDropdownMaxChange = useCallback(
    (value: number | undefined) => {
      setDropdownMax(value);
      const newMax = value ?? sliderMaxBound;
      setSliderMax(newMax);

      // Ensure max doesn't go below min
      const finalMin = dropdownMin ?? sliderMinBound;
      if (newMax >= finalMin) {
        onPriceChange(dropdownMin, value);
      }
    },
    [dropdownMin, onPriceChange, sliderMinBound, sliderMaxBound],
  );

  return (
    <FilterDropdown label="Precio" value={displayValue}>
      <div className="w-72 m-0 p-4 space-y-4 bg-oslo-gray-900/90 rounded-lg ">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-oslo-gray-100">Precio</h3>
          <span className="text-sm text-oslo-gray-400">Precio de venta</span>
        </div>

        {/* Range Slider */}
        <PriceRangeSlider
          min={sliderMinBound}
          max={sliderMaxBound}
          step={10000}
          minValue={sliderMin}
          maxValue={sliderMax}
          onValueChange={handleSliderChange}
        />

        {/* Dropdown Selects */}
        <div className="flex items-center gap-3">
          <PriceDropdownSelect
            value={dropdownMin}
            onChange={handleDropdownMinChange}
            isMin={true}
          />
          <span className="text-oslo-gray-400">-</span>
          <PriceDropdownSelect
            value={dropdownMax}
            onChange={handleDropdownMaxChange}
            isMin={false}
          />
        </div>

        {/* Info text */}
        <div className="text-xs text-oslo-gray-500">
          {sliderMin > sliderMinBound || sliderMax < sliderMaxBound
            ? `${sliderMin > sliderMinBound ? formatPrice(sliderMin) : "No mín."} - ${sliderMax < sliderMaxBound ? formatPrice(sliderMax) : "Sin límite"}`
            : "Cualquier precio"}
        </div>
      </div>
    </FilterDropdown>
  );
}
