import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import type { components } from "@/generated/api";
import { PopulationChart } from "./PopulationChart";
import type { AllPopulationData } from "./PopulationPage";

type Prefecture = components["schemas"]["Prefecture"];

type MobileGraphState = "hidden" | "compact" | "expanded";

type MobileGraphPanelProps = {
  mobileGraphState: MobileGraphState;
  setMobileGraphState: (state: MobileGraphState) => void;
  prefectures: Prefecture[];
  populationData: Map<number, AllPopulationData>;
  onRemovePrefecture: (prefCode: number) => void;
};

export function MobileGraphPanel({
  mobileGraphState,
  setMobileGraphState,
  prefectures,
  populationData,
  onRemovePrefecture,
}: MobileGraphPanelProps) {
  if (mobileGraphState === "hidden") {
    return null;
  }

  return (
    <div
      className="lg:hidden fixed left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-10 overflow-auto transition-all duration-300 rounded-t-4xl"
      style={{
        bottom: 0,
        top:
          mobileGraphState === "expanded"
            ? "calc(64px + 200px)"
            : "calc(100dvh - 280px)",
      }}
    >
      <div className="flex items-center justify-center sticky top-0 z-10 w-full">
        <button
          onClick={() => {
            if (mobileGraphState === "compact") {
              setMobileGraphState("expanded");
            } else if (mobileGraphState === "expanded") {
              setMobileGraphState("hidden");
            }
          }}
          className="w-full py-3 border-b border-neutral-100 bg-white/90 backdrop-blur-sm text-xs text-neutral-500 flex justify-center items-center"
          aria-label={
            mobileGraphState === "compact" ? "詳細を展開" : "詳細を閉じる"
          }
        >
          {mobileGraphState === "compact" ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="relative p-4">
        <PopulationChart
          prefectures={prefectures}
          populationData={populationData}
          onRemovePrefecture={onRemovePrefecture}
          compact={mobileGraphState === "compact"}
        />
      </div>
    </div>
  );
}
