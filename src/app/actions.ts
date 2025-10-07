"use server";

import { getPopulationComposition, getPrefectures } from "@/lib/yumemi-api";

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
 *
 * @param prefCode - 都道府県コード
 * @param label - 人口データのラベル（例: "総人口"）
 * @returns グラフ表示用の人口データ
 */
export async function fetchPopulationData(
  prefCode: number,
  label: string
): Promise<PrefecturePopulationData> {
  try {
    const composition = await getPopulationComposition(prefCode);

    return {
      prefCode,
      label,
      boundaryYear: composition.boundaryYear,
      data: composition.data.find((item) => item.label === label)?.data ?? [],
    };
  } catch (error) {
    console.error(`Failed to fetch population data for ${prefCode}:`, error);
    throw new Error(
      `都道府県 ID「${prefCode}」の人口データの取得に失敗しました`
    );
  }
}

export async function fetchPrefectures() {
  try {
    const prefectures = await getPrefectures();
    return prefectures;
  } catch (error) {
    console.error("Failed to fetch prefectures:", error);
    throw new Error("都道府県一覧の取得に失敗しました");
  }
}
