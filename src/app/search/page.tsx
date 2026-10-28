"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import LoadingGrid from "@/components/LoadingGrid";
import Icon from "@/components/Icon";
import { apiClient, type ApiResponse } from "@/lib/api";
import { mediaKey, uniqueMedia } from "@/lib/media";
function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") || "";
  const type = params.get("type") || "all";
  const [draft, setDraft] = useState(query);
  const [lastUrlQuery, setLastUrlQuery] = useState(query);
  if (lastUrlQuery !== query) {
    setLastUrlQuery(query);
    if (draft.trim() !== query) setDraft(query);
  }
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(!!query);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [loadedFor, setLoadedFor] = useState("");
  const [loadingPage, setLoadingPage] = useState(1);
  const requestId = useRef(0);
  function search(value: string, media = type) {
    const next = new URLSearchParams();
    if (value.trim()) next.set("q", value.trim());
    if (media !== "all") next.set("type", media);
    router.replace(`/search?${next}`, { scroll: false });
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft.trim() !== query) search(draft);
    }, 400);
    return () => clearTimeout(timer); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, query]);
  async function load(page: number) {
    const id = ++requestId.current;
    setLoading(true);
    setLoadingPage(page);
    setError("");
    try {
      const result = await apiClient.getSearchResults(
        type === "movie" ? "movie" : type === "tv" ? "tv" : "multi",
        query,
        page,
      );
      if (id !== requestId.current) return;
      setLoadedFor(`${query}-${type}`);
      const items = result.results
        .filter((item) => item.media_type !== "person")
        .map((item) => ({
          ...item,
          media_type:
            type === "movie"
              ? ("movie" as const)
              : type === "tv"
                ? ("tv" as const)
                : item.media_type,
        }));
      setData((prev) => ({
        ...result,
        results: uniqueMedia(
          page === 1 ? items : [...(prev?.results || []), ...items],
        ),
      }));
    } catch {
      if (id === requestId.current)
        setError(
          "No se pudo completar la búsqueda. Revisa tu conexión e inténtalo de nuevo.",
        );
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }
  useEffect(() => {
    if (query.trim()) void load(1);
    return () => {
      // Numeric request generations are invalidated on URL changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      requestId.current++;
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type, retry]);
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container">
        <div className="page-heading">
          <div>
            <h1>Encuentra tu historia</h1>
            <p>Busca películas y series por su título.</p>
          </div>
        </div>
        <form
          className="search-field"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            search(draft);
          }}
        >
          <Icon name="search" size={22} />
          <label className="sr-only" htmlFor="search-query">
            Título de película o serie
          </label>
          <input
            id="search-query"
            autoComplete="off"
            placeholder="¿Qué te apetece ver?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            className="icon-button"
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setDraft("");
              search("");
            }}
          >
            <Icon name="close" size={16} />
          </button>
        </form>
        <div
          className="catalog-tabs"
          role="group"
          aria-label="Tipo de resultado"
        >
          {[
            { id: "all", label: "Todo" },
            { id: "movie", label: "Películas" },
            { id: "tv", label: "Series" },
          ].map((tab) => (
            <button
              key={tab.id}

              aria-pressed={type === tab.id}
              onClick={() => search(draft, tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {!query ? (
          <div className="empty-state">
            <h2>Empieza por un título</h2>
            <p>
              Una favorita de siempre o esa serie de la que no dejan de hablar.
            </p>
            <div className="button-row" style={{ justifyContent: "center" }}>
              {["Interstellar", "The Bear", "El viaje de Chihiro"].map(
                (title) => (
                  <button
                    key={title}
                    className="button button-secondary"
                    onClick={() => {
                      setDraft(title);
                      search(title);
                    }}
                  >
                    {title}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <h2>La búsqueda no respondió</h2>
            <p>{error}</p>
            <button
              className="button button-primary"
              onClick={() => setRetry((n) => n + 1)}
            >
              Reintentar
            </button>
          </div>
        ) : loadedFor !== `${query}-${type}` ||
          (loading && loadingPage === 1) ? (
          <LoadingGrid />
        ) : !data?.results.length ? (
          <div className="empty-state">
            <h2>No encontramos ese título</h2>
            <p>Prueba con su título original o revisa cómo está escrito.</p>
            <Link href="/movies" className="button button-primary">
              Explorar películas
            </Link>
          </div>
        ) : (
          <>
            <div className="results-meta" aria-live="polite">
              <span>
                {data.results.length} títulos cargados para «{query}»
              </span>
              <span>Películas y series de TMDB</span>
            </div>
            <div className="media-grid">
              {data.results.map((item) => (
                <MovieCard key={mediaKey(item)} item={item} />
              ))}
            </div>
            {data.page < Math.min(data.total_pages, 500) && (
              <div className="load-more">
                <button
                  className="button button-secondary"
                  onClick={() => void load(data.page + 1)}
                  disabled={loading}
                >
                  {loading ? "Buscando…" : "Cargar más resultados"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main id="main-content" className="page-container">
            <LoadingGrid />
          </main>
        </>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
