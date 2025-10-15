export type PrefectureExtraData = {
  prefCode: number;
  englishName: string;
  hiraganaName: string;
  katakanaName: string;
  romajiName: string;
};

export const PREFECTURE_EXTRA_DATA: Record<number, PrefectureExtraData> = {
  1: { prefCode: 1, englishName: "Hokkaido", hiraganaName: "ほっかいどう", katakanaName: "ホッカイドウ", romajiName: "hokkaido" },
  2: { prefCode: 2, englishName: "Aomori", hiraganaName: "あおもり", katakanaName: "アオモリ", romajiName: "aomori" },
  3: { prefCode: 3, englishName: "Iwate", hiraganaName: "いわて", katakanaName: "イワテ", romajiName: "iwate" },
  4: { prefCode: 4, englishName: "Miyagi", hiraganaName: "みやぎ", katakanaName: "ミヤギ", romajiName: "miyagi" },
  5: { prefCode: 5, englishName: "Akita", hiraganaName: "あきた", katakanaName: "アキタ", romajiName: "akita" },
  6: { prefCode: 6, englishName: "Yamagata", hiraganaName: "やまがた", katakanaName: "ヤマガタ", romajiName: "yamagata" },
  7: { prefCode: 7, englishName: "Fukushima", hiraganaName: "ふくしま", katakanaName: "フクシマ", romajiName: "fukushima" },
  8: { prefCode: 8, englishName: "Ibaraki", hiraganaName: "いばらき", katakanaName: "イバラキ", romajiName: "ibaraki" },
  9: { prefCode: 9, englishName: "Tochigi", hiraganaName: "とちぎ", katakanaName: "トチギ", romajiName: "tochigi" },
  10: { prefCode: 10, englishName: "Gunma", hiraganaName: "ぐんま", katakanaName: "グンマ", romajiName: "gunma" },
  11: { prefCode: 11, englishName: "Saitama", hiraganaName: "さいたま", katakanaName: "サイタマ", romajiName: "saitama" },
  12: { prefCode: 12, englishName: "Chiba", hiraganaName: "ちば", katakanaName: "チバ", romajiName: "chiba" },
  13: { prefCode: 13, englishName: "Tokyo", hiraganaName: "とうきょう", katakanaName: "トウキョウ", romajiName: "tokyo" },
  14: { prefCode: 14, englishName: "Kanagawa", hiraganaName: "かながわ", katakanaName: "カナガワ", romajiName: "kanagawa" },
  15: { prefCode: 15, englishName: "Niigata", hiraganaName: "にいがた", katakanaName: "ニイガタ", romajiName: "niigata" },
  16: { prefCode: 16, englishName: "Toyama", hiraganaName: "とやま", katakanaName: "トヤマ", romajiName: "toyama" },
  17: { prefCode: 17, englishName: "Ishikawa", hiraganaName: "いしかわ", katakanaName: "イシカワ", romajiName: "ishikawa" },
  18: { prefCode: 18, englishName: "Fukui", hiraganaName: "ふくい", katakanaName: "フクイ", romajiName: "fukui" },
  19: { prefCode: 19, englishName: "Yamanashi", hiraganaName: "やまなし", katakanaName: "ヤマナシ", romajiName: "yamanashi" },
  20: { prefCode: 20, englishName: "Nagano", hiraganaName: "ながの", katakanaName: "ナガノ", romajiName: "nagano" },
  21: { prefCode: 21, englishName: "Gifu", hiraganaName: "ぎふ", katakanaName: "ギフ", romajiName: "gifu" },
  22: { prefCode: 22, englishName: "Shizuoka", hiraganaName: "しずおか", katakanaName: "シズオカ", romajiName: "shizuoka" },
  23: { prefCode: 23, englishName: "Aichi", hiraganaName: "あいち", katakanaName: "アイチ", romajiName: "aichi" },
  24: { prefCode: 24, englishName: "Mie", hiraganaName: "みえ", katakanaName: "ミエ", romajiName: "mie" },
  25: { prefCode: 25, englishName: "Shiga", hiraganaName: "しが", katakanaName: "シガ", romajiName: "shiga" },
  26: { prefCode: 26, englishName: "Kyoto", hiraganaName: "きょうと", katakanaName: "キョウト", romajiName: "kyoto" },
  27: { prefCode: 27, englishName: "Osaka", hiraganaName: "おおさか", katakanaName: "オオサカ", romajiName: "osaka" },
  28: { prefCode: 28, englishName: "Hyogo", hiraganaName: "ひょうご", katakanaName: "ヒョウゴ", romajiName: "hyogo" },
  29: { prefCode: 29, englishName: "Nara", hiraganaName: "なら", katakanaName: "ナラ", romajiName: "nara" },
  30: { prefCode: 30, englishName: "Wakayama", hiraganaName: "わかやま", katakanaName: "ワカヤマ", romajiName: "wakayama" },
  31: { prefCode: 31, englishName: "Tottori", hiraganaName: "とっとり", katakanaName: "トットリ", romajiName: "tottori" },
  32: { prefCode: 32, englishName: "Shimane", hiraganaName: "しまね", katakanaName: "シマネ", romajiName: "shimane" },
  33: { prefCode: 33, englishName: "Okayama", hiraganaName: "おかやま", katakanaName: "オカヤマ", romajiName: "okayama" },
  34: { prefCode: 34, englishName: "Hiroshima", hiraganaName: "ひろしま", katakanaName: "ヒロシマ", romajiName: "hiroshima" },
  35: { prefCode: 35, englishName: "Yamaguchi", hiraganaName: "やまぐち", katakanaName: "ヤマグチ", romajiName: "yamaguchi" },
  36: { prefCode: 36, englishName: "Tokushima", hiraganaName: "とくしま", katakanaName: "トクシマ", romajiName: "tokushima" },
  37: { prefCode: 37, englishName: "Kagawa", hiraganaName: "かがわ", katakanaName: "カガワ", romajiName: "kagawa" },
  38: { prefCode: 38, englishName: "Ehime", hiraganaName: "えひめ", katakanaName: "エヒメ", romajiName: "ehime" },
  39: { prefCode: 39, englishName: "Kochi", hiraganaName: "こうち", katakanaName: "コウチ", romajiName: "kochi" },
  40: { prefCode: 40, englishName: "Fukuoka", hiraganaName: "ふくおか", katakanaName: "フクオカ", romajiName: "fukuoka" },
  41: { prefCode: 41, englishName: "Saga", hiraganaName: "さが", katakanaName: "サガ", romajiName: "saga" },
  42: { prefCode: 42, englishName: "Nagasaki", hiraganaName: "ながさき", katakanaName: "ナガサキ", romajiName: "nagasaki" },
  43: { prefCode: 43, englishName: "Kumamoto", hiraganaName: "くまもと", katakanaName: "クマモト", romajiName: "kumamoto" },
  44: { prefCode: 44, englishName: "Oita", hiraganaName: "おおいた", katakanaName: "オオイタ", romajiName: "oita" },
  45: { prefCode: 45, englishName: "Miyazaki", hiraganaName: "みやざき", katakanaName: "ミヤザキ", romajiName: "miyazaki" },
  46: { prefCode: 46, englishName: "Kagoshima", hiraganaName: "かごしま", katakanaName: "カゴシマ", romajiName: "kagoshima" },
  47: { prefCode: 47, englishName: "Okinawa", hiraganaName: "おきなわ", katakanaName: "オキナワ", romajiName: "okinawa" },
} as const;

/**
 * 都道府県コードから追加データを取得
 */
export function getPrefectureExtraData(prefCode: number): PrefectureExtraData | undefined {
  return PREFECTURE_EXTRA_DATA[prefCode];
}

/**
 * 都道府県コードから英語名を取得
 */
export function getPrefectureEnglishName(prefCode: number): string {
  return PREFECTURE_EXTRA_DATA[prefCode]?.englishName ?? "Unknown";
}
