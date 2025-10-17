type ColorLegendProps = {
  minPopulation: number;
  maxPopulation: number;
  getColorFromRatio: (ratio: number) => string;
};

export function ColorLegend({ getColorFromRatio }: ColorLegendProps) {
  // HSL空間で滑らかに補間するための中間色を動的に生成
  // ratio 0.0 (緑) から 1.0 (赤) まで
  const gradientStops = [
    getColorFromRatio(1.0), // 0% - 最大人口（赤）
    getColorFromRatio(0.75), // 25%
    getColorFromRatio(0.5), // 50%
    getColorFromRatio(0.25), // 75%
    getColorFromRatio(0.0), // 100% - 最小人口（緑）
  ];

  return (
    <div
      className="absolute top-24 left-4 flex flex-col items-center gap-2"
      role="figure"
      aria-label="人口の色分け凡例"
    >
      <div
        className="w-4 h-40 rounded-full border border-slate-50"
        style={{
          background: `linear-gradient(to bottom, ${gradientStops.join(", ")})`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
