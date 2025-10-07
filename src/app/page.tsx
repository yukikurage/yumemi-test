import { PopulationChart } from "@/components/PopulationChart";
import { fetchPrefectures } from "./actions";
import { PopulationPage } from "@/components/PopulationPage";

export default async function Home() {
  const prefectures = await fetchPrefectures();

  return (
    <div className="min-h-screen">
      <PopulationPage prefectures={prefectures} />
    </div>
  );
}
