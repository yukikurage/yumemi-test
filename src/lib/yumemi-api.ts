import { getCloudflareContext } from "@opennextjs/cloudflare";
import { client } from "./api-client";

/**
 * 都道府県一覧を取得
 *
 * @returns 都道府県一覧データ
 * @throws API エラーが発生した場合
 *
 * @example
 * ```ts
 * const prefectures = await getPrefectures();
 * console.log(prefectures); // [{ prefCode: 1, prefName: "北海道" }, ...]
 * ```
 */
export async function getPrefectures() {
  const { env } = getCloudflareContext();

  const { data, error } = await client.GET("/api/v1/prefectures", {
    headers: {
      "X-API-KEY": env.YUMEMI_API_KEY,
    },
  });

  if (error) {
    throw new Error(`Failed to fetch prefectures: ${JSON.stringify(error)}`);
  }

  return data.result;
}

/**
 * 指定した都道府県の人口構成データを取得
 *
 * @param prefCode - 都道府県コード (1-47)
 * @returns 人口構成データ
 * @throws API エラーが発生した場合
 *
 * @example
 * ```ts
 * const composition = await getPopulationComposition(1); // 北海道
 * console.log(composition.boundaryYear); // 2020
 * console.log(composition.data); // [{ label: "総人口", data: [...] }, ...]
 * ```
 */
export async function getPopulationComposition(prefCode: number) {
  const { env } = getCloudflareContext();

  const { data, error } = await client.GET(
    "/api/v1/population/composition/perYear",
    {
      params: {
        query: {
          prefCode: String(prefCode),
        },
      },
      headers: {
        "X-API-KEY": env.YUMEMI_API_KEY,
      },
    }
  );

  if (error) {
    throw new Error(
      `Failed to fetch population composition: ${JSON.stringify(error)}`
    );
  }

  return data.result;
}
