import type { MediaItem } from "./api/client";

export type DecisionMovie = MediaItem & { title: string; media_type: "movie" };
export type PersonOption = {
  id: number;
  name: string;
  profile_path: string | null;
  known_for: string[];
};
export type DecisionPreferences = {
  genres: number[];
  genreMode: "any" | "all";
  cast: number[];
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number;
  maxRuntime: number | null;
  priority: "popular" | "rated" | "recent";
  count: 6 | 9 | 12;
};
export type DecisionSelection = {
  movies: DecisionMovie[];
  total: number;
  sampled: number;
};
export const MAX_WHEEL_SIZE = 12;
export const WHEEL_STORAGE_KEY = "fym-decision-wheel-v1";
export const DEFAULT_PREFERENCES: DecisionPreferences = {
  genres: [],
  genreMode: "any",
  cast: [],
  yearFrom: null,
  yearTo: null,
  minRating: 7,
  maxRuntime: null,
  priority: "popular",
  count: 6,
};
const validGenres = new Set([
  28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53,
  10752, 37,
]);
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const integer = (value: unknown, min: number, max: number): value is number =>
  Number.isInteger(value) && Number(value) >= min && Number(value) <= max;

export function validatePreferences(
  value: unknown,
): { ok: true; value: DecisionPreferences } | { ok: false; error: string } {
  if (!record(value))
    return { ok: false, error: "Las preferencias deben ser un objeto válido." };
  const p = { ...DEFAULT_PREFERENCES, ...value };
  if (
    !Array.isArray(p.genres) ||
    p.genres.length > 4 ||
    p.genres.some((g) => !integer(g, 1, 99999) || !validGenres.has(g))
  )
    return { ok: false, error: "Elige hasta cuatro géneros del catálogo." };
  if (p.genreMode !== "any" && p.genreMode !== "all")
    return { ok: false, error: "La combinación de géneros no es válida." };
  if (
    !Array.isArray(p.cast) ||
    p.cast.length > 3 ||
    p.cast.some((id) => !integer(id, 1, 100000000))
  )
    return { ok: false, error: "Elige hasta tres personas del reparto." };
  if (
    (p.yearFrom !== null && !integer(p.yearFrom, 1870, 2100)) ||
    (p.yearTo !== null && !integer(p.yearTo, 1870, 2100))
  )
    return { ok: false, error: "Los años deben estar entre1870 y2100." };
  if (p.yearFrom !== null && p.yearTo !== null && p.yearFrom > p.yearTo)
    return {
      ok: false,
      error: "El año inicial no puede ser posterior al final.",
    };
  if (
    typeof p.minRating !== "number" ||
    !Number.isFinite(p.minRating) ||
    p.minRating < 0 ||
    p.minRating > 9
  )
    return { ok: false, error: "La valoración mínima debe estar entre0 y9." };
  if (p.maxRuntime !== null && !integer(p.maxRuntime, 30, 360))
    return {
      ok: false,
      error: "La duración máxima debe estar entre30 y360 minutos.",
    };
  if (!["popular", "rated", "recent"].includes(p.priority))
    return { ok: false, error: "La prioridad no es válida." };
  if (![6, 9, 12].includes(p.count))
    return { ok: false, error: "La selección debe tener6,9 o12 películas." };
  // Build a new object: arbitrary client fields never become provider parameters.
  return {
    ok: true,
    value: {
      genres: [...new Set(p.genres)],
      genreMode: p.genreMode,
      cast: [...new Set(p.cast)],
      yearFrom: p.yearFrom,
      yearTo: p.yearTo,
      minRating: p.minRating,
      maxRuntime: p.maxRuntime,
      priority: p.priority,
      count: p.count,
    },
  };
}

export function toDecisionMovie(value: unknown): DecisionMovie | null {
  if (
    !record(value) ||
    !integer(value.id, 1, 100000000) ||
    typeof value.title !== "string" ||
    !value.title.trim() ||
    value.media_type === "tv" ||
    value.media_type === "person"
  )
    return null;
  const path = (v: unknown) =>
    typeof v === "string" && /^\/[A-Za-z0-9_.-]+\.(jpg|png|webp)$/.test(v)
      ? v
      : null;
  return {
    id: value.id,
    title: value.title.slice(0, 300),
    media_type: "movie",
    overview:
      typeof value.overview === "string" ? value.overview.slice(0, 4000) : "",
    poster_path: path(value.poster_path),
    backdrop_path: path(value.backdrop_path),
    release_date:
      typeof value.release_date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.release_date)
        ? value.release_date
        : "",
    vote_average:
      typeof value.vote_average === "number" &&
      Number.isFinite(value.vote_average) &&
      value.vote_average >= 0 &&
      value.vote_average <= 10
        ? value.vote_average
        : 0,
    vote_count: integer(value.vote_count, 0, 100000000) ? value.vote_count : 0,
    popularity:
      typeof value.popularity === "number" &&
      Number.isFinite(value.popularity) &&
      value.popularity >= 0
        ? value.popularity
        : 0,
    genre_ids: Array.isArray(value.genre_ids)
      ? value.genre_ids.filter((id): id is number => integer(id, 1, 99999))
      : [],
  };
}

export function parseWheel(raw: string | null): DecisionMovie[] {
  try {
    const values: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(values)) return [];
    const unique = new Map<number, DecisionMovie>();
    for (const value of values) {
      const movie = toDecisionMovie(value);
      if (movie && !unique.has(movie.id)) unique.set(movie.id, movie);
      if (unique.size === MAX_WHEEL_SIZE) break;
    }
    return [...unique.values()];
  } catch {
    return [];
  }
}

export function shuffle<T>(
  values: readonly T[],
  randomIndex: (size: number) => number,
): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    if (!integer(j, 0, i)) throw new RangeError("Invalid random index");
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function wheelRotation(
  current: number,
  index: number,
  count: number,
): number {
  if (
    !Number.isFinite(current) ||
    !integer(count, 2, MAX_WHEEL_SIZE) ||
    !integer(index, 0, count - 1)
  )
    throw new RangeError("Invalid wheel state");
  const target = (((360 - index * (360 / count)) % 360) + 360) % 360;
  const position = ((current % 360) + 360) % 360;
  return current + 1800 + ((target - position + 360) % 360);
}

export function secureRandomIndex(size: number): number {
  if (!integer(size, 1, 100000000))
    throw new RangeError("Invalid choice count");
  const range = 0x100000000;
  const limit = range - (range % size);
  const buffer = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % size;
}
