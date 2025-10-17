type PopulationStatsProps = {
  selectedCount: number;
  totalPopulation: number;
};

export function PopulationStats({
  selectedCount,
  totalPopulation,
}: PopulationStatsProps) {
  const formattedPopulation = totalPopulation.toLocaleString("ja-JP");

  return (
    <div className="flex gap-6 text-sm">
      <div>
        <span className="text-base-color-600">選択中:</span>{" "}
        <span className="font-semibold">{selectedCount}件</span>
      </div>
      <div>
        <span className="text-base-color-600">合計人口:</span>{" "}
        <span className="font-semibold">{formattedPopulation}人</span>
      </div>
    </div>
  );
}
