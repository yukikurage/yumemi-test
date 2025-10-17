"use client";

import { components } from "@/generated/api";
import { PrefectureCard } from "@/components/prefecture/PrefectureCard";
import type { AllPopulationData } from "@/components/pages/PopulationPage";
import { useMemo, memo, useCallback } from "react";

type Prefecture = components["schemas"]["Prefecture"];

export const PrefectureSelection = memo(function PrefectureSelection({
  prefectures,
  allPopulationData,
  onChange,
  selectedPrefs = new Set(),
}: {
  prefectures: Prefecture[];
  allPopulationData: AllPopulationData[];
  onChange: (pref: Prefecture, selected: boolean) => void;
  selectedPrefs?: Set<number>;
}) {
  // prefCode → Prefecture のマップ（検索最適化）
  const prefCodeMap = useMemo(() => {
    return new Map(prefectures.map((pref) => [pref.prefCode, pref]));
  }, [prefectures]);

  const handleCheckboxChange = useCallback(
    (prefCode: number, checked: boolean) => {
      const pref = prefCodeMap.get(prefCode);
      if (pref) {
        onChange(pref, checked);
      }
    },
    [prefCodeMap, onChange]
  );

  // 人口データを事前に計算（最適化版）
  const { populationCompositions, populationMap } = useMemo(() => {
    const compositionMap = new Map<
      number,
      { youth: number; workingAge: number; elderly: number }
    >();
    const totalMap = new Map<number, number>();

    // 1回のループで両方計算
    allPopulationData.forEach((data) => {
      const targetYear = data.boundaryYear;

      // 構成データ
      const youth =
        data.youthPopulation.find((d) => d.year === targetYear)?.value ?? 0;
      const workingAge =
        data.workingAgePopulation.find((d) => d.year === targetYear)?.value ??
        0;
      const elderly =
        data.elderlyPopulation.find((d) => d.year === targetYear)?.value ?? 0;

      compositionMap.set(data.prefCode, { youth, workingAge, elderly });

      // 総人口
      const totalData = data.totalPopulation.find((d) => d.year === targetYear);
      totalMap.set(data.prefCode, totalData?.value || 0);
    });

    return {
      populationCompositions: compositionMap,
      populationMap: totalMap,
    };
  }, [allPopulationData]);

  return (
    <div className="w-fit h-20 xl:h-36 overflow-visible flex items-end gap-2 xl:gap-4 flex-nowrap">
      {prefectures.map((pref) => {
        return (
          <PrefectureCard
            key={pref.prefCode}
            pref={pref}
            checked={selectedPrefs.has(pref.prefCode)}
            onChange={(checked) => handleCheckboxChange(pref.prefCode, checked)}
            populationComposition={populationCompositions.get(pref.prefCode)}
            totalPopulation={populationMap.get(pref.prefCode)}
          />
        );
      })}
    </div>
  );
});
