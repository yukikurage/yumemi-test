import { memo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [isFocused, setIsFocused] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [svgRoot, setSvgRoot] = useState<SVGSVGElement | null>(null);

  // SVGのルート要素を取得
  useEffect(() => {
    if (pathRef.current) {
      const svg = pathRef.current.ownerSVGElement;
      setSvgRoot(svg);
    }
  }, []);

  return (
    <>
      <path
        ref={pathRef}
        key={`prefecture-${index}`}
        d={pathData || undefined}
        className="prefecture cursor-pointer transition-all duration-200 hover:opacity-70 focus:outline-none"
        fill={fillColor}
        stroke="#ffffff"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        onClick={() => onPrefectureClick(prefName)}
        role="button"
        aria-label={`${prefName}を選択`}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPrefectureClick(prefName);
          }
        }}
      >
        <title>{prefName}</title>
      </path>

      {/* focus時の太い境界線をSVGルートの最後にポータル */}
      {isFocused && svgRoot && createPortal(
        <path
          d={pathData || undefined}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
          className="opacity-60"
        />,
        svgRoot
      )}
    </>
  );
});
