import type { MediaItem } from "@/lib/api";
export const mediaType = (item: MediaItem): "movie" | "tv" =>
  item.media_type === "tv" || !!item.first_air_date ? "tv" : "movie";
export const mediaHref = (item: MediaItem) =>
  `/${mediaType(item) === "tv" ? "series" : "movie"}/${item.id}`;
export const mediaTitle = (item: MediaItem) =>
  item.title || item.name || "Título no disponible";
export const mediaYear = (item: MediaItem) =>
  (item.release_date || item.first_air_date || "").slice(0, 4);
export const mediaKey = (item: MediaItem) => `${mediaType(item)}-${item.id}`;
export const uniqueMedia = (items: MediaItem[]) => [
  ...new Map(items.map((item) => [mediaKey(item), item])).values(),
];
export const MOVIE_GENRES = [
  { id: 28, name: "Acción" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animación" },
  { id: 35, name: "Comedia" },
  { id: 80, name: "Crimen" },
  { id: 99, name: "Documental" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Familia" },
  { id: 14, name: "Fantasía" },
  { id: 36, name: "Historia" },
  { id: 27, name: "Terror" },
  { id: 10402, name: "Música" },
  { id: 9648, name: "Misterio" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ciencia ficción" },
  { id: 53, name: "Suspense" },
  { id: 10752, name: "Bélica" },
  { id: 37, name: "Western" },
];
export const TV_GENRES = [
  { id: 10759, name: "Acción y aventura" },
  { id: 16, name: "Animación" },
  { id: 35, name: "Comedia" },
  { id: 80, name: "Crimen" },
  { id: 99, name: "Documental" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Familia" },
  { id: 10762, name: "Infantil" },
  { id: 9648, name: "Misterio" },
  { id: 10763, name: "Noticias" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Ciencia ficción y fantasía" },
  { id: 10766, name: "Telenovela" },
  { id: 10767, name: "Conversación" },
  { id: 10768, name: "Guerra y política" },
  { id: 37, name: "Western" },
];
