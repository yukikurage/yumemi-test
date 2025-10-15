"use client";

import { useEffect, useState, useMemo, useRef, useCallback, memo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { components } from "@/generated/api";

type Prefecture = components["schemas"]["Prefecture"];

type AllPopulationData = {
  prefCode: number;
  boundaryYear: number;
  totalPopulation: { year: number; value: number; rate?: number }[];
  youthPopulation: { year: number; value: number; rate?: number }[];
  workingAgePopulation: { year: number; value: number; rate?: number }[];
  elderlyPopulation: { year: number; value: number; rate?: number }[];
};

type JapanMapProps = {
  prefectures: Prefecture[];
  selectedPrefCodes: Set<number>;
  onPrefectureClick: (prefCode: number) => void;
  allPopulationData: AllPopulationData[];
};

type PrefectureProperties = {
  nam: string;
  nam_ja: string;
  id: number;
};

type PrefectureFeature = Feature<Geometry, PrefectureProperties>;

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

export const JapanMap = memo(function JapanMap({
  prefectures,
  selectedPrefCodes,
  onPrefectureClick,
  allPopulationData,
}: JapanMapProps) {
  const [geoData, setGeoData] = useState<PrefectureFeature[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1600, height: 900 });

  // ズームとパンの状態（refで管理してReactの再レンダリングを避ける）
  const zoom = useRef(1);
  const pan = useRef({ x: 0, y: 0 });
  const targetZoom = useRef(1);
  const targetPan = useRef({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrame = useRef<number | null>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // タッチ操作用の状態
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  // インジケーターの位置を更新
  const updateIndicator = useCallback(() => {
    if (!indicatorRef.current) return;
    const position = ((zoom.current - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;
    indicatorRef.current.style.top = `${position}%`;
  }, []);

  // コンテナのサイズを取得
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // ViewBoxを更新する関数
  const updateViewBox = useCallback(() => {
    if (!svgRef.current) return;

    const baseWidth = dimensions.width;
    const baseHeight = dimensions.height;
    const scaledWidth = baseWidth / zoom.current;
    const scaledHeight = baseHeight / zoom.current;

    // パンの制限：x1の端が最大
    const maxPanX = baseWidth - scaledWidth;
    const maxPanY = baseHeight - scaledHeight;
    const clampedPanX = Math.max(0, Math.min(pan.current.x, maxPanX));
    const clampedPanY = Math.max(0, Math.min(pan.current.y, maxPanY));

    const viewBoxValue = `${clampedPanX} ${clampedPanY} ${scaledWidth} ${scaledHeight}`;
    svgRef.current.setAttribute("viewBox", viewBoxValue);

    // インジケーターも更新
    updateIndicator();
  }, [dimensions, updateIndicator]);

  // 初期viewBoxを設定
  useEffect(() => {
    updateViewBox();
  }, [dimensions, updateViewBox]);

  // TopoJSONファイルを読み込む
  useEffect(() => {
    fetch("/japan.topojson")
      .then((response) => {
        if (response.status !== 200) {
          console.error(`TopoJSON load error: ${response.status}`);
          return;
        }
        return response.json();
      })
      .then((json) => {
        const worldData = json as Topology;
        if (worldData && worldData.objects.japan) {
          const features = feature(
            worldData,
            worldData.objects.japan as GeometryCollection
          ) as FeatureCollection<Geometry, PrefectureProperties>;
          setGeoData(features.features);
        }
      })
      .catch((error) => {
        console.error("Failed to load TopoJSON:", error);
      });
  }, []);

  // メイン地図の投影設定（沖縄除く）
  const mainProjection = useMemo(() => {
    // 画面の幅に応じてスケールを調整（0.9倍に縮小）
    const baseScale = Math.min(dimensions.width, dimensions.height) * 2.5 * 0.9;
    return geoMercator()
      .center([135, 38]) // 日本の中心座標
      .scale(baseScale)
      .translate([dimensions.width * 0.45, dimensions.height * 0.42]);
  }, [dimensions.width, dimensions.height]);

  // 沖縄用の投影設定（左上に表示）
  const okinawaProjection = useMemo(() => {
    const okinawaScale =
      Math.min(dimensions.width, dimensions.height) * 3.5 * 0.9;
    return geoMercator()
      .center([127, 26.2]) // 沖縄の中心座標
      .scale(okinawaScale)
      .translate([dimensions.width * 0.3, dimensions.height * 0.15]);
  }, [dimensions.width, dimensions.height]);

  const mainPathGenerator = useMemo(() => {
    return geoPath().projection(mainProjection);
  }, [mainProjection]);

  const okinawaPathGenerator = useMemo(() => {
    return geoPath().projection(okinawaProjection);
  }, [okinawaProjection]);

  // 都道府県名から都道府県コードを取得するマップ
  const nameToCodeMap = useMemo(() => {
    const map = new Map<string, number>();
    prefectures.forEach((pref) => {
      map.set(pref.prefName, pref.prefCode);
    });
    return map;
  }, [prefectures]);

  // 人口データから色を計算（boundaryYearの値を使用）
  const populationColorMap = useMemo(() => {
    const map = new Map<number, string>();

    // boundaryYearの人口データを取得
    const populations = allPopulationData.map((data) => {
      const targetData = data.totalPopulation.find(
        (d) => d.year === data.boundaryYear
      );
      return { prefCode: data.prefCode, population: targetData?.value || 0 };
    });

    // 最大・最小人口を取得
    const maxPopulation = Math.max(...populations.map((p) => p.population));
    const minPopulation = Math.min(...populations.map((p) => p.population));

    // 各都道府県の色を計算（緑のグラデーション）
    populations.forEach(({ prefCode, population }) => {
      const ratio =
        (population - minPopulation) / (maxPopulation - minPopulation);
      // 薄い緑から濃い緑へのグラデーション
      const lightness = 85 - ratio * 45; // 85% -> 40%
      map.set(prefCode, `hsl(140, 60%, ${lightness}%)`);
    });

    return map;
  }, [allPopulationData]);

  const handlePrefectureClick = (prefName: string) => {
    const prefCode = nameToCodeMap.get(prefName);
    if (prefCode) {
      onPrefectureClick(prefCode);
    }
  };

  // 沖縄とその他の都道府県を分離
  const { okinawa, mainPrefectures } = useMemo(() => {
    const okinawa = geoData.find((d) => d.properties.nam_ja === "沖縄県");
    const mainPrefectures = geoData.filter(
      (d) => d.properties.nam_ja !== "沖縄県"
    );
    return { okinawa, mainPrefectures };
  }, [geoData]);

  // マウスホイールでズーム（マウス位置を基準に）
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();

    if (!svgRef.current) return;

    // ズーム速度を上げる（0.8/1.2 -> より速い変化）
    const delta = e.deltaY > 0 ? 0.8 : 1.2;
    const currentZoom = targetZoom.current;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom * delta));

    // SVG座標系でのマウス位置を取得
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // SVG座標系での相対位置（0-1）
    const relX = mouseX / rect.width;
    const relY = mouseY / rect.height;

    // 現在のviewBox
    const currentWidth = dimensions.width / currentZoom;
    const currentHeight = dimensions.height / currentZoom;
    const newWidth = dimensions.width / newZoom;
    const newHeight = dimensions.height / newZoom;

    // マウス位置を基準にパンを調整
    const currentPan = targetPan.current;
    const newPanX = currentPan.x + (currentWidth - newWidth) * relX;
    const newPanY = currentPan.y + (currentHeight - newHeight) * relY;

    // ターゲット値を更新
    targetZoom.current = newZoom;
    targetPan.current = { x: newPanX, y: newPanY };

    // アニメーションが実行中でなければ開始
    if (animationFrame.current === null) {
      const smoothAnimate = () => {
        const zoomDiff = targetZoom.current - zoom.current;
        const panDiffX = targetPan.current.x - pan.current.x;
        const panDiffY = targetPan.current.y - pan.current.y;

        // 十分近ければアニメーション終了
        if (
          Math.abs(zoomDiff) < 0.001 &&
          Math.abs(panDiffX) < 0.5 &&
          Math.abs(panDiffY) < 0.5
        ) {
          zoom.current = targetZoom.current;
          pan.current = targetPan.current;
          animationFrame.current = null;
          updateViewBox();
          return;
        }

        // イージング（0.15 = 減速の度合い）
        zoom.current += zoomDiff * 0.15;
        pan.current = {
          x: pan.current.x + panDiffX * 0.15,
          y: pan.current.y + panDiffY * 0.15,
        };

        updateViewBox();
        animationFrame.current = requestAnimationFrame(smoothAnimate);
      };
      animationFrame.current = requestAnimationFrame(smoothAnimate);
    }
  };

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (zoom.current <= 1) return; // x1では移動できない
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  // ドラッグ中
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || zoom.current <= 1) return;
    e.preventDefault();

    const dx = (dragStart.current.x - e.clientX) / targetZoom.current;
    const dy = (dragStart.current.y - e.clientY) / targetZoom.current;

    // ターゲット値を更新
    targetPan.current = {
      x: targetPan.current.x + dx,
      y: targetPan.current.y + dy,
    };

    dragStart.current = { x: e.clientX, y: e.clientY };

    // アニメーションが実行中でなければ開始
    if (animationFrame.current === null) {
      const smoothAnimate = () => {
        const zoomDiff = targetZoom.current - zoom.current;
        const panDiffX = targetPan.current.x - pan.current.x;
        const panDiffY = targetPan.current.y - pan.current.y;

        if (
          Math.abs(zoomDiff) < 0.001 &&
          Math.abs(panDiffX) < 0.5 &&
          Math.abs(panDiffY) < 0.5
        ) {
          zoom.current = targetZoom.current;
          pan.current = targetPan.current;
          animationFrame.current = null;
          updateViewBox();
          return;
        }

        zoom.current += zoomDiff * 0.15;
        pan.current = {
          x: pan.current.x + panDiffX * 0.15,
          y: pan.current.y + panDiffY * 0.15,
        };

        updateViewBox();
        animationFrame.current = requestAnimationFrame(smoothAnimate);
      };
      animationFrame.current = requestAnimationFrame(smoothAnimate);
    }
  };

  // ドラッグ終了
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // タッチ開始
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      // シングルタッチ：ドラッグ開始
      if (zoom.current <= 1) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      // ダブルタッチ：ピンチズーム準備
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistance.current = distance;
      lastTouchCenter.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
    }
  };

  // タッチ移動
  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging && zoom.current > 1) {
      // シングルタッチ：ドラッグ
      const dx =
        (dragStart.current.x - e.touches[0].clientX) / targetZoom.current;
      const dy =
        (dragStart.current.y - e.touches[0].clientY) / targetZoom.current;

      targetPan.current = {
        x: targetPan.current.x + dx,
        y: targetPan.current.y + dy,
      };

      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      if (animationFrame.current === null) {
        const smoothAnimate = () => {
          const zoomDiff = targetZoom.current - zoom.current;
          const panDiffX = targetPan.current.x - pan.current.x;
          const panDiffY = targetPan.current.y - pan.current.y;

          if (
            Math.abs(zoomDiff) < 0.001 &&
            Math.abs(panDiffX) < 0.5 &&
            Math.abs(panDiffY) < 0.5
          ) {
            zoom.current = targetZoom.current;
            pan.current = targetPan.current;
            animationFrame.current = null;
            updateViewBox();
            return;
          }

          zoom.current += zoomDiff * 0.15;
          pan.current = {
            x: pan.current.x + panDiffX * 0.15,
            y: pan.current.y + panDiffY * 0.15,
          };

          updateViewBox();
          animationFrame.current = requestAnimationFrame(smoothAnimate);
        };
        animationFrame.current = requestAnimationFrame(smoothAnimate);
      }
    } else if (e.touches.length === 2) {
      // ダブルタッチ：ピンチズーム
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };

      if (
        lastTouchDistance.current &&
        lastTouchCenter.current &&
        svgRef.current
      ) {
        const scale = distance / lastTouchDistance.current;
        const currentZoom = targetZoom.current;
        const newZoom = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, currentZoom * scale)
        );

        // 中心点を基準にズーム
        const rect = svgRef.current.getBoundingClientRect();
        const relX = center.x / rect.width;
        const relY = center.y / rect.height;

        const currentWidth = dimensions.width / currentZoom;
        const currentHeight = dimensions.height / currentZoom;
        const newWidth = dimensions.width / newZoom;
        const newHeight = dimensions.height / newZoom;

        const currentPan = targetPan.current;
        const newPanX = currentPan.x + (currentWidth - newWidth) * relX;
        const newPanY = currentPan.y + (currentHeight - newHeight) * relY;

        targetZoom.current = newZoom;
        targetPan.current = { x: newPanX, y: newPanY };

        if (animationFrame.current === null) {
          const smoothAnimate = () => {
            const zoomDiff = targetZoom.current - zoom.current;
            const panDiffX = targetPan.current.x - pan.current.x;
            const panDiffY = targetPan.current.y - pan.current.y;

            if (
              Math.abs(zoomDiff) < 0.001 &&
              Math.abs(panDiffX) < 0.5 &&
              Math.abs(panDiffY) < 0.5
            ) {
              zoom.current = targetZoom.current;
              pan.current = targetPan.current;
              animationFrame.current = null;
              updateViewBox();
              return;
            }

            zoom.current += zoomDiff * 0.15;
            pan.current = {
              x: pan.current.x + panDiffX * 0.15,
              y: pan.current.y + panDiffY * 0.15,
            };

            updateViewBox();
            animationFrame.current = requestAnimationFrame(smoothAnimate);
          };
          animationFrame.current = requestAnimationFrame(smoothAnimate);
        }
      }

      lastTouchDistance.current = distance;
      lastTouchCenter.current = center;
    }
  };

  // タッチ終了
  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistance.current = null;
    lastTouchCenter.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center text-primary relative overflow-hidden"
    >
      <svg
        ref={svgRef}
        className={`w-full h-full ${
          isDragging
            ? "cursor-grabbing"
            : zoom.current > 1
            ? "cursor-grab"
            : "cursor-default"
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: "none" }}
      >
        {/* メインの都道府県（沖縄除く） */}
        <g className="main-prefectures">
          {mainPrefectures.map((d, i) => {
            const prefName = d.properties.nam_ja;
            const prefCode = nameToCodeMap.get(prefName);
            const isSelected = prefCode
              ? selectedPrefCodes.has(prefCode)
              : false;
            const pathData = mainPathGenerator(d);
            const fillColor =
              prefCode && !isSelected
                ? populationColorMap.get(prefCode) || "#e5e7eb"
                : isSelected
                ? "currentColor"
                : "#e5e7eb";

            return (
              <path
                key={`main-${i}`}
                d={pathData || undefined}
                className="prefecture cursor-pointer transition-all duration-200 hover:opacity-50"
                fill={fillColor}
                stroke="#ffffff"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                onClick={() => handlePrefectureClick(prefName)}
              >
                <title>{prefName}</title>
              </path>
            );
          })}
        </g>

        {/* 斜め線で区切る（右上から左下へ、45度に近づける） */}
        <line
          x1={dimensions.width * 0.44}
          y1={dimensions.height * 0.12}
          x2={dimensions.width * 0.32}
          y2={dimensions.height * 0.36}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="8,4"
        />

        {/* 沖縄県（斜め線の左上側に配置） */}
        {okinawa && (
          <g className="okinawa-section">
            <path
              d={okinawaPathGenerator(okinawa) || undefined}
              className="prefecture cursor-pointer transition-all duration-200 hover:opacity-50"
              fill={
                selectedPrefCodes.has(47)
                  ? "currentColor"
                  : populationColorMap.get(47) || "#e5e7eb"
              }
              stroke="#ffffff"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              onClick={() => handlePrefectureClick("沖縄県")}
            >
              <title>沖縄県</title>
            </path>

            {/* 沖縄県ラベル */}
            <text
              x={dimensions.width * 0.2}
              y={dimensions.height * 0.2}
              textAnchor="middle"
              fontSize={14}
              fill="#64748b"
              fontWeight="500"
            >
              沖縄県
            </text>
          </g>
        )}
      </svg>
      {/* ズームレベルインジケーター */}
      <div className="absolute left-4 top-4 flex flex-col items-center gap-2">
        <div className="relative h-64 w-1 bg-gray-300 rounded-full">
          {/* ズームレベルの円 */}
          <div
            ref={indicatorRef}
            className="absolute w-4 h-4 bg-primary rounded-full -left-1.5"
            style={{
              top: `${
                ((zoom.current - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
              }%`,
              transform: "translateY(-50%)",
            }}
          />
        </div>
      </div>
    </div>
  );
});
