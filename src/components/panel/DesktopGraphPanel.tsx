import type { components } from "@/generated/api";
import { PopulationChart } from "@/components/chart/PopulationChart";
import type { AllPopulationData } from "@/components/pages/PopulationPage";

type Prefecture = components["schemas"]["Prefecture"];

type DesktopGraphPanelProps = {
  hasSelection: boolean;
  prefectures: Prefecture[];
  populationData: Map<number, AllPopulationData>;
  onRemovePrefecture: (prefCode: number) => void;
};

export function DesktopGraphPanel({
  hasSelection,
  prefectures,
  populationData,
  onRemovePrefecture,
}: DesktopGraphPanelProps) {
  return (
    <div
      className="hidden xl:block absolute right-4 top-4 rounded-md bg-white p-6 border border-base-color-200 transition-opacity duration-500 overflow-auto w-2xl 2xl:w-3xl"
      style={{
        opacity: hasSelection ? 1 : 0,
        pointerEvents: hasSelection ? "auto" : "none",
        maxHeight: "calc(100vh - 340px)",
      }}
    >
      <PopulationChart
        prefectures={prefectures}
        populationData={populationData}
        onRemovePrefecture={onRemovePrefecture}
      />
    </div>
  );
}
