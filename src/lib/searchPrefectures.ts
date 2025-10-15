import type { components } from "@/generated/api";
import { getPrefectureExtraData } from "./prefectureExtraData";

type Prefecture = components["schemas"]["Prefecture"];

export type PrefectureWithScore = {
  prefecture: Prefecture;
  score: number; // 0: 前方一致, 1: 部分一致, 2: マッチなし
};

/**
 * 都道府県を検索クエリでフィルタリング・ソート
 * ひらがな、カタカナ、ローマ字、漢字すべてに対応
 * 前方一致 > 部分一致の順で優先
 */
export function searchPrefectures(
  prefectures: Prefecture[],
  query: string
): Prefecture[] {
  if (!query.trim()) {
    return prefectures;
  }

  const normalizedQuery = query.toLowerCase().trim();

  const withScores: PrefectureWithScore[] = prefectures.map((pref) => {
    const extraData = getPrefectureExtraData(pref.prefCode);
    if (!extraData) {
      return { prefecture: pref, score: 2 };
    }

    const searchTargets = [
      pref.prefName, // 漢字
      extraData.hiraganaName, // ひらがな
      extraData.katakanaName, // カタカナ
      extraData.romajiName, // ローマ字
      extraData.englishName.toLowerCase(), // 英語
    ];

    // 前方一致チェック
    for (const target of searchTargets) {
      if (target.toLowerCase().startsWith(normalizedQuery)) {
        return { prefecture: pref, score: 0 };
      }
    }

    // 部分一致チェック
    for (const target of searchTargets) {
      if (target.toLowerCase().includes(normalizedQuery)) {
        return { prefecture: pref, score: 1 };
      }
    }

    // マッチなし
    return { prefecture: pref, score: 2 };
  });

  // score でソート、マッチしたものだけ返す
  return withScores
    .filter((item) => item.score < 2)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.prefecture);
}
