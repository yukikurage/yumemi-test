import { useMemo, useCallback } from "react";
import type { AllPopulationData } from "@/components/pages/PopulationPage";
import type { AgeGroup } from "@/components/chart/AgeGroupSelector";

export function usePopulationChartData(
  populationDataValues: AllPopulationData[],
  selectedAgeGroup: AgeGroup
) {
  // 年齢層に応じたデータを取得
  const getDataByAgeGroup = useCallback(
    (data: AllPopulationData) => {
      switch (selectedAgeGroup) {
        case "youth":
          return data.youthPopulation;
        case "working":
          return data.workingAgePopulation;
        case "elderly":
          return data.elderlyPopulation;
        default:
          return data.totalPopulation;
      }
    },
    [selectedAgeGroup]
  );

  // boundaryYearを取得（最小値を使用）
  const boundaryYear = useMemo(() => {
    if (populationDataValues.length === 0) return null;
    return Math.min(...populationDataValues.map((data) => data.boundaryYear));
  }, [populationDataValues]);

  // グラフ用のデータを整形
  const chartData = useMemo(() => {
    // 各都道府県のデータを事前に変換（年→値のマップを作成）
    const prefDataMaps = populationDataValues.map((prefData) => {
      const ageData = getDataByAgeGroup(prefData);
      const yearMap = new Map<number, number>();
      ageData.forEach((d) => {
        yearMap.set(d.year, d.value);
      });
      return {
        prefCode: prefData.prefCode.toString(),
        yearMap,
      };
    });

    // すべての年を収集
    const yearSet = new Set<number>();
    prefDataMaps.forEach(({ yearMap }) => {
      yearMap.forEach((_, year) => yearSet.add(year));
    });

    const years = Array.from(yearSet).sort((a, b) => a - b);

    // 各年のデータポイントを作成
    return years.map((year) => {
      const dataPoint: Record<string, number> = { year };

      prefDataMaps.forEach(({ prefCode, yearMap }) => {
        const value = yearMap.get(year);
        if (value !== undefined) {
          if (year === boundaryYear) {
            dataPoint[`${prefCode}_before`] = value;
            dataPoint[`${prefCode}_after`] = value;
          } else if (!boundaryYear || year < boundaryYear) {
            dataPoint[`${prefCode}_before`] = value;
          } else {
            dataPoint[`${prefCode}_after`] = value;
          }
        }
      });

      return dataPoint;
    });
  }, [populationDataValues, getDataByAgeGroup, boundaryYear]);

  // 統計情報の計算
  const stats = useMemo(() => {
    const latestData = populationDataValues.map((data) => {
      const ageData = getDataByAgeGroup(data);
      return ageData[ageData.length - 1]?.value || 0;
    });
    const totalPopulation = latestData.reduce((sum, val) => sum + val, 0);

    return {
      selectedCount: populationDataValues.length,
      totalPopulation,
    };
  }, [getDataByAgeGroup, populationDataValues]);

  return {
    chartData,
    stats,
    boundaryYear,
  };
}
