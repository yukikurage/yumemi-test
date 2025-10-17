"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { components } from "@/generated/api";
import { searchPrefectures } from "@/lib/searchPrefectures";
import { JapanMap } from "@/components/map/JapanMap";
import { DesktopGraphPanel } from "@/components/panel/DesktopGraphPanel";
import { MobileGraphPanel } from "@/components/panel/MobileGraphPanel";
import { PrefectureSelectionPanel } from "@/components/prefecture/PrefectureSelectionPanel";

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
      <div className="fixed inset-0 pointer-events-none -z-10 bg-grid" />

      {/* 日本地図エリア（ページ全体） */}
      <div className="fixed inset-0">
        <JapanMap
          prefectures={prefectures}
          selectedPrefCodes={selectedPrefs}
          onPrefectureClick={handleMapClick}
          allPopulationData={allPopulationData}
          hasSelection={hasSelection}
          mobileGraphState={mobileGraphState}
        />
      </div>

      {/* グラフエリア（デスクトップ） */}
      <DesktopGraphPanel
        hasSelection={hasSelection}
        prefectures={prefectures}
        populationData={selectedPopulationData}
        onRemovePrefecture={handleRemovePrefecture}
      />

      {/* グラフエリア（モバイル） */}
      <MobileGraphPanel
        mobileGraphState={mobileGraphState}
        setMobileGraphState={setMobileGraphState}
        prefectures={prefectures}
        populationData={selectedPopulationData}
        onRemovePrefecture={handleRemovePrefecture}
      />

      {/* 下部：検索バーと都道府県選択（モバイル） */}
      <PrefectureSelectionPanel
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredPrefectures={filteredPrefectures}
        allPopulationData={allPopulationData}
        onChange={handleChangeSelections}
        selectedPrefs={selectedPrefs}
        mobileBottom={
          mobileGraphState === "compact"
            ? "340px"
            : mobileGraphState === "expanded"
              ? "auto"
              : "0"
        }
        mobileTop={mobileGraphState === "expanded" ? "64px" : "auto"}
      />
    </div>
  );
}
