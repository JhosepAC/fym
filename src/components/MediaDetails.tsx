"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import MediaImage from "./MediaImage";
import MovieRow from "./MovieRow";
import LoadingGrid from "./LoadingGrid";
import Modal from "./Modal";
import Icon from "./Icon";
import Seasons from "./Seasons";
import { SaveButton } from "./LibraryProvider";
import {
  apiClient,
  type MovieDetail,
  type TvShowDetail,
  type MediaItem,
  type CreditsResponse,
  type Video,
  type WatchProvidersResponse,
} from "@/lib/api";
import { mediaTitle, mediaYear, uniqueMedia } from "@/lib/media";
export type Art = { path: string; title: string; portrait?: boolean };
export const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("es", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "Sin fecha confirmada";
export const duration = (minutes?: number | null) =>
  minutes
    ? `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)} h ` : ""}${minutes % 60 ? `${minutes % 60} min` : ""}`.trim()
    : "Duración no disponible";
export function VideoLinks({
  videos,
  onPlay,
}: {
  videos: Video[];
  onPlay: (video: Video) => void;
}) {
  return (
    <div className="video-list">
      {videos
        .filter((v) => v.site === "YouTube")
        .map((v) => (
          <button
            className="button button-secondary"
            key={v.id}
            onClick={() => onPlay(v)}
          >
            <Icon name="play" size={14} />
            {v.name}
          </button>
        ))}
    </div>
  );
}

export default function MediaDetails({
  id,
  kind,
}: {
  id: number;
  kind: "movie" | "tv";
}) {
  const search = useSearchParams();
  const [detail, setDetail] = useState<MovieDetail | TvShowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [partial, setPartial] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [providers, setProviders] = useState<WatchProvidersResponse | null>(
    null,
  );
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [similar, setSimilar] = useState<MediaItem[] | null>(null);
  const [relatedError, setRelatedError] = useState("");
  const [country, setCountry] = useState("CO");
  const [video, setVideo] = useState<Video | null>(null);
  const [art, setArt] = useState<Art | null>(null);
  useEffect(() => {
    let live = true;
    async function load() {
      setLoading(true);
      setError("");
      setPartial(false);
      try {
        if (!Number.isInteger(id) || id < 1) throw new Error("id");
        const m = kind === "movie";
        const results = await Promise.allSettled([
          m ? apiClient.getMovieDetails(id) : apiClient.getTvDetails(id),
          m ? apiClient.getMovieVideos(id) : apiClient.getTvVideos(id),
          m ? apiClient.getMovieCredits(id) : apiClient.getTvCredits(id),
          m
            ? apiClient.getMovieWatchProviders(id)
            : apiClient.getTvWatchProviders(id),
          m
            ? apiClient.getMovieRecommendations(id)
            : apiClient.getTvRecommendations(id),
        ]);
        if (!live) return;
        if (results[0].status === "rejected" || !results[0].value.id)
          throw new Error("detail");
        setDetail(results[0].value);
        const v =
          results[1].status === "fulfilled" ? results[1].value.results : [];
        setVideos(v);
        setCredits(results[2].status === "fulfilled" ? results[2].value : null);
        setProviders(
          results[3].status === "fulfilled" ? results[3].value : null,
        );
        if (results[4].status === "fulfilled") {
          setRecommendations(results[4].value.results);
          setPage(1);
          setHasMore(results[4].value.total_pages > 1);
        }
        setPartial(results.slice(1).some((r) => r.status === "rejected"));
        if (search.get("play") === "true")
          setVideo(
            v.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
              v.find((v) => v.site === "YouTube") ||
              null,
          );
      } catch {
        if (live)
          setError(
            "No se pudo cargar la ficha. El título puede no estar disponible o el catálogo no responde.",
          );
      } finally {
        if (live) setLoading(false);
      }
    }
    void load();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, kind, retry]);
  async function loadRelated(mode: "more" | "similar") {
    setLoadingMore(true);
    setRelatedError("");
    try {
      const result =
        mode === "similar"
          ? kind === "movie"
            ? await apiClient.getMovieSimilar(id)
            : await apiClient.getTvSimilar(id)
          : kind === "movie"
            ? await apiClient.getMovieRecommendations(id, page + 1)
            : await apiClient.getTvRecommendations(id, page + 1);
      if (mode === "similar") setSimilar(result.results);
      else {
        setRecommendations((prev) => uniqueMedia([...prev, ...result.results]));
        setPage(result.page);
        setHasMore(result.page < Math.min(result.total_pages, 500));
      }
    } catch {
      setRelatedError(
        "No se pudieron cargar más títulos. Vuelve a intentarlo.",
      );
    } finally {
      setLoadingMore(false);
    }
  }
  if (loading)
    return (
      <>
        <Navbar />
        <main id="main-content" className="page-container">
          <LoadingGrid count={6} />
        </main>
      </>
    );
  if (error || !detail)
    return (
      <>
        <Navbar />
        <main id="main-content" className="page-container">
          <div className="empty-state" role="alert">
            <h1>Ficha no disponible</h1>
            <p>{error}</p>
            <button
              className="button button-primary"
              onClick={() => setRetry((n) => n + 1)}
            >
              Reintentar
            </button>{" "}
            <Link
              href={kind === "movie" ? "/movies" : "/series"}
              className="button button-secondary"
            >
              Volver al catálogo
            </Link>
          </div>
        </main>
      </>
    );
  const movie = kind === "movie" ? (detail as MovieDetail) : null;
  const tv = kind === "tv" ? (detail as TvShowDetail) : null;
  const title = mediaTitle(detail);
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find((v) => v.site === "YouTube");
  const countries = new Intl.DisplayNames(["es"], { type: "region" });
  const available = providers?.results?.[country];
  const status: Record<string, string> = {
    Released: "Estrenada",
    "Post Production": "Posproducción",
    "In Production": "En producción",
    Planned: "Planificada",
    Rumored: "Sin confirmar",
    "Returning Series": "En emisión",
    Ended: "Finalizada",
    Canceled: "Cancelada",
    Pilot: "Piloto",
  };
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container">
        <div className="detail-top">
          <Link href={movie ? "/movies" : "/series"} className="text-link">
            <Icon name="left" size={16} />
            {movie ? "Películas" : "Series"}
          </Link>
          <span>La historia, en detalle</span>
        </div>
        <section className="detail-hero" aria-label="Ficha del título">
          <button
            className="detail-poster"
            disabled={!detail.poster_path}
            aria-label={`Ampliar cartel de ${title}`}
            onClick={() =>
              setArt({ path: detail.poster_path!, title, portrait: true })
            }
          >
            <MediaImage
              path={detail.poster_path}
              alt={`Cartel de ${title}`}
              sizes="240px"
              priority
            />
          </button>
          <div className="detail-content">
            <h1>{title}</h1>
            {detail.tagline && (
              <p className="detail-tagline">{detail.tagline}</p>
            )}
            <div className="detail-meta">
              <span className="rating">
                <Icon name="star" size={16} />
                {detail.vote_count
                  ? `${detail.vote_average.toFixed(1)} / 10`
                  : "Sin valoraciones"}
              </span>
              <span>{mediaYear(detail) || "Sin fecha"}</span>
              <span>
                {movie
                  ? duration(movie.runtime)
                  : `${tv!.number_of_seasons} temporadas`}
              </span>
              <span>
                {(detail.vote_count || 0).toLocaleString("es")} votos en TMDB
              </span>
            </div>
            <div className="detail-genres">
              {detail.genres?.map((g) => (
                <Link
                  key={g.id}
                  href={`${movie ? "/movies" : "/series"}?genre=${g.id}`}
                >
                  {g.name}
                </Link>
              ))}
            </div>
            <p className="detail-overview">
              {detail.overview ||
                "La sinopsis todavía no está disponible en español."}
            </p>
            <div className="button-row">
              {trailer && (
                <button
                  className="button button-primary"
                  onClick={() => setVideo(trailer)}
                >
                  <Icon name="play" size={15} />
                  Ver tráiler
                </button>
              )}
              <SaveButton item={{ ...detail, media_type: kind }} />
              {movie?.belongs_to_collection && (
                <Link
                  className="button button-secondary"
                  href={`/collection/${movie.belongs_to_collection.id}`}
                >
                  Ver colección <Icon name="arrow" size={15} />
                </Link>
              )}
            </div>
          </div>
        </section>
        {partial && (
          <p className="error-message" role="status">
            No se pudo cargar parte de la información adicional.{" "}
            <button
              className="text-link"
              onClick={() => setRetry((n) => n + 1)}
            >
              Reintentar
            </button>
          </p>
        )}
        {detail.backdrop_path && (
          <button
            className="detail-backdrop backdrop-button"
            aria-label={`Ampliar fotograma de ${title}`}
            onClick={() =>
              setArt({
                path: detail.backdrop_path!,
                title: `Fotograma de ${title}`,
              })
            }
          >
            <MediaImage
              path={detail.backdrop_path}
              alt={`Fotograma de ${title}`}
              backdrop
              sizes="(max-width:650px) 100vw, 1300px"
            />
          </button>
        )}
        <div className="detail-columns">
          <div>
            {credits && (
              <section className="detail-block">
                <h2>Delante de la cámara</h2>
                {credits.cast?.length ? (
                  <div className="cast-rail">
                    {credits.cast.slice(0, 24).map((p) => (
                      <article key={p.id}>
                        <div className="cast-photo">
                          <MediaImage
                            path={p.profile_path}
                            alt={p.name}
                            sizes="100px"
                          />
                        </div>
                        <h3>{p.name}</h3>
                        <p>{p.character}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="muted">
                    No hay información de reparto disponible.
                  </p>
                )}
              </section>
            )}
            {tv && (
              <Seasons id={id} series={tv} onPlay={setVideo} onArt={setArt} />
            )}
            {!!credits?.crew?.length && (
              <section className="detail-block">
                <h2>Detrás de la historia</h2>
                <div className="crew-list">
                  {[
                    ...new Map(
                      credits.crew
                        .filter((p) =>
                          [
                            "Director",
                            "Screenplay",
                            "Writer",
                            "Original Music Composer",
                            "Director of Photography",
                            "Producer",
                            "Executive Producer",
                            "Creator",
                          ].includes(p.job),
                        )
                        .map((p) => [`${p.id}-${p.job}`, p]),
                    ).values(),
                  ]
                    .slice(0, 12)
                    .map((p) => (
                      <div key={`${p.id}-${p.job}`}>
                        <h3>{p.name}</h3>
                        <p>
                          {
                            (
                              {
                                Director: "Dirección",
                                Screenplay: "Guion",
                                Writer: "Guion",
                                "Original Music Composer": "Música",
                                "Director of Photography": "Fotografía",
                                Producer: "Producción",
                                "Executive Producer": "Producción ejecutiva",
                                Creator: "Creación",
                              } as Record<string, string>
                            )[p.job]
                          }
                        </p>
                      </div>
                    ))}
                </div>
              </section>
            )}
            {!!videos.length && (
              <section className="detail-block">
                <h2>Tráileres y vídeos</h2>
                <VideoLinks videos={videos} onPlay={setVideo} />
              </section>
            )}
          </div>
          <aside>
            <section className="detail-facts detail-block">
              <h2>Dónde verla</h2>
              <label className="filter-field provider-country">
                <span className="muted">País de disponibilidad</span>
                <select
                  className="form-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {[
                    ...new Set([
                      "CO",
                      "PE",
                      "MX",
                      "ES",
                      "AR",
                      "US",
                      ...Object.keys(providers?.results || {}),
                    ]),
                  ]
                    .sort((a, b) =>
                      (countries.of(a) || a).localeCompare(
                        countries.of(b) || b,
                        "es",
                      ),
                    )
                    .map((c) => (
                      <option value={c} key={c}>
                        {countries.of(c) || c}
                      </option>
                    ))}
                </select>
              </label>
              {!providers ? (
                <p className="provider-note">
                  No se pudo consultar la disponibilidad.
                </p>
              ) : !available ||
                ![
                  ...(available.flatrate || []),
                  ...(available.rent || []),
                  ...(available.buy || []),
                ].length ? (
                <p className="provider-note">
                  No hay proveedores registrados en TMDB para este país. Esto no
                  confirma que el título no esté disponible.
                </p>
              ) : (
                <>
                  {(
                    [
                      { key: "flatrate", label: "Con suscripción" },
                      { key: "rent", label: "Alquiler" },
                      { key: "buy", label: "Compra" },
                    ] as const
                  ).map((g) =>
                    available[g.key]?.length ? (
                      <div className="provider-group" key={g.key}>
                        <h3>{g.label}</h3>
                        <div className="providers">
                          {available[g.key]!.map((p) => (
                            <a
                              className="provider"
                              key={p.provider_id}
                              href={available.link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="provider-logo">
                                <MediaImage
                                  path={p.logo_path}
                                  alt={p.provider_name}
                                  sizes="40px"
                                />
                              </span>
                              <small>{p.provider_name}</small>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null,
                  )}
                  <a
                    href={available.link}
                    className="text-link provider-country"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Consultar disponibilidad <Icon name="external" size={14} />
                  </a>
                </>
              )}
              <p className="provider-note">
                Información de JustWatch a través de TMDB. La oferta puede
                cambiar.
              </p>
            </section>
            <section className="detail-facts">
              <h2>Sobre este título</h2>
              <dl>
                <div>
                  <dt>Estreno</dt>
                  <dd>
                    {formatDate(detail.release_date || detail.first_air_date)}
                  </dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>
                    {status[detail.status] || detail.status || "No disponible"}
                  </dd>
                </div>
                {tv && (
                  <div>
                    <dt>Episodios</dt>
                    <dd>{tv.number_of_episodes.toLocaleString("es")}</dd>
                  </div>
                )}
                {movie && (
                  <>
                    {[
                      { label: "Presupuesto", value: movie.budget },
                      { label: "Recaudación", value: movie.revenue },
                    ].map((f) => (
                      <div key={f.label}>
                        <dt>{f.label}</dt>
                        <dd>
                          {f.value
                            ? new Intl.NumberFormat("es", {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              }).format(f.value)
                            : "No disponible"}
                        </dd>
                      </div>
                    ))}
                    <div>
                      <dt>Producción</dt>
                      <dd>
                        {movie.production_companies
                          ?.map((p) => p.name)
                          .join(", ") || "No disponible"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </section>
          </aside>
        </div>
        <MovieRow
          title={movie ? "Para tu próxima sesión" : "Si te gustó esta serie"}
          items={recommendations.map((item) => ({ ...item, media_type: kind }))}
        />
        {relatedError && (
          <p className="error-message" role="alert">
            {relatedError}
          </p>
        )}
        <div className="button-row related-actions">
          {hasMore && (
            <button
              className="button button-secondary"
              disabled={loadingMore}
              onClick={() => void loadRelated("more")}
            >
              {loadingMore ? "Cargando…" : "Más recomendaciones"}
            </button>
          )}
          {similar === null && (
            <button
              className="text-link"
              disabled={loadingMore}
              onClick={() => void loadRelated("similar")}
            >
              Explorar títulos similares <Icon name="arrow" size={15} />
            </button>
          )}
        </div>
        {similar !== null && (
          <MovieRow
            title="Historias con algo en común"
            items={similar.map((item) => ({ ...item, media_type: kind }))}
          />
        )}
      </main>
      {video && (
        <Modal title={video.name} onClose={() => setVideo(null)}>
          <iframe
            className="video-frame"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.key)}?autoplay=1`}
            title={video.name}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </Modal>
      )}
      {art && (
        <Modal title={art.title} onClose={() => setArt(null)}>
          <div className={`expanded-art ${art.portrait ? "portrait-art" : ""}`}>
            <MediaImage
              path={art.path}
              alt={art.title}
              sizes="900px"
              backdrop={!art.portrait}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
