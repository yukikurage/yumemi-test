"use client";

import { memo, useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";

type PopulationPieChartProps = {
  youth: number; // 年少人口
  workingAge: number; // 生産年齢人口
  elderly: number; // 老年人口
  size?: number; // グラフのサイズ
};

const COLORS = {
  youth: "#3b82f6", // 青
  workingAge: "#10b981", // 緑
  elderly: "#f59e0b", // オレンジ
};

const MemoPie = memo(function MemoPie({
  youth,
  workingAge,
  elderly,
}: {
  youth: number;
  workingAge: number;
  elderly: number;
}) {
  const data = useMemo(
    () => [
      { name: "年少", value: youth },
      { name: "生産", value: workingAge },
      { name: "老年", value: elderly },
    ],
    [youth, workingAge, elderly]
  );

  return (
    <Pie
      isAnimationActive={false}
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={20}
      outerRadius={30}
      fill="#8884d8"
      dataKey="value"
      stroke="none"
    >
      <Cell fill={COLORS.youth} />
      <Cell fill={COLORS.workingAge} />
      <Cell fill={COLORS.elderly} />
    </Pie>
  );
});

export function PopulationPieChart({
  youth,
  workingAge,
  elderly,
  size = 80,
}: PopulationPieChartProps) {
  return (
    <PieChart className="pointer-events-none" width={size} height={size}>
      <MemoPie youth={youth} workingAge={workingAge} elderly={elderly} />
    </PieChart>
  );
}
