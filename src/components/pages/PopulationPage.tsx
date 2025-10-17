"use client";

import { JapanMap } from "@/components/map/JapanMap";
import { DesktopGraphPanel } from "@/components/panel/DesktopGraphPanel";
import { MobileGraphPanel } from "@/components/panel/MobileGraphPanel";
import { PrefectureSelectionPanel } from "@/components/prefecture/PrefectureSelectionPanel";
import { usePopulationPageState } from "@/hooks/usePopulationPageState";
import type { components } from "@/generated/api";
import "./PopulationPage.css";

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
  // 状態管理とビジネスロジックをカスタムフックに委譲
  const {
    selectedPrefs,
    searchQuery,
    setSearchQuery,
    mobileGraphState,
    setMobileGraphState,
    filteredPrefectures,
    selectedPopulationData,
    hasSelection,
    handleChangeSelections,
    handleRemovePrefecture,
    handleMapClick,
  } = usePopulationPageState(prefectures, allPopulationData);

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
