"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { memo, useMemo, useState, useCallback } from "react";
import type { components } from "@/generated/api";
import { getRandomColorFromNumber } from "@/lib/getRandomColorFromNumber";
import { PrefectureChip } from "./PrefectureChip";
import { AgeGroupSelector, type AgeGroup } from "./AgeGroupSelector";
import { PopulationStats } from "./PopulationStats";
import { PopulationTable } from "./PopulationTable";
import type { AllPopulationData } from "./PopulationPage";

type Prefecture = components["schemas"]["Prefecture"];

export const PopulationChart = memo(function PopulationChart({
  prefectures,
  populationData,
  onRemovePrefecture,
  compact = false,
}: {
  prefectures: Prefecture[];
  populationData: Map<number, AllPopulationData>;
  onRemovePrefecture: (prefCode: number) => void;
  compact?: boolean;
}) {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>("total");

  const populationDataValues = useMemo(
    () => [...populationData.values()],
    [populationData]
  );

  const selectedPrefectures = useMemo(() => {
    return Array.from(populationData.keys())
      .map((prefCode) => prefectures.find((p) => p.prefCode === prefCode))
      .filter((p): p is Prefecture => p !== undefined);
  }, [populationData, prefectures]);

  // 都道府県コード→都道府県名のマップ（レンダリング最適化用）
  const prefCodeToNameMap = useMemo(() => {
    const map = new Map<number, string>();
    prefectures.forEach((pref) => {
      map.set(pref.prefCode, pref.prefName);
    });
    return map;
  }, [prefectures]);

  // 年齢層に応じたデータを取得
  const getDataByAgeGroup = useCallback(
    (data: AllPopulationData) => {
      switch (selectedAgeGroup) {
        case "youth":
          return data.youthPopulation;
        case "working":
          return data.workingAgePopulation;
        case "elderly":
          return data.elderlyPopulation;
        default:
          return data.totalPopulation;
      }
    },
    [selectedAgeGroup]
  );

  // boundaryYearを取得（最小値を使用）
  const boundaryYear = useMemo(() => {
    if (populationDataValues.length === 0) return null;
    return Math.min(...populationDataValues.map((data) => data.boundaryYear));
  }, [populationDataValues]);

  // グラフ用のデータを整形
  const chartData = useMemo(() => {
    // 各都道府県のデータを事前に変換（年→値のマップを作成）
    const prefDataMaps = populationDataValues.map((prefData) => {
      const ageData = getDataByAgeGroup(prefData);
      const yearMap = new Map<number, number>();
      ageData.forEach((d) => {
        yearMap.set(d.year, d.value);
      });
      return {
        prefCode: prefData.prefCode.toString(),
        yearMap,
      };
    });

    // すべての年を収集
    const yearSet = new Set<number>();
    prefDataMaps.forEach(({ yearMap }) => {
      yearMap.forEach((_, year) => yearSet.add(year));
    });

    const years = Array.from(yearSet).sort((a, b) => a - b);

    // 各年のデータポイントを作成
    return years.map((year) => {
      const dataPoint: Record<string, number> = { year };

      prefDataMaps.forEach(({ prefCode, yearMap }) => {
        const value = yearMap.get(year);
        if (value !== undefined) {
          if (year === boundaryYear) {
            dataPoint[`${prefCode}_before`] = value;
            dataPoint[`${prefCode}_after`] = value;
          } else if (!boundaryYear || year < boundaryYear) {
            dataPoint[`${prefCode}_before`] = value;
          } else {
            dataPoint[`${prefCode}_after`] = value;
          }
        }
      });

      return dataPoint;
    });
  }, [populationDataValues, getDataByAgeGroup, boundaryYear]);

  // 統計情報の計算
  const stats = useMemo(() => {
    const latestData = populationDataValues.map((data) => {
      const ageData = getDataByAgeGroup(data);
      return ageData[ageData.length - 1]?.value || 0;
    });
    const totalPopulation = latestData.reduce((sum, val) => sum + val, 0);

    return {
      selectedCount: populationDataValues.length,
      totalPopulation,
    };
  }, [getDataByAgeGroup, populationDataValues]);

  return (
    <div className="flex flex-col h-fit gap-4">
      {/* 選択中の県のチップ表示 */}
      <div
        className={`flex gap-2 ${compact ? "overflow-x-auto" : "flex-wrap"}`}
      >
        {selectedPrefectures.map((pref) => (
          <PrefectureChip
            key={pref.prefCode}
            prefecture={pref}
            onRemove={() => onRemovePrefecture(pref.prefCode)}
          />
        ))}
      </div>

      {/* 年齢層選択UI */}
      <div style={{ display: compact ? "none" : "block" }}>
        <AgeGroupSelector
          selected={selectedAgeGroup}
          onChange={setSelectedAgeGroup}
        />
      </div>

      {/* グラフ */}
      <div className="flex-shrink-0">
        <ResponsiveContainer width="100%" height={compact ? 200 : 280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{
                value: "年",
                position: "insideBottomRight",
                offset: -5,
              }}
            />
            <YAxis
              label={{
                value: "人口",
                angle: -90,
                position: "insideLeft",
                offset: 2,
              }}
              tickFormatter={(value) =>
                value >= 10000 ? `${(value / 10000).toFixed(0)}万` : value
              }
            />
            <Tooltip />
            <Legend />
            {populationDataValues.flatMap((data, i) => {
              const prefName = prefCodeToNameMap.get(data.prefCode);
              const color = getRandomColorFromNumber(i);
              const prefCode = data.prefCode.toString();

              return [
                // boundary year以前の実線
                <Line
                  isAnimationActive={false}
                  key={`${prefCode}_before`}
                  type="linear"
                  dataKey={`${prefCode}_before`}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  name={prefName}
                  legendType="line"
                />,
                // boundary year以降の点線
                <Line
                  isAnimationActive={false}
                  key={`${prefCode}_after`}
                  type="linear"
                  dataKey={`${prefCode}_after`}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls={false}
                  name={prefName}
                  legendType="none"
                  hide={false}
                />,
              ];
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 統計情報 */}
      <div
        className="flex-shrink-0"
        style={{ display: compact ? "none" : "block" }}
      >
        <PopulationStats
          selectedCount={stats.selectedCount}
          totalPopulation={stats.totalPopulation}
        />
      </div>

      {/* 人口データテーブル */}
      <div
        className="flex-1 overflow-hidden"
        style={{ display: compact ? "none" : "block" }}
      >
        <PopulationTable
          prefectures={prefectures}
          populationData={populationData}
        />
      </div>
    </div>
  );
});
