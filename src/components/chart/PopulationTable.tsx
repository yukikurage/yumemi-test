import type { components } from "@/generated/api";
import type { AllPopulationData } from "@/components/pages/PopulationPage";

type Prefecture = components["schemas"]["Prefecture"];

type PopulationTableProps = {
  prefectures: Prefecture[];
  populationData: Map<number, AllPopulationData>;
};

export function PopulationTable({
  prefectures,
  populationData,
}: PopulationTableProps) {
  const rows = Array.from(populationData.entries())
    .map(([prefCode, data]) => {
      const prefecture = prefectures.find((p) => p.prefCode === prefCode);
      if (!prefecture) return null;

      // boundaryYearのデータを使用
      const boundaryYear = data.boundaryYear;
      const latestYear =
        data.totalPopulation.find((d) => d.year === boundaryYear) ||
        data.totalPopulation[data.totalPopulation.length - 1];
      const latestYouth =
        data.youthPopulation.find((d) => d.year === boundaryYear) ||
        data.youthPopulation[data.youthPopulation.length - 1];
      const latestWorking =
        data.workingAgePopulation.find((d) => d.year === boundaryYear) ||
        data.workingAgePopulation[data.workingAgePopulation.length - 1];
      const latestElderly =
        data.elderlyPopulation.find((d) => d.year === boundaryYear) ||
        data.elderlyPopulation[data.elderlyPopulation.length - 1];

      // 1960年のデータ
      const year1960 = data.totalPopulation.find((d) => d.year === 1960);

      // 増加率を計算
      const growthRate = year1960
        ? ((latestYear.value - year1960.value) / year1960.value) * 100
        : 0;

      return {
        prefecture,
        currentPopulation: latestYear.value,
        youth: latestYouth?.value || 0,
        working: latestWorking?.value || 0,
        elderly: latestElderly?.value || 0,
        population1960: year1960?.value || 0,
        growthRate,
      };
    })
    .filter(Boolean);

  return (
    <div className="overflow-auto max-h-96 border rounded-md border-slate-200">
      <table className="w-full text-sm min-w-max">
        <thead className="bg-slate-50 sticky top-0 font-mediu text-slate-700">
          <tr>
            <th className="px-4 py-2 text-left whitespace-nowrap">都道府県</th>
            <th className="px-4 py-2 text-right whitespace-nowrap">
              現在の人口
            </th>
            <th className="px-4 py-2 text-right whitespace-nowrap">年少</th>
            <th className="px-4 py-2 text-right whitespace-nowrap">生産年齢</th>
            <th className="px-4 py-2 text-right text-slate-700 whitespace-nowrap">
              老年
            </th>
            <th className="px-4 py-2 text-right text-slate-700 whitespace-nowrap">
              1960年
            </th>
            <th className="px-4 py-2 text-right text-slate-700 whitespace-nowrap">
              増加率
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (!row) return null;
            return (
              <tr
                key={row.prefecture.prefCode}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  {row.prefecture.prefName}
                </td>
                <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap">
                  {row.currentPopulation.toLocaleString("ja-JP")}
                </td>
                <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap">
                  {row.youth.toLocaleString("ja-JP")}
                </td>
                <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap">
                  {row.working.toLocaleString("ja-JP")}
                </td>
                <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap">
                  {row.elderly.toLocaleString("ja-JP")}
                </td>
                <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap">
                  {row.population1960.toLocaleString("ja-JP")}
                </td>
                <td
                  className={`px-4 py-2 text-right tabular-nums font-medium whitespace-nowrap ${
                    row.growthRate >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {row.growthRate >= 0 ? "+" : ""}
                  {row.growthRate.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
