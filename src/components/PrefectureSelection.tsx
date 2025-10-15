"use client";

import { components } from "@/generated/api";
import { PrefectureCard } from "./PrefectureCard";
import type { AllPopulationData } from "./PopulationPage";
import { useCallback, useMemo } from "react";

type Prefecture = components["schemas"]["Prefecture"];

export function PrefectureSelection({
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
  const handleCheckboxChange = (prefCode: number, checked: boolean) => {
    const pref = prefectures.find((p) => p.prefCode === prefCode);
    if (pref) {
      onChange(pref, checked);
    }
  };

  // 人口データから最新年の構成データを取得
  const getPopulationComposition = useCallback(
    (prefCode: number) => {
      const data = allPopulationData.find((d) => d.prefCode === prefCode);
      if (!data) return undefined;

      // 最新年（2020年）のデータを取得
      const latestYear = 2000;
      const youth =
        data.youthPopulation.find((d) => d.year === latestYear)?.value ?? 0;
      const workingAge =
        data.workingAgePopulation.find((d) => d.year === latestYear)?.value ??
        0;
      const elderly =
        data.elderlyPopulation.find((d) => d.year === latestYear)?.value ?? 0;

      return { youth, workingAge, elderly };
    },
    [allPopulationData]
  );

  const populationCompositions = useMemo(() => {
    const map = new Map<
      number,
      { youth: number; workingAge: number; elderly: number }
    >();
    for (const data of allPopulationData) {
      const composition = getPopulationComposition(data.prefCode);
      if (composition) {
        map.set(data.prefCode, composition);
      }
    }
    return map;
  }, [allPopulationData, getPopulationComposition]);

  return (
    <div className="w-fit h-36 overflow-visible flex gap-4 flex-nowrap">
      {prefectures.map((pref) => (
        <PrefectureCard
          key={pref.prefCode}
          pref={pref}
          checked={selectedPrefs.has(pref.prefCode)}
          onChange={(checked) => handleCheckboxChange(pref.prefCode, checked)}
          populationComposition={populationCompositions.get(pref.prefCode)}
        />
      ))}
    </div>
  );
}
