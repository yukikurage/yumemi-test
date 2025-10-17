import { memo } from "react";
import type { GeoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";

type PrefectureProperties = {
  nam: string;
  nam_ja: string;
  id: number;
};

type PrefectureFeature = Feature<Geometry, PrefectureProperties>;

type MapPrefecturePathProps = {
  feature: PrefectureFeature;
  index: number;
  pathGenerator: GeoPath<unknown, Geometry>;
  fillColor: string;
  onPrefectureClick: (prefName: string) => void;
};

export const MapPrefecturePath = memo(function MapPrefecturePath({
  feature,
  index,
  pathGenerator,
  fillColor,
  onPrefectureClick,
}: MapPrefecturePathProps) {
  const prefName = feature.properties.nam_ja;
  const pathData = pathGenerator(feature.geometry);

  return (
    <path
      key={`prefecture-${index}`}
      d={pathData || undefined}
      className="prefecture cursor-pointer transition-all duration-200 hover:opacity-70"
      fill={fillColor}
      stroke="var(--base-color-100)"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
      onClick={() => onPrefectureClick(prefName)}
    >
      <title>{prefName}</title>
    </path>
  );
});
