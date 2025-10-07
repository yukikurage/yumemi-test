"use client";

import { useState } from "react";
import type { components } from "@/generated/api";
import { PrefectureSelection } from "./PrefectureSelection";
import { PopulationChart } from "./PopulationChart";
import { fetchPopulationData, PrefecturePopulationData } from "@/app/actions";

type Prefecture = components["schemas"]["Prefecture"];

export function PopulationPage({ prefectures }: { prefectures: Prefecture[] }) {
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set());
  const [loadingPrefCodes, setloadingPrefCodes] = useState<Set<number>>(
    new Set()
  );
  const [populationData, setPopulationData] = useState<
    Map<number, PrefecturePopulationData>
  >(new Map());

  const handleChangeSelections = (pref: Prefecture, selected: boolean) => {
    if (selected) {
      setSelectedPrefs((prev) => new Set(prev).add(pref.prefCode));

      // 選択された都道府県の人口データを取得
      setloadingPrefCodes((prev) => new Set(prev).add(pref.prefCode));
      fetchPopulationData(pref.prefCode, "総人口")
        .then((data) => {
          setPopulationData((prev) => new Map(prev).set(pref.prefCode, data));
        })
        .catch((error) => {
          console.error(
            `Failed to fetch population data for ${pref.prefCode}:`,
            error
          );
          alert(
            `都道府県 ID「${pref.prefCode}」の人口データの取得に失敗しました`
          );
        })
        .finally(() => {
          setloadingPrefCodes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(pref.prefCode);
            return newSet;
          });
        });
    } else {
      setSelectedPrefs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(pref.prefCode);
        return newSet;
      });
      setPopulationData((prev) => {
        const newMap = new Map(prev);
        newMap.delete(pref.prefCode);
        return newMap;
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">都道府県別人口推移グラフ</h1>

      <PrefectureSelection
        prefectures={prefectures}
        onChange={handleChangeSelections}
        loadingPrefCodes={loadingPrefCodes}
        selectedPrefCodes={selectedPrefs}
      />

      <div className="bg-white p-4 rounded-lg shadow">
        <PopulationChart
          prefectures={prefectures}
          selectedPrefs={selectedPrefs}
          populationData={populationData}
        />
      </div>
    </div>
  );
}
