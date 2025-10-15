import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";

type PrefectureProperties = {
  nam: string;
  nam_ja: string;
  id: number;
};

export type PrefectureFeature = Feature<Geometry, PrefectureProperties>;

export function useMapData() {
  const [geoData, setGeoData] = useState<PrefectureFeature[]>([]);

  useEffect(() => {
    fetch("/japan-simplified.topojson")
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`TopoJSON load error: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        const worldData = json as Topology;
        if (worldData && worldData.objects.japan) {
          const features = feature(
            worldData,
            worldData.objects.japan as GeometryCollection
          ) as FeatureCollection<Geometry, PrefectureProperties>;
          setGeoData(features.features);
        }
      })
      .catch((error) => {
        // エラーハンドリング（必要に応じてエラー状態を追加）
        console.error("Failed to load TopoJSON:", error);
      });
  }, []);

  return geoData;
}
