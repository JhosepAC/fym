import "server-only";
import { randomInt } from "node:crypto";
import { serverApiClient } from "./api/server";
import type { ApiResponse } from "./api/client";
import {
  shuffle,
  toDecisionMovie,
  type DecisionMovie,
  type DecisionPreferences,
  type DecisionSelection,
} from "./decision";

export async function createSelection(
  preferences: DecisionPreferences,
): Promise<DecisionSelection> {
  const today = new Date().toISOString().slice(0, 10);
  const options: Record<string, string> = {
    "vote_count.gte": "100",
    "vote_average.gte": String(preferences.minRating),
    "primary_release_date.lte": preferences.yearTo
      ? `${Math.min(preferences.yearTo, Number(today.slice(0, 4)))}-12-31`
      : today,
    include_adult: "false",
    include_video: "false",
    sort_by: {
      popular: "popularity.desc",
      rated: "vote_average.desc",
      recent: "primary_release_date.desc",
    }[preferences.priority],
  };
  // Never include future releases, even when a requested range extends into the future.
  if (options["primary_release_date.lte"] > today)
    options["primary_release_date.lte"] = today;
  if (preferences.genres.length)
    options.with_genres = preferences.genres.join(
      preferences.genreMode === "all" ? "," : "|",
    );
  if (preferences.cast.length) options.with_cast = preferences.cast.join(",");
  if (preferences.yearFrom)
    options["primary_release_date.gte"] = `${preferences.yearFrom}-01-01`;
  if (preferences.maxRuntime) {
    options["with_runtime.gte"] = "1";
    options["with_runtime.lte"] = String(preferences.maxRuntime);
  }
  const first = await serverApiClient.fetch<ApiResponse>("/discover/movie", {
    ...options,
    page: "1",
  });
  const pages = Math.min(first.total_pages, 5);
  const additional = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      serverApiClient.fetch<ApiResponse>("/discover/movie", {
        ...options,
        page: String(i + 2),
      }),
    ),
  );
  const pool = new Map<number, DecisionMovie>();
  for (const raw of [first, ...additional].flatMap((page) => page.results)) {
    const movie = toDecisionMovie(raw);
    if (movie) pool.set(movie.id, movie);
  }
  return {
    movies: shuffle([...pool.values()], randomInt).slice(0, preferences.count),
    total: first.total_results,
    sampled: pool.size,
  };
}
