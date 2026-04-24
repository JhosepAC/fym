import SeriesClient from "./SeriesClient";
import { apiClient } from "@/lib/api";

async function getData() {
  const [trending, popular, topRated, onTheAir] = await Promise.all([
    apiClient.getTrending("tv"),
    apiClient.getTvPopular(),
    apiClient.getTvTopRated(),
    apiClient.getTvOnTheAir(),
  ]);

  return { trending, popular, topRated, onTheAir };
}

async function getAllSeries() {
  const allSeries: Map<number, any> = new Map();
  const totalPages = 20;
  
  for (let page = 1; page <= totalPages; page++) {
    const [popular, topRated, onTheAir] = await Promise.all([
      apiClient.getTvPopular(page),
      apiClient.getTvTopRated(page),
      apiClient.getTvOnTheAir(page),
    ]);
    
    [...popular.results, ...topRated.results, ...onTheAir.results].forEach((series: any) => {
      if (!allSeries.has(series.id)) {
        allSeries.set(series.id, series);
      }
    });
  }
  
  return Array.from(allSeries.values());
}

export default async function SeriesPage() {
  const [initialData, allSeries] = await Promise.all([getData(), getAllSeries()]);
  return <SeriesClient initialData={initialData} allSeries={allSeries} />;
}