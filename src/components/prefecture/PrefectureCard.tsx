"use client";

import { components } from "@/generated/api";
import { getPrefectureEnglishName } from "@/lib/prefectureExtraData";
import { PopulationPieChart } from "@/components/chart/PopulationPieChart";
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
  // 総人口
  totalPopulation?: number;
};

export const PrefectureCard = memo(function PrefectureCard({
  pref,
  checked,
  onChange,
  populationComposition,
  totalPopulation,
}: PrefectureCardProps) {
  const englishName = getPrefectureEnglishName(pref.prefCode);

  const formatPopulation = (value: number) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)}千万人`;
    } else if (value >= 10000) {
      return `${Math.round(value / 10000)}万人`;
    }
    return `${value}人`;
  };

  return (
    <button
      className={`relative backdrop-blur-md w-32 xl:w-64 h-20 xl:h-36 shrink-0 p-2 xl:p-4 cursor-pointer hover:shadow-lg active:shadow-md transition-all rounded-md outline ${
        checked
          ? "outline-2 outline-primary-border bg-primary-background/92"
          : "outline-slate-200 bg-white/92"
      }`}
      onClick={() => onChange(!checked)}
    >
      {/* 左上：都道府県名と英語名 */}
      <div className="absolute top-2 xl:top-4 left-2 xl:left-4 text-left">
        <div
          className={`text-sm xl:text-base font-normal ${checked ? "text-cyan-900 font-bold" : "text-slate-900"}`}
        >
          {pref.prefName}
        </div>
        <div className="text-xs xl:text-sm font-normal text-slate-700 hidden xl:block">
          {englishName}
        </div>
        {totalPopulation && (
          <div className="text-[10px] xl:text-xs font-medium text-slate-600 mt-0.5 xl:mt-1">
            {formatPopulation(totalPopulation)}
          </div>
        )}
      </div>

      {/* 右下：円グラフ（デスクトップのみ） */}
      {populationComposition && (
        <div className="hidden xl:flex absolute bottom-4 right-4 overflow-visible w-16 h-16 items-center justify-center">
          <PopulationPieChart
            youth={populationComposition.youth}
            workingAge={populationComposition.workingAge}
            elderly={populationComposition.elderly}
            size={64}
          />
        </div>
      )}

      {/* 左下：Detail ボタンと矢印 */}
      <div className="absolute bottom-2 xl:bottom-4 left-2 xl:left-4 flex items-center gap-1 xl:gap-2">
        <span className="text-[9px] xl:text-xs font-bold text-slate-700">
          Compare
        </span>
        <svg
          className="w-3 h-3 text-slate-700"
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
