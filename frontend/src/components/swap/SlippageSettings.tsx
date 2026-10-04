"use client";

import { memo, useState, useCallback } from "react";
import { DEFAULT_SLIPPAGE_OPTIONS } from "@shared/constants";

interface SlippageSettingsProps {
  slippage: number;
  onChange: (slippage: number) => void;
}

const SlippageSettings = memo(function SlippageSettings({
  slippage,
  onChange,
}: SlippageSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handlePresetClick = useCallback(
    (value: number) => {
      onChange(value);
      setCustomValue("");
    },
    [onChange],
  );

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setCustomValue(value);
        if (value) {
          const num = parseFloat(value);
          if (!isNaN(num) && num >= 0 && num <= 100) {
            onChange(num);
          }
        }
      }
    },
    [onChange],
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="flex items-center gap-2 text-[#9B9B9B] hover:text-white transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-sm">{slippage}%</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-[#1B1A1A] border border-[#2B2B2B] rounded-2xl p-4 w-72 z-10 shadow-lg">
          <h4 className="font-semibold text-white mb-3 text-sm">
            Slippage Tolerance
          </h4>
          <div className="flex gap-2 mb-3">
            {DEFAULT_SLIPPAGE_OPTIONS.map((value) => (
              <button
                key={value}
                onClick={() => handlePresetClick(value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  slippage === value && !customValue
                    ? "bg-[#FF007A] text-white"
                    : "bg-[#2B2B2B] hover:bg-[#3B3B3B] text-white"
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={customValue}
              onChange={handleCustomChange}
              placeholder="Custom"
              className="w-full bg-[#2B2B2B] border border-[#3B3B3B] rounded-xl px-4 py-2.5 pr-8 outline-none focus:border-[#FF007A] text-white placeholder:text-[#5E5E5E]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]">
              %
            </span>
          </div>
          {slippage > 5 && (
            <p className="text-yellow-500 text-xs mt-2">
              High slippage may result in unfavorable trades
            </p>
          )}
        </div>
      )}
    </div>
  );
});

export default SlippageSettings;
