import { useState, useMemo, useCallback, useEffect } from "react";
import type { components } from "@/generated/api";
import { searchPrefectures } from "@/lib/searchPrefectures";
import type { AllPopulationData } from "@/components/pages/PopulationPage";

type Prefecture = components["schemas"]["Prefecture"];

export function usePopulationPageState(
  prefectures: Prefecture[],
  allPopulationData: AllPopulationData[]
) {
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
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

  return {
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
  };
}
