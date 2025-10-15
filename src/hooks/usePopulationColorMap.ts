import { useMemo } from "react";

type AllPopulationData = {
  prefCode: number;
  boundaryYear: number;
  totalPopulation: { year: number; value: number; rate?: number }[];
  youthPopulation: { year: number; value: number; rate?: number }[];
  workingAgePopulation: { year: number; value: number; rate?: number }[];
  elderlyPopulation: { year: number; value: number; rate?: number }[];
};

export function usePopulationColorMap(allPopulationData: AllPopulationData[]) {
  return useMemo(() => {
    const map = new Map<number, string>();

    // boundaryYearの人口データを取得
    const populations = allPopulationData.map((data) => {
      const targetData = data.totalPopulation.find(
        (d) => d.year === data.boundaryYear
      );
      return { prefCode: data.prefCode, population: targetData?.value || 0 };
    });

    // 最大・最小人口を取得
    const maxPopulation = Math.max(...populations.map((p) => p.population));
    const minPopulation = Math.min(...populations.map((p) => p.population));

    // 各都道府県の色を計算（緑のグラデーション）
    populations.forEach(({ prefCode, population }) => {
      const ratio =
        (population - minPopulation) / (maxPopulation - minPopulation);
      // 薄い緑から濃い緑へのグラデーション
      const lightness = 85 - ratio * 45; // 85% -> 40%
      map.set(prefCode, `hsl(140, 60%, ${lightness}%)`);
    });

    return map;
  }, [allPopulationData]);
}
