"use client";

import { components } from "@/generated/api";
import { PrefectureCard } from "./PrefectureCard";

type Prefecture = components["schemas"]["Prefecture"];

export function PrefectureSelection({
  prefectures,
  onChange,
  loadingPrefCodes = new Set(),
  selectedPrefCodes = new Set(),
}: {
  prefectures: Prefecture[];
  onChange: (pref: Prefecture, selected: boolean) => void;
  loadingPrefCodes?: Set<number>;
  selectedPrefCodes?: Set<number>;
}) {
  const handleCheckboxChange = (prefCode: number, checked: boolean) => {
    const pref = prefectures.find((p) => p.prefCode === prefCode);
    if (pref) {
      onChange(pref, checked);
    }
  };

  return (
    <div className="w-full h-fit">
      <h2 className="text-lg font-semibold w-full h-fit">都道府県選択</h2>
      <div className="flex gap-2 p-2 flex-wrap w-full h-fit">
        {prefectures.map((pref) => (
          <div className="w-36 h-24" key={pref.prefCode}>
            <PrefectureCard
              pref={pref}
              checked={selectedPrefCodes.has(pref.prefCode)}
              onChange={(checked) =>
                handleCheckboxChange(pref.prefCode, checked)
              }
              disabled={loadingPrefCodes.has(pref.prefCode)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
