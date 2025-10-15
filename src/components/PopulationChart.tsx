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

  // 年齢層に応じたデータを取得
  const getDataByAgeGroup = (data: AllPopulationData) => {
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
  };

  // グラフ用のデータを整形
  const chartData: Record<string | number, number>[] = useMemo(() => {
    const yearSet = new Set<number>();
    populationDataValues.forEach((data) => {
      getDataByAgeGroup(data).forEach((d) => yearSet.add(d.year));
    });

    const years = Array.from(yearSet).sort((a, b) => a - b);
    return years.map((year) => {
      return Object.fromEntries(
        populationDataValues
          .map((prefData) => {
            const ageData = getDataByAgeGroup(prefData);
            const yearData = ageData.find((d) => d.year === year);
            return [
              prefData.prefCode.toString(),
              yearData ? yearData.value : 0,
            ];
          })
          .concat([["year", year]])
      );
    });
  }, [populationDataValues, selectedAgeGroup]);

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
  }, [populationDataValues, selectedAgeGroup]);

  return (
    <div className="flex flex-col h-fit gap-4">
      {/* 選択中の県のチップ表示 */}
      <div
        className="flex flex-wrap gap-2"
        style={{ display: compact ? "none" : "flex" }}
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
            {populationDataValues.map((data, i) => {
              return (
                <Line
                  key={data.prefCode}
                  type="linear"
                  dataKey={data.prefCode.toString()}
                  stroke={getRandomColorFromNumber(i)}
                  strokeWidth={2}
                  dot={true}
                  name={
                    prefectures.find((p) => p.prefCode === data.prefCode)
                      ?.prefName
                  }
                />
              );
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
