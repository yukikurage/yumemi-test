"use client";

import { useEffect, useState, useMemo, useRef, useCallback, memo } from "react";
import type { components } from "@/generated/api";
import { useMapProjections } from "@/hooks/useMapProjections";
import { usePopulationColorMap } from "@/hooks/usePopulationColorMap";
import { useMapZoom } from "@/hooks/useMapZoom";
import { useMapData } from "@/hooks/useMapData";
import { MapPrefecturePath } from "@/components/map/MapPrefecturePath";
import { ColorLegend } from "@/components/map/ColorLegend";

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
  hasSelection: boolean;
  mobileGraphState: "hidden" | "compact" | "expanded";
};

export const JapanMap = memo(function JapanMap({
  prefectures,
  selectedPrefCodes,
  onPrefectureClick,
  allPopulationData,
  hasSelection,
  mobileGraphState,
}: JapanMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

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

  // ViewBoxを更新する関数 (useMapZoomフックから呼ばれる)
  const updateViewBox = useCallback(
    (currentZoom: number, currentPan: { x: number; y: number }) => {
      if (!svgRef.current || !dimensions) return;

      const baseWidth = dimensions.width;
      const baseHeight = dimensions.height;
      const scaledWidth = baseWidth / currentZoom;
      const scaledHeight = baseHeight / currentZoom;

      // パンの制限：x1の端が最大
      const maxPanX = baseWidth - scaledWidth;
      const maxPanY = baseHeight - scaledHeight;
      const clampedPanX = Math.max(0, Math.min(currentPan.x, maxPanX));
      const clampedPanY = Math.max(0, Math.min(currentPan.y, maxPanY));

      const viewBoxValue = `${clampedPanX} ${clampedPanY} ${scaledWidth} ${scaledHeight}`;
      svgRef.current.setAttribute("viewBox", viewBoxValue);
    },
    [dimensions]
  );

  // カスタムフックで TopoJSON データを読み込む
  const geoData = useMapData();

  // カスタムフックでズーム/パン機能を取得
  const {
    zoom,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setOffset,
  } = useMapZoom(dimensions || { width: 1600, height: 900 }, updateViewBox);

  // カスタムフックで投影設定を取得
  const { mainPathGenerator, okinawaPathGenerator } = useMapProjections(
    dimensions || { width: 1600, height: 900 }
  );

  // 都道府県名から都道府県コードを取得するマップ
  const nameToCodeMap = useMemo(() => {
    const map = new Map<string, number>();
    prefectures.forEach((pref) => {
      map.set(pref.prefName, pref.prefCode);
    });
    return map;
  }, [prefectures]);

  // カスタムフックで人口データから色を計算
  const {
    populationColorMap,
    minPopulation,
    maxPopulation,
    getColorFromRatio,
  } = usePopulationColorMap(allPopulationData, "total");

  // グラフエリアが開いたときに地図をずらす
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    // デスクトップ: グラフが表示されたら左にずらす（固定ピクセル）
    if (hasSelection && isDesktop) {
      setOffset({ x: 150, y: 0 }); // 150px左にずらす
    }
    // モバイル: グラフが表示されたら上にずらす（固定ピクセル）
    else if (mobileGraphState !== "hidden" && !isDesktop) {
      setOffset({ x: 0, y: 100 }); // 100px上にずらす
    }
    // グラフが非表示になったらオフセットを解除
    else {
      setOffset({ x: 0, y: 0 });
    }
  }, [hasSelection, mobileGraphState, setOffset]);

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

  // 沖縄ラベルの位置（アスペクト比に応じて調整）
  const okinawaLabelPos = useMemo(() => {
    if (!dimensions) return { x: 0, y: 0 };
    const aspectRatio = dimensions.width / dimensions.height;

    // useMapProjectionsと同じロジックで計算
    const minAspect = 0.7;
    const maxAspect = 1.5;
    const minXRatio = 0.15;
    const maxXRatio = 0.3;

    const clampedAspect = Math.max(minAspect, Math.min(maxAspect, aspectRatio));
    const xRatio =
      minXRatio +
      ((clampedAspect - minAspect) / (maxAspect - minAspect)) *
        (maxXRatio - minXRatio);

    return {
      x: dimensions.width * xRatio,
      y: dimensions.height * 0.2,
    };
  }, [dimensions]);

  // dimensionsが初期化されていない場合は早期リターン
  if (!dimensions) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center text-primary relative overflow-hidden"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center text-primary relative overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {/* 色の凡例 */}
      <ColorLegend
        minPopulation={minPopulation}
        maxPopulation={maxPopulation}
        getColorFromRatio={getColorFromRatio}
      />

      <svg
        ref={svgRef}
        className={`w-full h-full ${
          isDragging
            ? "cursor-grabbing"
            : zoom.current > 1
              ? "cursor-grab"
              : "cursor-default"
        }`}
        onWheel={(e) => handleWheel(e, svgRef.current!)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={(e) => handleTouchMove(e, svgRef.current!)}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: "none" }}
        role="img"
        aria-label="日本地図 - 都道府県を選択できます"
      >
        {/* メインの都道府県（沖縄除く） */}
        <g className="main-prefectures">
          {mainPrefectures.map((d, i) => {
            const prefName = d.properties.nam_ja;
            const prefCode = nameToCodeMap.get(prefName);
            const isSelected = prefCode
              ? selectedPrefCodes.has(prefCode)
              : false;
            const fillColor =
              prefCode && !isSelected
                ? populationColorMap.get(prefCode) || "#e5e7eb"
                : isSelected
                  ? "currentColor"
                  : "#e5e7eb";

            return (
              <MapPrefecturePath
                key={`main-${i}`}
                feature={d as never}
                index={i}
                pathGenerator={mainPathGenerator}
                fillColor={fillColor}
                onPrefectureClick={handlePrefectureClick}
              />
            );
          })}
        </g>

        {/* 斜め線で区切る（右上から左下へ、45度に近づける） */}
        <line
          x1={dimensions.width * 0.5}
          y1={dimensions.height * 0.12}
          x2={dimensions.width * 0.4}
          y2={dimensions.height * 0.36}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="8,4"
          vectorEffect="non-scaling-stroke"
        />

        {/* 沖縄県（斜め線の左上側に配置） */}
        {okinawa && (
          <g className="okinawa-section">
            <MapPrefecturePath
              feature={okinawa as never}
              index={0}
              pathGenerator={okinawaPathGenerator}
              fillColor={
                selectedPrefCodes.has(47)
                  ? "currentColor"
                  : populationColorMap.get(47) || "#e5e7eb"
              }
              onPrefectureClick={handlePrefectureClick}
            />

            {/* 沖縄県ラベル */}
            <text
              x={okinawaLabelPos.x}
              y={okinawaLabelPos.y}
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
    </div>
  );
});
