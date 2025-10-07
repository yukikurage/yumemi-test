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
import { PrefecturePopulationData } from "@/app/actions";
import type { components } from "@/generated/api";
import { getRandomColorFromNumber } from "@/lib/getRandomColorFromNumber";

type Prefecture = components["schemas"]["Prefecture"];

export function PopulationChart({
  prefectures,
  selectedPrefs,
  populationData,
}: {
  prefectures: Prefecture[];
  selectedPrefs: Set<number>;
  populationData: Map<number, PrefecturePopulationData>;
}) {
  const populationDataValues = [...populationData.values()];

  // グラフ用のデータを整形
  const chartData: Record<string | number, number>[] = (() => {
    const yearSet = new Set<number>(
      populationDataValues.flatMap(
        (data) => data?.data.map((d) => d.year) ?? []
      )
    );

    const years = Array.from(yearSet).sort((a, b) => a - b);
    return years.map((year) => {
      return Object.fromEntries(
        populationDataValues
          .map((prefData) => {
            const yearData = prefData.data.find((d) => d.year === year);
            return [
              prefData.prefCode.toString(),
              yearData ? yearData.value : 0,
            ];
          })
          .concat([["year", year]])
      );
    });
  })();

  return (
    <ResponsiveContainer width="100%" height={400}>
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
        <YAxis label={{ value: "人口", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        {populationDataValues.map((pref) => {
          return (
            <Line
              key={pref.prefCode}
              type="monotone"
              dataKey={pref.prefCode.toString()}
              stroke={getRandomColorFromNumber(pref.prefCode, "light")}
              strokeWidth={2}
              dot={true}
              name={
                prefectures.find((p) => p.prefCode === pref.prefCode)?.prefName
              }
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
