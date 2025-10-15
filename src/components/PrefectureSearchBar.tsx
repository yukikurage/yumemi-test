"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type PrefectureSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function PrefectureSearchBar({
  value,
  onChange,
  placeholder = "都道府県を検索...",
}: PrefectureSearchBarProps) {
  return (
    <div className="relative w-64">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-4 pr-10 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
      </div>
    </div>
  );
}
