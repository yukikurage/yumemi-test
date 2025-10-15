import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { components } from "@/generated/api";

type PopulationCompositionPerYearResponse =
  components["schemas"]["PopulationCompositionPerYearResponse"];

export async function getCachedPopulationData(
  prefCode: number
): Promise<PopulationCompositionPerYearResponse> {
  const { env } = getCloudflareContext();
  const cacheKey = `population:${prefCode}`;

  // KVから取得（Cron Workerが事前にキャッシュ済み）
  const cached = await env.POPULATION_CACHE.get(cacheKey, "json");

  if (cached) {
    console.log(`Cache hit for prefCode ${prefCode}`);
    return cached as PopulationCompositionPerYearResponse;
  }

  // キャッシュミス時のフォールバック（稀なケース）
  // - 新規デプロイ直後
  // - KVの有効期限切れ
  // - Cron Worker のエラー
  console.warn(`Cache miss for prefCode ${prefCode}, fetching from API...`);

  const { getPopulationComposition } = await import("./yumemiApi");
  const data = await getPopulationComposition(prefCode);

  // レスポンスを PopulationCompositionPerYearResponse 形式に変換
  const response: PopulationCompositionPerYearResponse = {
    message: null,
    result: data,
  };

  // キャッシュに保存
  await env.POPULATION_CACHE.put(cacheKey, JSON.stringify(response), {
    expirationTtl: 604800,
  });

  return response;
}

/**
 * 全47都道府県の人口データを一括取得
 * KV の list() を使って population:* で始まる全てのキーを取得
 */
export async function getAllCachedPopulationData() {
  const { env } = getCloudflareContext();

  // prefix "population:" で始まる全てのキーをリスト
  const list = await env.POPULATION_CACHE.list({ prefix: "population:" });
  console.log(`KV list found ${list.keys.length} keys`);

  // 各キーの値を並列で取得
  const promises = list.keys.map(({ name }) =>
    env.POPULATION_CACHE.get(name, "json").then((data) => {
      if (!data) {
        console.warn(`No data for ${name}`);
      }
      return {
        // "population:1" -> 1 に変換
        prefCode: parseInt(name.split(":")[1]),
        data: data as PopulationCompositionPerYearResponse | null,
      };
    })
  );

  const results = await Promise.all(promises);
  const filteredResults = results.filter(
    (
      r
    ): r is {
      prefCode: number;
      data: PopulationCompositionPerYearResponse;
    } => r.data !== null
  );

  console.log(
    `getAllCachedPopulationData: Retrieved ${filteredResults.length} out of ${results.length} prefectures`
  );

  // Map形式で返す
  return new Map(filteredResults.map((r) => [r.prefCode, r.data] as const));
}

/**
 * 特定の年の全都道府県の総人口を取得（軽量版）
 * 地図表示やランキングに最適
 *
 * @param year - 取得したい年（例: 2020）
 * @param label - 人口データのラベル（デフォルト: "総人口"）
 * @returns 都道府県コードと人口値の配列
 */
export async function getPopulationSummaryForYear(
  year: number,
  label: string = "総人口"
) {
  const allData = await getAllCachedPopulationData();

  const summary: Array<{
    prefCode: number;
    year: number;
    value: number;
  }> = [];

  for (const [prefCode, composition] of allData) {
    const labelData = composition.result.data.find(
      (item) => item.label === label
    );

    if (labelData) {
      const yearData = labelData.data.find((d) => d.year === year);
      if (yearData) {
        summary.push({
          prefCode,
          year,
          value: yearData.value,
        });
      }
    }
  }

  return summary;
}
