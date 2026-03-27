"use client";

import { useEffect, useRef, useState } from "react";
import type { AddressSuggestion } from "@/database/types";
import { searchAddresses } from "@/lib/mapbox";
import { MapPin } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, suggestion?: AddressSuggestion) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Search address...",
  label,
  required,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInput = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchAddresses(val);
      setSuggestions(results);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 300);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.place_name, suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" />
          </div>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span>{s.place_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
