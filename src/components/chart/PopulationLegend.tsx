type PopulationLegendProps = {
  minPopulation: number;
  maxPopulation: number;
};

export function PopulationLegend({
  minPopulation,
  maxPopulation,
}: PopulationLegendProps) {
  const formatPopulation = (value: number) => {
    if (value >= 10000000) {
      return `${Math.round(value / 10000000)}千万人`;
    } else if (value >= 10000) {
      return `${Math.round(value / 10000)}万人`;
    }
    return `${value}人`;
  };

  return (
    <div className="flex items-center gap-3 bg-white/92 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
      <span className="text-xs text-slate-600 font-medium">人口</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">
          {formatPopulation(minPopulation)}
        </span>
        <div className="flex h-4 w-32 rounded-sm overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => {
            const ratio = i / 19;
            const lightness = 85 - ratio * 45;
            return (
              <div
                key={i}
                className="flex-1"
                style={{
                  backgroundColor: `hsl(140, 60%, ${lightness}%)`,
                }}
              />
            );
          })}
        </div>
        <span className="text-xs text-slate-500">
          {formatPopulation(maxPopulation)}
        </span>
      </div>
    </div>
  );
}
