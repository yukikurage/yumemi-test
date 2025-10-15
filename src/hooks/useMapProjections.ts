import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";

export function useMapProjections(dimensions: {
  width: number;
  height: number;
}) {
  // メイン地図の投影設定（沖縄除く）
  const mainProjection = useMemo(() => {
    const baseScale = Math.min(dimensions.width, dimensions.height) * 2.4 * 0.9;
    return geoMercator()
      .center([135, 39])
      .scale(baseScale)
      .translate([dimensions.width * 0.45, dimensions.height * 0.42]);
  }, [dimensions.width, dimensions.height]);

  // 沖縄用の投影設定（左上に表示）
  const okinawaProjection = useMemo(() => {
    const okinawaScale =
      Math.min(dimensions.width, dimensions.height) * 3.5 * 0.9;
    return geoMercator()
      .center([127, 26.2])
      .scale(okinawaScale)
      .translate([dimensions.width * 0.3, dimensions.height * 0.15]);
  }, [dimensions.width, dimensions.height]);

  const mainPathGenerator = useMemo(() => {
    return geoPath().projection(mainProjection);
  }, [mainProjection]);

  const okinawaPathGenerator = useMemo(() => {
    return geoPath().projection(okinawaProjection);
  }, [okinawaProjection]);

  return {
    mainProjection,
    okinawaProjection,
    mainPathGenerator,
    okinawaPathGenerator,
  };
}
