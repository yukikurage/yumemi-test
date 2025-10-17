"use client";

export type Region =
  | "all"
  | "hokkaido-tohoku"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu";

type RegionFilterProps = {
  selectedRegion: Region;
  onChange: (region: Region) => void;
};

const REGIONS: { value: Region; label: string }[] = [
  { value: "all", label: "全国" },
  { value: "hokkaido-tohoku", label: "北海道・東北" },
  { value: "kanto", label: "関東" },
  { value: "chubu", label: "中部" },
  { value: "kinki", label: "近畿" },
  { value: "chugoku", label: "中国" },
  { value: "shikoku", label: "四国" },
  { value: "kyushu", label: "九州・沖縄" },
];

export function RegionFilter({ selectedRegion, onChange }: RegionFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-base-color-700">地域：</label>
      <select
        value={selectedRegion}
        onChange={(e) => onChange(e.target.value as Region)}
        className="h-10 px-3 border border-base-color-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {REGIONS.map((region) => (
          <option key={region.value} value={region.value}>
            {region.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * 地域による都道府県のフィルタリング
 */
export function filterByRegion(prefCode: number, region: Region): boolean {
  if (region === "all") return true;

  switch (region) {
    case "hokkaido-tohoku":
      return prefCode >= 1 && prefCode <= 7;
    case "kanto":
      return prefCode >= 8 && prefCode <= 14;
    case "chubu":
      return prefCode >= 15 && prefCode <= 23;
    case "kinki":
      return prefCode >= 24 && prefCode <= 30;
    case "chugoku":
      return prefCode >= 31 && prefCode <= 35;
    case "shikoku":
      return prefCode >= 36 && prefCode <= 39;
    case "kyushu":
      return prefCode >= 40 && prefCode <= 47;
    default:
      return true;
  }
}
