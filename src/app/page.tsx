import { fetchPrefectures, fetchAllPopulationData } from "./actions";
import { PopulationPage } from "@/components/PopulationPage";
import { Header } from "@/components/Header";

export default async function Home() {
  const prefectures = await fetchPrefectures();
  const allPopulationData = await fetchAllPopulationData();

  return (
    <div className="relative h-screen font-sans flex flex-col">
      <div className="absolute inset-0 bg-noise opacity-20 -z-10" />
      <Header />
      <div className="flex-1 overflow-hidden">
        <PopulationPage
          prefectures={prefectures}
          allPopulationData={allPopulationData}
        />
      </div>
    </div>
  );
}
