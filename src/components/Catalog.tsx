"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Navbar from "./Navbar";
import LoadingGrid from "./LoadingGrid";
import MovieCard from "./MovieCard";
import { apiClient, type ApiResponse } from "@/lib/api";
import { MOVIE_GENRES, TV_GENRES, mediaKey, uniqueMedia } from "@/lib/media";
const empty: ApiResponse = {
  results: [],
  page: 1,
  total_pages: 0,
  total_results: 0,
};
export default function Catalog({
  kind,
  initialData,
}: {
  kind: "movie" | "tv";
  initialData: Record<string, ApiResponse>;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requestId = useRef(0);
  const category = params.get("category") || "popular";
  const genre = params.get("genre") || "";
  const year = params.get("year") || "";
  const rating = params.get("rating") || "";
  const sort = params.get("sort") || "popularity.desc";
  const active = !!(genre || year || rating || sort !== "popularity.desc");
  const [data, setData] = useState<ApiResponse>(
    !active ? initialData[category] || empty : empty,
  );
  const [loading, setLoading] = useState(active);
  const [loadingPage, setLoadingPage] = useState(1);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const genres = kind === "movie" ? MOVIE_GENRES : TV_GENRES;
  function update(values: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.replace(`${pathname}?${next}`, { scroll: false });
  }
  async function fetchPage(page: number) {
    const request = ++requestId.current;
    setLoading(true);
    setLoadingPage(page);
    setError("");
    try {
      let response: ApiResponse;
      if (active) {
        const options: Record<string, string> = {
          page: String(page),
          sort_by:
            kind === "tv"
              ? sort.replace("primary_release_date", "first_air_date")
              : sort,
          "vote_count.gte":
            rating || sort.startsWith("vote_average") ? "100" : "0",
        };
        if (genre) options.with_genres = genre;
        if (year)
          options[
            kind === "movie" ? "primary_release_year" : "first_air_date_year"
          ] = year;
        if (rating) options["vote_average.gte"] = rating;
        response = await apiClient.fetch<ApiResponse>(
          `/discover/${kind}`,
          options,
        );
      } else if (page === 1 && initialData[category] && !retry)
        response = initialData[category];
      else {
        const paths = {
          popular: `${kind}/popular`,
          trending: `trending/${kind}/week`,
          topRated: `${kind}/top_rated`,
          upcoming: kind === "movie" ? "movie/upcoming" : "tv/on_the_air",
        };
        response = await apiClient.fetch<ApiResponse>(
          `/${paths[category as keyof typeof paths] || paths.popular}`,
          { page: String(page) },
        );
      }
      if (request !== requestId.current) return;
      setData((previous) => ({
        ...response,
        results: uniqueMedia(
          page === 1
            ? response.results
            : [...previous.results, ...response.results],
        ),
      }));
    } catch {
      if (request === requestId.current) {
        if (page === 1) setData(empty);
        setError(
          "No se pudo cargar el catálogo. Revisa tu conexión e inténtalo de nuevo.",
        );
      }
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }
  useEffect(() => {
    void fetchPage(1);
    return () => {
      // Numeric request generations are invalidated on filter changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      requestId.current++;
    }; // fetchPage reads the URL snapshot for this request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, category, genre, year, rating, sort, retry]);
  const tabs = [
    { id: "popular", name: "Populares" },
    { id: "trending", name: "En tendencia" },
    { id: "topRated", name: "Mejor valoradas" },
    {
      id: "upcoming",
      name: kind === "movie" ? "Próximos estrenos" : "En emisión",
    },
  ];
  return (
    <>
      <Navbar />
      <main className="page-container" id="main-content">
        <div className="page-heading">
          <div>
            <h1>{kind === "movie" ? "Películas" : "Series"}</h1>
            <p>
              {kind === "movie"
                ? "Un mundo de historias. Encuentra la tuya."
                : "Encuentra esa serie que no querrás dejar."}
            </p>
          </div>
        </div>
        <nav className="catalog-tabs" aria-label="Selecciones del catálogo">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              aria-current={category === tab.id && !active ? "page" : undefined}
              onClick={() =>
                router.replace(`${pathname}?category=${tab.id}`, {
                  scroll: false,
                })
              }
            >
              {tab.name}
            </button>
          ))}
        </nav>
        <div className="filter-bar">
          <div className="filter-field">
            <label htmlFor="genre">Género</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => update({ genre: e.target.value })}
            >
              <option value="">Todos los géneros</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="year">Año de estreno</label>
            <input
              id="year"
              type="number"
              inputMode="numeric"
              min="1870"
              max="2100"
              placeholder="Cualquier año"
              value={year}
              onChange={(e) => update({ year: e.target.value })}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="rating">Valoración mínima</label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => update({ rating: e.target.value })}
            >
              <option value="">Cualquier valoración</option>
              {[9, 8, 7, 6, 5].map((r) => (
                <option key={r} value={r}>
                  {r} o más
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="sort">Ordenar por</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => update({ sort: e.target.value })}
            >
              <option value="popularity.desc">Popularidad</option>
              <option value="vote_average.desc">Mejor valoradas</option>
              <option value="primary_release_date.desc">Más recientes</option>
              <option value="primary_release_date.asc">Más antiguas</option>
            </select>
          </div>
          {active && (
            <button
              className="text-link"
              onClick={() => router.replace(pathname, { scroll: false })}
            >
              Limpiar filtros
            </button>
          )}
        </div>
        <div aria-live="polite" className="results-meta">
          <span>
            {loading
              ? "Actualizando selección…"
              : `${data.total_results.toLocaleString("es")} títulos${active ? " con estos filtros" : " en esta selección"}`}
          </span>
          <span>{data.results.length} visibles</span>
        </div>
        {error && (
          <div className="inline-empty" role="alert">
            <p>{error}</p>
            <button
              className="text-link"
              onClick={() => setRetry((n) => n + 1)}
            >
              Reintentar
            </button>
          </div>
        )}
        {loading && loadingPage === 1 ? (
          <LoadingGrid />
        ) : !data.results.length && !error ? (
          <div className="empty-state">
            <h2>No hay coincidencias</h2>
            <p>Prueba otro género, un año diferente o una valoración menor.</p>
            <button
              className="button button-primary"
              onClick={() => router.replace(pathname, { scroll: false })}
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="media-grid">
            {data.results.map((item) => (
              <MovieCard
                item={{ ...item, media_type: kind }}
                key={mediaKey({ ...item, media_type: kind })}
              />
            ))}
          </div>
        )}
        {data.results.length > 0 &&
          data.page < Math.min(data.total_pages, 500) && (
            <div className="load-more">
              <button
                className="button button-secondary"
                disabled={loading}
                onClick={() => void fetchPage(data.page + 1)}
              >
                {loading ? "Cargando…" : "Cargar más títulos"}
              </button>
            </div>
          )}
      </main>
    </>
  );
}
