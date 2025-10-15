import type { components } from "@/generated/api";
import { PopulationChart } from "./PopulationChart";
import type { AllPopulationData } from "./PopulationPage";

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
      className="hidden lg:block absolute right-4 top-4 rounded-md bg-white/90 backdrop-blur-sm p-8 border border-neutral-200 max-w-2xl transition-opacity duration-500 overflow-auto"
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
