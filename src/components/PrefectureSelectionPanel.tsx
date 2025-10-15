import type { components } from "@/generated/api";
import { SearchInput } from "./SearchInput";
import { PrefectureSelection } from "./PrefectureSelection";
import type { AllPopulationData } from "./PopulationPage";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { PieChartLegend } from "./PieChartLegend";

type Prefecture = components["schemas"]["Prefecture"];

type PrefectureSelectionPanelProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPrefectures: Prefecture[];
  allPopulationData: AllPopulationData[];
  onChange: (pref: Prefecture, selected: boolean) => void;
  selectedPrefs: Set<number>;
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
  mobileBottom,
  mobileTop,
}: PrefectureSelectionPanelProps) {
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  return (
    <>
      <div
        className="fixed left-0 right-0 bottom-[var(--mobile-bottom)] lg:bottom-0 top-[var(--mobile-top)] h-fit flex flex-col gap-3 items-start justify-end transition-all duration-300"
        style={{
          "--mobile-bottom": mobileBottom ?? "16px",
          "--mobile-top": mobileTop ?? "auto",
        }}
      >
        <div className="w-full lg:w-fit px-4 pt-4 h-fit">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="justify-start lg:flex-none hidden lg:flex px-4">
          <PieChartLegend />
        </div>
        <div ref={scrollRef} className="w-full h-fit overflow-auto">
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
      {/* <div className="hidden lg:flex fixed left-0 right-0 bottom-0 h-fit flex-col gap-4 items-start justify-end">
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
      </div> */}
    </>
  );
}
