"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import MovieCard from "./MovieCard";
import MediaImage from "./MediaImage";
import LoadingGrid from "./LoadingGrid";
import Modal from "./Modal";
import { apiClient, type Collection } from "@/lib/api";
export default function CollectionDetails({ id }: { id: number }) {
  const [data, setData] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [poster, setPoster] = useState(false);
  const [sort, setSort] = useState("release");
  useEffect(() => {
    let live = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (!Number.isInteger(id) || id < 1) throw new Error("id");
        const result = await apiClient.getCollectionDetails(id);
        if (live) setData(result);
      } catch {
        if (live)
          setError(
            "No se pudo cargar esta colección. Puede no estar disponible en el catálogo.",
          );
      } finally {
        if (live) setLoading(false);
      }
    }
    void load();
    return () => {
      live = false;
    };
  }, [id, retry]);
  const movies = [...(data?.parts || [])].sort((a, b) =>
    sort === "rating"
      ? b.vote_average - a.vote_average
      : (a.release_date || "9999").localeCompare(b.release_date || "9999"),
  );
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container">
        {loading ? (
          <LoadingGrid />
        ) : error || !data ? (
          <div className="empty-state" role="alert">
            <h1>Colección no disponible</h1>
            <p>{error}</p>
            <button
              className="button button-primary"
              onClick={() => setRetry((n) => n + 1)}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="detail-top">
              <Link href="/movies">Volver a películas</Link>
              <span>Colección</span>
            </div>
            <section className="detail-hero">
              <button
                className="detail-poster"
                aria-label={`Ampliar cartel de ${data.name}`}
                disabled={!data.poster_path}
                onClick={() => setPoster(true)}
              >
                <MediaImage
                  path={data.poster_path}
                  alt={data.name}
                  sizes="240px"
                  priority
                />
              </button>
              <div className="detail-content">
                <h1>{data.name}</h1>
                <p className="detail-meta">
                  {data.parts.length} películas en una misma historia
                </p>
                <p className="detail-overview">
                  {data.overview ||
                    "Explora las películas que forman esta colección y guárdalas para tu próxima sesión."}
                </p>
                <a className="button button-primary" href="#collection-movies">
                  Explorar la colección
                </a>
              </div>
            </section>
            <section className="movie-section" id="collection-movies">
              <div className="section-heading">
                <h2>La historia completa</h2>
                <label>
                  <span className="sr-only">Orden de películas</span>
                  <select
                    className="form-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="release">Orden de estreno</option>
                    <option value="rating">Mejor valoradas</option>
                  </select>
                </label>
              </div>
              <div className="media-grid">
                {movies.map((item) => (
                  <MovieCard
                    key={item.id}
                    item={{
                      ...item,
                      vote_count: item.vote_average > 0 ? 1 : 0,
                      popularity: 0,
                      media_type: "movie",
                    }}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      {poster && data && (
        <Modal title={data.name} onClose={() => setPoster(false)}>
          <div className="expanded-art portrait-art">
            <MediaImage path={data.poster_path} alt={data.name} sizes="500px" />
          </div>
        </Modal>
      )}
    </>
  );
}
