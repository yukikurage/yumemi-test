"use client";

import { useState, useMemo, useCallback } from "react";
import type { components } from "@/generated/api";
import { PrefectureSelection } from "./PrefectureSelection";
import { PopulationChart } from "./PopulationChart";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { searchPrefectures } from "@/lib/searchPrefectures";
import { SearchInput } from "./SearchInput";
import { JapanMap } from "./JapanMap";

type Prefecture = components["schemas"]["Prefecture"];

export type AllPopulationData = {
  prefCode: number;
  boundaryYear: number;
  totalPopulation: { year: number; value: number; rate?: number }[];
  youthPopulation: { year: number; value: number; rate?: number }[];
  workingAgePopulation: { year: number; value: number; rate?: number }[];
  elderlyPopulation: { year: number; value: number; rate?: number }[];
};

export function PopulationPage({
  prefectures,
  allPopulationData,
}: {
  prefectures: Prefecture[];
  allPopulationData: AllPopulationData[];
}) {
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set());
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  const [searchQuery, setSearchQuery] = useState("");

  // allPopulationData を Map に変換
  const populationDataMap = useMemo(() => {
    return new Map(allPopulationData.map((data) => [data.prefCode, data]));
  }, [allPopulationData]);

  const handleChangeSelections = useCallback(
    (pref: Prefecture, selected: boolean) => {
      if (selected) {
        setSelectedPrefs((prev) => {
          const newSet = new Set(prev);
          newSet.add(pref.prefCode);
          return newSet;
        });
      } else {
        setSelectedPrefs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(pref.prefCode);
          return newSet;
        });
      }
    },
    []
  );

  const handleRemovePrefecture = useCallback((prefCode: number) => {
    setSelectedPrefs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(prefCode);
      return newSet;
    });
  }, []);

  // 検索でフィルタリングされた都道府県リスト
  const filteredPrefectures = useMemo(() => {
    return searchPrefectures(prefectures, searchQuery);
  }, [prefectures, searchQuery]);

  // 選択された都道府県のデータのみ抽出
  const selectedPopulationData = useMemo(() => {
    const result = new Map<number, AllPopulationData>();
    for (const prefCode of selectedPrefs) {
      const data = populationDataMap.get(prefCode);
      if (data) {
        result.set(prefCode, data);
      }
    }
    return result;
  }, [selectedPrefs, populationDataMap]);

  const hasSelection = selectedPrefs.size > 0;

  const handleMapClick = useCallback(
    (prefCode: number) => {
      const pref = prefectures.find((p) => p.prefCode === prefCode);
      if (pref) {
        const isSelected = selectedPrefs.has(prefCode);
        handleChangeSelections(pref, !isSelected);
      }
    },
    [prefectures, selectedPrefs, handleChangeSelections]
  );

  return (
    <div className="relative h-full flex flex-row gap-10 w-full">
      {/* グリッド背景（ページ全体） */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e0e0e0 1px, transparent 1px),
            linear-gradient(to top, #e0e0e0 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* 日本地図エリア（ページ全体） */}
      <div className="absolute inset-0">
        <JapanMap
          prefectures={prefectures}
          selectedPrefCodes={selectedPrefs}
          onPrefectureClick={handleMapClick}
          allPopulationData={allPopulationData}
        />
      </div>

      {/* グラフエリア */}
      <div
        className="absolute right-4 top-4 bottom-4 rounded-md bg-white/80 backdrop-blur-lg p-8 border border-neutral-100 max-w-2xl shadow-lg transition-opacity duration-500 overflow-auto"
        style={{
          opacity: hasSelection ? 1 : 0,
          pointerEvents: hasSelection ? "auto" : "none",
        }}
      >
        <PopulationChart
          prefectures={prefectures}
          populationData={selectedPopulationData}
          onRemovePrefecture={handleRemovePrefecture}
        />
      </div>

      {/* 下部：検索バーと都道府県選択 */}
      <div className="fixed bottom-0 left-0 right-0 h-fit flex flex-col gap-4 items-start justify-end">
        <div className="px-8 pt-4 h-fit">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="w-full h-fit overflow-auto" ref={scrollRef}>
          <div className="px-8 pb-8 h-fit w-fit">
            <PrefectureSelection
              prefectures={filteredPrefectures}
              allPopulationData={allPopulationData}
              onChange={handleChangeSelections}
              selectedPrefs={selectedPrefs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
