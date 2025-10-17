import { useMemo } from "react";

type AllPopulationData = {
  prefCode: number;
  boundaryYear: number;
  totalPopulation: { year: number; value: number; rate?: number }[];
  youthPopulation: { year: number; value: number; rate?: number }[];
  workingAgePopulation: { year: number; value: number; rate?: number }[];
  elderlyPopulation: { year: number; value: number; rate?: number }[];
};

type AgeGroup = "total" | "youth" | "working" | "elderly";

export function usePopulationColorMap(
  allPopulationData: AllPopulationData[],
  ageGroup: AgeGroup = "total"
) {
  const result = useMemo(() => {
    const map = new Map<number, string>();

    // boundaryYearの人口データを取得
    const populations = allPopulationData.map((data) => {
      let targetData;
      switch (ageGroup) {
        case "youth":
          targetData = data.youthPopulation.find(
            (d) => d.year === data.boundaryYear
          );
          break;
        case "working":
          targetData = data.workingAgePopulation.find(
            (d) => d.year === data.boundaryYear
          );
          break;
        case "elderly":
          targetData = data.elderlyPopulation.find(
            (d) => d.year === data.boundaryYear
          );
          break;
        default:
          targetData = data.totalPopulation.find(
            (d) => d.year === data.boundaryYear
          );
      }
      return { prefCode: data.prefCode, population: targetData?.value || 0 };
    });

    // 最大・最小人口を取得
    const maxPopulation = Math.max(...populations.map((p) => p.population));
    const minPopulation = Math.min(...populations.map((p) => p.population));

    // 人口比率から色を計算する関数
    const getColorFromRatio = (ratio: number) => {
      const hue = 100 - ratio * 95; // 100 (緑) から 5 (赤) へ
      const lightness = 60 + (1 - ratio) * 5;
      return `hsl(${hue}, 70%, ${lightness}%)`;
    };
    // 各都道府県の色を計算
    populations.forEach(({ prefCode, population }) => {
      const ratio =
        (population - minPopulation) / (maxPopulation - minPopulation);
      // 小さい ratio の範囲はより大きく変化させる
      const colorRatio = Math.pow(ratio, 0.35);
      map.set(prefCode, getColorFromRatio(colorRatio));
    });

    return {
      populationColorMap: map,
      minPopulation,
      minColor: getColorFromRatio(0), // 最小（ratio=0）の色
      maxPopulation,
      maxColor: getColorFromRatio(1), // 最大（ratio=1）の色
      getColorFromRatio,
    };
  }, [allPopulationData, ageGroup]);

  return result;
}
