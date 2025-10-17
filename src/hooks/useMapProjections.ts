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
      .translate([dimensions.width * 0.44, dimensions.height * 0.43]);
  }, [dimensions.width, dimensions.height]);

  // 沖縄用の投影設定（左上に表示、アスペクト比に応じて位置調整）
  const okinawaProjection = useMemo(() => {
    const aspectRatio = dimensions.width / dimensions.height;
    const okinawaScale =
      Math.min(dimensions.width, dimensions.height) * 3.5 * 0.9;

    // アスペクト比に応じて沖縄のX位置をスムーズに調整
    // aspectRatio = 0.7 (縦長) → xRatio = 0.15
    // aspectRatio = 1.5 (横長) → xRatio = 0.3
    // 線形補間でスムーズに変化
    const minAspect = 0.7;
    const maxAspect = 1.5;
    const minXRatio = 0.1;
    const maxXRatio = 0.3;

    const clampedAspect = Math.max(minAspect, Math.min(maxAspect, aspectRatio));
    const xRatio =
      minXRatio +
      ((clampedAspect - minAspect) / (maxAspect - minAspect)) *
        (maxXRatio - minXRatio);

    const translateX = dimensions.width * xRatio;
    const translateY = dimensions.height * 0.15;

    return geoMercator()
      .center([123, 26.2])
      .scale(okinawaScale)
      .translate([translateX, translateY]);
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
