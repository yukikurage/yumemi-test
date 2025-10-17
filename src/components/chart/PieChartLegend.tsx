export function PieChartLegend() {
  const legendItems = [
    { color: "#3b82f6", label: "年少人口" },
    { color: "#10b981", label: "生産年齢人口" },
    { color: "#f59e0b", label: "老年人口" },
  ];

  return (
    <div className="flex items-center gap-4 bg-white/92 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-200 ">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-slate-700 font-medium">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
