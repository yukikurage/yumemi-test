"use client";

import { components } from "@/generated/api";
import { getPrefectureEnglishName } from "@/lib/prefectureExtraData";
import { PopulationPieChart } from "./PopulationPieChart";
import { memo } from "react";

type Prefecture = components["schemas"]["Prefecture"];

export type PrefectureCardProps = {
  pref: Prefecture;
  checked: boolean;
  onChange: (checked: boolean) => void;
  // 最新年の人口構成データ（年少、生産年齢、老年）
  populationComposition?: {
    youth: number;
    workingAge: number;
    elderly: number;
  };
};

export const PrefectureCard = memo(function PrefectureCard({
  pref,
  checked,
  onChange,
  populationComposition,
}: PrefectureCardProps) {
  const englishName = getPrefectureEnglishName(pref.prefCode);

  return (
    <button
      className={`relative w-64 h-36 shrink-0 p-4 cursor-pointer hover:shadow-lg active:shadow-md transition-all rounded-md border-2 ${
        checked
          ? "border-primary-border bg-primary-background"
          : "border-neutral-100 bg-white"
      }`}
      onClick={() => onChange(!checked)}
    >
      {/* 左上：都道府県名と英語名 */}
      <div className="absolute top-4 left-4 text-left">
        <div className="text-base font-normal text-neutral-900">
          {pref.prefName}
        </div>
        <div className="text-sm font-normal text-neutral-700">
          {englishName}
        </div>
      </div>

      {/* 右下：円グラフ */}
      {populationComposition && (
        <div className="absolute bottom-4 right-4 overflow-visible w-16 h-16 flex items-center justify-center">
          <PopulationPieChart
            youth={populationComposition.youth}
            workingAge={populationComposition.workingAge}
            elderly={populationComposition.elderly}
            size={64}
          />
        </div>
      )}

      {/* 左下：Detail ボタンと矢印 */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <span className="text-xs font-bold text-neutral-700">Detail</span>
        <svg
          className="w-3 h-3 text-neutral-700"
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
});
