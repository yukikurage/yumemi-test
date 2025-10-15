import { searchPrefectures } from "../searchPrefectures";
import type { components } from "@/generated/api";

type Prefecture = components["schemas"]["Prefecture"];

const mockPrefectures: Prefecture[] = [
  { prefCode: 1, prefName: "北海道" },
  { prefCode: 13, prefName: "東京都" },
  { prefCode: 27, prefName: "大阪府" },
  { prefCode: 40, prefName: "福岡県" },
];

describe("searchPrefectures", () => {
  it("returns all prefectures when query is empty", () => {
    const result = searchPrefectures(mockPrefectures, "");
    expect(result).toEqual(mockPrefectures);
  });

  it("returns all prefectures when query is whitespace", () => {
    const result = searchPrefectures(mockPrefectures, "   ");
    expect(result).toEqual(mockPrefectures);
  });

  it("filters by kanji name", () => {
    const result = searchPrefectures(mockPrefectures, "東京");
    expect(result).toHaveLength(1);
    expect(result[0].prefName).toBe("東京都");
  });

  it("filters by hiragana name", () => {
    const result = searchPrefectures(mockPrefectures, "ほっかい");
    expect(result).toHaveLength(1);
    expect(result[0].prefName).toBe("北海道");
  });

  it("filters by katakana name", () => {
    const result = searchPrefectures(mockPrefectures, "トウキョウ");
    expect(result).toHaveLength(1);
    expect(result[0].prefName).toBe("東京都");
  });

  it("filters by romaji name", () => {
    const result = searchPrefectures(mockPrefectures, "osaka");
    expect(result).toHaveLength(1);
    expect(result[0].prefName).toBe("大阪府");
  });

  it("is case insensitive", () => {
    const result = searchPrefectures(mockPrefectures, "OSAKA");
    expect(result).toHaveLength(1);
    expect(result[0].prefName).toBe("大阪府");
  });

  it("prioritizes prefix matches over partial matches", () => {
    const result = searchPrefectures(mockPrefectures, "ふく");
    // "ふくおか" (福岡) should appear before any partial matches
    expect(result[0].prefName).toBe("福岡県");
  });

  it("returns empty array when no match is found", () => {
    const result = searchPrefectures(mockPrefectures, "xyz");
    expect(result).toHaveLength(0);
  });

  it("handles partial matches", () => {
    const result = searchPrefectures(mockPrefectures, "かい");
    // "ほっかいどう" contains "かい"
    expect(result.length).toBeGreaterThan(0);
  });
});
