"use client";

import { useState } from "react";

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
};

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
}: RangeSliderProps) {
  const [minVal, maxVal] = value;

  const handleMinChange = (val: number) => {
    if (val <= maxVal) onChange([val, maxVal]);
  };

  const handleMaxChange = (val: number) => {
    if (val >= minVal) onChange([minVal, val]);
  };

  return (
    <div className="w-full space-y-6">

      {/* SLIDER */}
      <div className="relative h-2">
        <div className="absolute inset-0 bg-foreground/20 rounded-full" />

        <div
          className="absolute h-2 bg-brand rounded-full"
          style={{
            left: `${((minVal - min) / (max - min)) * 100}%`,
            right: `${100 - ((maxVal - min) / (max - min)) * 100}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute w-full pointer-events-none appearance-none bg-transparent
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-foreground
            -mt-1
            accent-brand"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute w-full pointer-events-none appearance-none bg-transparent
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-black
            -mt-1
            accent-brand"
        />
      </div>

      {/* INPUTS */}
      <div className="flex gap-4">
        <div className="flex items-center border px-3 py-2 rounded-md w-full">
          <span className="mr-2">₹</span>
          <input
            type="number"
            value={minVal}
            min={min}
            max={maxVal}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex items-center border px-3 py-2 rounded-md w-full">
          <span className="mr-2">₹</span>
          <input
            type="number"
            value={maxVal}
            min={minVal}
            max={max}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="w-full outline-none text-sm"
          />
        </div>
      </div>
    </div>
  );
}
