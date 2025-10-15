import type { RefObject } from "react";
import type { components } from "@/generated/api";
import { SearchInput } from "./SearchInput";
import { PieChartLegend } from "./PieChartLegend";
import { PrefectureSelection } from "./PrefectureSelection";
import type { AllPopulationData } from "./PopulationPage";

type Prefecture = components["schemas"]["Prefecture"];

type PrefectureSelectionPanelProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPrefectures: Prefecture[];
  allPopulationData: AllPopulationData[];
  onChange: (pref: Prefecture, selected: boolean) => void;
  selectedPrefs: Set<number>;
  scrollRef?: RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
  mobileBottom?: string;
  mobileTop?: string;
};

export function PrefectureSelectionPanel({
  searchQuery,
  setSearchQuery,
  filteredPrefectures,
  allPopulationData,
  onChange,
  selectedPrefs,
  scrollRef,
  isMobile = false,
  mobileBottom,
  mobileTop,
}: PrefectureSelectionPanelProps) {
  if (isMobile) {
    return (
      <div
        className="lg:hidden fixed left-0 right-0 h-fit flex flex-col gap-3 items-start justify-end transition-all duration-300"
        style={{
          bottom: mobileBottom,
          top: mobileTop,
        }}
      >
        <div className="w-full px-4 pt-4 h-fit flex flex-col items-stretch gap-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          <PieChartLegend />
        </div>
        <div className="w-full h-fit overflow-auto">
          <div className="px-4 pb-4 h-fit w-fit">
            <PrefectureSelection
              prefectures={filteredPrefectures}
              allPopulationData={allPopulationData}
              onChange={onChange}
              selectedPrefs={selectedPrefs}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex fixed left-0 right-0 bottom-0 h-fit flex-col gap-4 items-start justify-end">
      <div className="w-full px-8 pt-4 h-fit flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4">
        <div className="min-w-full lg:min-w-fit lg:flex-none">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex justify-start lg:flex-none">
          <PieChartLegend />
        </div>
      </div>
      <div className="w-full h-fit overflow-auto" ref={scrollRef}>
        <div className="px-8 pb-8 h-fit w-fit">
          <PrefectureSelection
            prefectures={filteredPrefectures}
            allPopulationData={allPopulationData}
            onChange={onChange}
            selectedPrefs={selectedPrefs}
          />
        </div>
      </div>
    </div>
  );
}
