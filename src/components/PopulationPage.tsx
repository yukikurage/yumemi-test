"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { components } from "@/generated/api";
import { PrefectureSelection } from "./PrefectureSelection";
import { PopulationChart } from "./PopulationChart";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { searchPrefectures } from "@/lib/searchPrefectures";
import { SearchInput } from "./SearchInput";
import { JapanMap } from "./JapanMap";
import { PieChartLegend } from "./PieChartLegend";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

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
  // モバイルのグラフ表示状態: "hidden" | "compact" | "expanded"
  const [mobileGraphState, setMobileGraphState] = useState<
    "hidden" | "compact" | "expanded"
  >("hidden");

  // allPopulationData を Map に変換
  const populationDataMap = useMemo(() => {
    return new Map(allPopulationData.map((data) => [data.prefCode, data]));
  }, [allPopulationData]);

  // prefCode → Prefecture のマップ（検索の最適化）
  const prefCodeMap = useMemo(() => {
    return new Map(prefectures.map((pref) => [pref.prefCode, pref]));
  }, [prefectures]);

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

  // 選択が変わったら状態を更新
  useEffect(() => {
    if (hasSelection && mobileGraphState === "hidden") {
      setMobileGraphState("compact");
    } else if (!hasSelection) {
      setMobileGraphState("hidden");
    }
  }, [hasSelection, mobileGraphState]);

  const handleMapClick = useCallback(
    (prefCode: number) => {
      const pref = prefCodeMap.get(prefCode);
      if (pref) {
        const isSelected = selectedPrefs.has(prefCode);
        handleChangeSelections(pref, !isSelected);
      }
    },
    [prefCodeMap, selectedPrefs, handleChangeSelections]
  );

  return (
    <div className="relative h-full flex flex-row gap-10 w-full">
      {/* グリッド背景（ページ全体） */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-grid" />

      {/* 日本地図エリア（ページ全体） */}
      <div className="absolute inset-0">
        <JapanMap
          prefectures={prefectures}
          selectedPrefCodes={selectedPrefs}
          onPrefectureClick={handleMapClick}
          allPopulationData={allPopulationData}
        />
      </div>

      {/* グラフエリア（デスクトップ） */}
      <div
        className="hidden md:block absolute right-4 top-4 rounded-md bg-white/90 backdrop-blur-sm p-8 border border-neutral-200 max-w-2xl transition-opacity duration-500 overflow-auto"
        style={{
          opacity: hasSelection ? 1 : 0,
          pointerEvents: hasSelection ? "auto" : "none",
          maxHeight: "calc(100vh - 280px)",
        }}
      >
        <PopulationChart
          prefectures={prefectures}
          populationData={selectedPopulationData}
          onRemovePrefecture={handleRemovePrefecture}
        />
      </div>

      {/* グラフエリア（モバイル*/}
      {(mobileGraphState === "compact" || mobileGraphState === "expanded") && (
        <div
          className="md:hidden fixed left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-10 overflow-auto transition-all duration-300 rounded-t-4xl"
          style={{
            bottom: 0,
            top:
              mobileGraphState === "expanded"
                ? "calc(64px + 200px)"
                : "calc(100dvh - 280px)",
          }}
        >
          <div className="flex items-center justify-center sticky top-0 z-10 w-full">
            {/* 開く / 閉じるボタン */}
            <button
              onClick={() => {
                if (mobileGraphState === "compact") {
                  setMobileGraphState("expanded");
                } else if (mobileGraphState === "expanded") {
                  setMobileGraphState("hidden");
                }
              }}
              className="w-full py-3 border-b border-neutral-100 bg-white/90 backdrop-blur-sm text-xs text-neutral-500 flex justify-center items-center"
              aria-label={
                mobileGraphState === "compact" ? "詳細を展開" : "詳細を閉じる"
              }
            >
              {"compact" === mobileGraphState ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* グラフエリア */}
          <div className="relative p-4">
            <PopulationChart
              prefectures={prefectures}
              populationData={selectedPopulationData}
              onRemovePrefecture={handleRemovePrefecture}
              compact={mobileGraphState === "compact"}
            />
          </div>
        </div>
      )}

      {/* 下部：検索バーと都道府県選択 */}
      {/* デスクトップ版 */}
      <div className="hidden md:flex fixed left-0 right-0 bottom-0 h-fit flex-col gap-4 items-start justify-end">
        <div className="w-full px-8 pt-4 h-fit flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
          <div className="min-w-full md:min-w-fit md:flex-none">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="flex justify-start md:flex-none">
            <PieChartLegend />
          </div>
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

      {/* モバイル版 */}
      <div
        className="md:hidden fixed left-0 right-0 h-fit flex flex-col gap-3 items-start justify-end transition-all duration-300"
        style={{
          bottom:
            mobileGraphState === "compact"
              ? "280px"
              : mobileGraphState === "expanded"
              ? "auto"
              : "0",
          top: mobileGraphState === "expanded" ? "64px" : "auto",
        }}
      >
        <div className="w-full px-4 pt-4 h-fit flex flex-col items-stretch gap-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          <PieChartLegend />
        </div>
        <div className="w-full h-fit overflow-auto">
          <div className="px-4 pb-4 h-fit w-fit">
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
