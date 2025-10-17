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
import { memo, useMemo, useState } from "react";
import type { components } from "@/generated/api";
import { getRandomColorFromNumber } from "@/lib/getRandomColorFromNumber";
import { PrefectureChip } from "@/components/prefecture/PrefectureChip";
import { AgeGroupSelector, type AgeGroup } from "@/components/chart/AgeGroupSelector";
import { PopulationStats } from "@/components/chart/PopulationStats";
import { PopulationTable } from "@/components/chart/PopulationTable";
import type { AllPopulationData } from "@/components/pages/PopulationPage";
import { usePopulationChartData } from "@/hooks/usePopulationChartData";

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

  // データ変換とロジックをカスタムフックに委譲
  const { chartData, stats } = usePopulationChartData(
    populationDataValues,
    selectedAgeGroup
  );

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
