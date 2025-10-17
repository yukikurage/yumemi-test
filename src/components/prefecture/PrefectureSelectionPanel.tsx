import type { components } from "@/generated/api";
import { SearchInput } from "@/components/prefecture/SearchInput";
import { PrefectureSelection } from "@/components/prefecture/PrefectureSelection";
import type { AllPopulationData } from "@/components/pages/PopulationPage";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { PieChartLegend } from "@/components/chart/PieChartLegend";

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
        className="fixed left-0 right-0 bottom-[var(--mobile-bottom)] xl:bottom-0 top-[var(--mobile-top)] h-fit flex flex-col p-2 items-start justify-end transition-all duration-300"
        style={{
          "--mobile-bottom": mobileBottom ?? "16px",
          "--mobile-top": mobileTop ?? "auto",
        }}
      >
        <div className="w-full px-4 h-fit flex justify-between items-center">
          <div className="max-w-96">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="hidden xl:flex h-full justify-end items-center">
            <PieChartLegend />
          </div>
        </div>
        <div ref={scrollRef} className="w-full h-fit overflow-auto">
          <div className="px-4 py-4 h-fit w-fit">
            <PrefectureSelection
              prefectures={filteredPrefectures}
              allPopulationData={allPopulationData}
              onChange={onChange}
              selectedPrefs={selectedPrefs}
            />
          </div>
        </div>
      </div>
      {/* <div className="hidden xl:flex fixed left-0 right-0 bottom-0 h-fit flex-col gap-4 items-start justify-end">
        <div className="w-full px-8 pt-4 h-fit flex flex-col xl:flex-row items-stretch xl:items-center gap-3 xl:gap-4">
          <div className="min-w-full xl:min-w-fit xl:flex-none">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="flex justify-start xl:flex-none">
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
