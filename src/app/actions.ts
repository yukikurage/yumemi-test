"use server";

import { getCachedPopulationData } from "@/lib/populationCache";
import { getPrefectures } from "@/lib/yumemiApi";
import { cache } from "react";

export type PrefecturePopulationData = {
  prefCode: number;
  boundaryYear: number;
  label: string;
  data: {
    year: number;
    value: number;
  }[];
};

/**
 * 指定された都道府県の、指定したラベルの人口データを取得（Server Action）
 * KVキャッシュから取得し、キャッシュミス時のみAPIを呼び出す
 *
 * @param prefCode - 都道府県コード
 * @param label - 人口データのラベル（例: "総人口"）
 * @returns グラフ表示用の人口データ
 */
export const fetchPopulationData: (
  prefCode: number,
  label: string
) => Promise<PrefecturePopulationData> = cache(
  async (prefCode: number, label: string) => {
    try {
      const composition = await getCachedPopulationData(prefCode);

      return {
        prefCode,
        label,
        boundaryYear: composition.result.boundaryYear,
        data:
          composition.result.data.find((item) => item.label === label)?.data ??
          [],
      };
    } catch (error) {
      console.error(`Failed to fetch population data for ${prefCode}:`, error);
      throw new Error(
        `都道府県 ID「${prefCode}」の人口データの取得に失敗しました`
      );
    }
  }
);

export async function fetchPrefectures() {
  try {
    const prefectures = await getPrefectures();
    return prefectures;
  } catch (error) {
    console.error("Failed to fetch prefectures:", error);
    throw new Error("都道府県一覧の取得に失敗しました");
  }
}

/**
 * 全47都道府県の人口データを一括取得（Server Component用）
 */
export async function fetchAllPopulationData() {
  try {
    const { getAllCachedPopulationData } = await import(
      "@/lib/populationCache"
    );
    const allData = await getAllCachedPopulationData();

    // Map を配列に変換してシリアライズ可能にする
    return Array.from(allData.entries()).map(([prefCode, composition]) => ({
      prefCode,
      boundaryYear: composition.result.boundaryYear,
      totalPopulation:
        composition.result.data.find((item) => item.label === "総人口")?.data ??
        [],
      youthPopulation:
        composition.result.data.find((item) => item.label === "年少人口")
          ?.data ?? [],
      workingAgePopulation:
        composition.result.data.find((item) => item.label === "生産年齢人口")
          ?.data ?? [],
      elderlyPopulation:
        composition.result.data.find((item) => item.label === "老年人口")
          ?.data ?? [],
    }));
  } catch (error) {
    console.error("Failed to fetch all population data:", error);
    // エラー時は空配列を返す（フォールバック）
    return [];
  }
}
