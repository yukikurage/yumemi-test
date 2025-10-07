"use client";

import { components } from "@/generated/api";
import { getRandomColorFromNumber } from "@/lib/getRandomColorFromNumber";

type Prefecture = components["schemas"]["Prefecture"];

export type PrefectureCardProps = {
  pref: Prefecture;
  checked: boolean;
  onChange: (selected: boolean) => void;
  disabled: boolean;
};

export function PrefectureCard({
  pref,
  checked,
  onChange,
  disabled,
}: PrefectureCardProps) {
  return (
    <label
      key={pref.prefCode}
      className={`relative bg-white h-full w-full flex items-center gap-2 cursor-pointer hover:shadow-lg transition-all rounded overflow-hidden p-8 border border-slate-200 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-4`}
        style={{
          backgroundColor: getRandomColorFromNumber(pref.prefCode),
        }}
      />
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="cursor-pointer"
        disabled={disabled}
      />
      <span className="text-sm">{pref.prefName}</span>
    </label>
  );
}
