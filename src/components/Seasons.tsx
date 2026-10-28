"use client";
import { useEffect, useState } from "react";
import {
  apiClient,
  type TvShowDetail,
  type TvSeason,
  type TvEpisode,
  type SeasonAggregateCredits,
  type Video,
} from "@/lib/api";
import { type Art, duration, formatDate, VideoLinks } from "./MediaDetails";
import Modal from "./Modal";
import MediaImage from "./MediaImage";
import Icon from "./Icon";
export default function Seasons({
  id,
  series,
  onPlay,
  onArt,
}: {
  id: number;
  series: TvShowDetail;
  onPlay: (v: Video) => void;
  onArt: (art: Art) => void;
}) {
  const [selected, setSelected] = useState(
    series.seasons?.find((s) => s.season_number > 0)?.season_number ??
      series.seasons?.[0]?.season_number ??
      1,
  );
  const [season, setSeason] = useState<TvSeason | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [info, setInfo] = useState(false);
  const [credits, setCredits] = useState<SeasonAggregateCredits | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [partial, setPartial] = useState(false);
  const [episode, setEpisode] = useState<TvEpisode | null>(null);
  const [media, setMedia] = useState<{
    stills: { file_path: string }[];
    videos: Video[];
  } | null>(null);
  const [mediaError, setMediaError] = useState("");
  const [mediaRetry, setMediaRetry] = useState(0);
  useEffect(() => {
    let live = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [data, people, clips] = await Promise.allSettled([
          apiClient.getTvSeasonDetails(id, selected),
          apiClient.getTvSeasonAggregateCredits(id, selected),
          apiClient.getTvSeasonVideos(id, selected),
        ]);
        if (!live) return;
        if (data.status === "rejected") throw new Error("season");
        setSeason(data.value);
        setCredits(people.status === "fulfilled" ? people.value : null);
        setVideos(clips.status === "fulfilled" ? clips.value.results : []);
        setPartial(people.status === "rejected" || clips.status === "rejected");
      } catch {
        if (live)
          setError("No se pudieron cargar los episodios de esta temporada.");
      } finally {
        if (live) setLoading(false);
      }
    }
    void load();
    return () => {
      live = false;
    };
  }, [id, selected, retry]);
  useEffect(() => {
    let live = true;
    if (!episode) return;
    async function load() {
      setMedia(null);
      setMediaError("");
      try {
        const [images, clips] = await Promise.all([
          apiClient.getTvEpisodeImages(id, selected, episode!.episode_number),
          apiClient.getTvEpisodeVideos(id, selected, episode!.episode_number),
        ]);
        if (live)
          setMedia({
            stills: images.stills || [],
            videos: clips.results || [],
          });
      } catch {
        if (live)
          setMediaError(
            "No se pudieron cargar las imágenes y vídeos del episodio.",
          );
      }
    }
    void load();
    return () => {
      live = false;
    };
  }, [id, selected, episode, mediaRetry]);
  return (
    <section className="detail-block">
      <div className="episodes-heading">
        <h2>Temporadas y episodios</h2>
        <label className="sr-only" htmlFor="season">
          Temporada
        </label>
        <select
          id="season"
          className="form-select"
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
        >
          {series.seasons?.map((s) => (
            <option key={s.id} value={s.season_number}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className="inline-empty" role="status">
          Cargando episodios…
        </p>
      ) : error ? (
        <div className="inline-empty" role="alert">
          <p>{error}</p>
          <button className="text-link" onClick={() => setRetry((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      ) : (
        season && (
          <>
            <div className="season-toolbar">
              <span>{season.episodes?.length || 0} episodios</span>
              <button className="text-link" onClick={() => setInfo(true)}>
                Sobre la temporada <Icon name="arrow" size={14} />
              </button>
            </div>
            {season.episodes?.length ? (
              season.episodes.map((ep) => (
                <button
                  key={ep.id}
                  className="episode-row"
                  onClick={() => setEpisode(ep)}
                >
                  <div className="episode-still">
                    <MediaImage
                      path={ep.still_path}
                      alt={ep.name}
                      sizes="140px"
                    />
                  </div>
                  <div>
                    <h3>
                      {ep.episode_number}. {ep.name}
                    </h3>
                    <p>{ep.overview || "Sin sinopsis disponible."}</p>
                    <small>
                      {duration(ep.runtime)}
                      <span className="meta-dot" />
                      {formatDate(ep.air_date)}
                    </small>
                  </div>
                  <Icon name="right" size={16} />
                </button>
              ))
            ) : (
              <p className="inline-empty">
                Aún no hay episodios publicados para esta temporada.
              </p>
            )}
          </>
        )
      )}
      {info && season && (
        <Modal title={season.name} onClose={() => setInfo(false)}>
          <div className="modal-body">
            <p>
              {season.overview ||
                "La sinopsis de esta temporada no está disponible."}
            </p>
            <p>
              Estreno: {formatDate(season.air_date)}.{" "}
              {season.episodes?.length || 0} episodios.
            </p>
            {season.poster_path && (
              <button
                className="text-link"
                onClick={() => {
                  setInfo(false);
                  onArt({
                    path: season.poster_path!,
                    title: season.name,
                    portrait: true,
                  });
                }}
              >
                Ampliar cartel
              </button>
            )}
            <VideoLinks
              videos={videos}
              onPlay={(v) => {
                setInfo(false);
                onPlay(v);
              }}
            />
            {partial && (
              <p>Parte del reparto o de los vídeos no se pudo consultar.</p>
            )}
            {!!credits?.cast?.length && (
              <>
                <h3>Reparto de la temporada</h3>
                <div className="crew-list">
                  {credits.cast.slice(0, 18).map((p) => (
                    <div key={p.id}>
                      <span>{p.name}</span>
                      <p>{p.roles?.map((r) => r.character).join(", ")}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!!credits?.crew?.length && (
              <>
                <h3>Equipo de la temporada</h3>
                <div className="crew-list">
                  {credits.crew.slice(0, 12).map((p, i) => (
                    <div key={`${p.id}-${i}`}>
                      <span>{p.name}</span>
                      <p>{p.job}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
      {episode && (
        <Modal
          title={`${episode.episode_number}. ${episode.name}`}
          onClose={() => setEpisode(null)}
        >
          <div className="modal-body">
            <p>{episode.overview || "Sin sinopsis disponible."}</p>
            <p>
              {duration(episode.runtime)}
              <span className="meta-dot" />
              {formatDate(episode.air_date)}
            </p>
            {episode.vote_count > 0 && (
              <p className="rating">
                Valoración: {episode.vote_average.toFixed(1)} / 10
              </p>
            )}
            {!!episode.guest_stars?.length && (
              <>
                <h3>Reparto invitado</h3>
                <p>
                  {episode.guest_stars
                    .map((p) => `${p.name} (${p.character})`)
                    .join(", ")}
                </p>
              </>
            )}
            {!!episode.crew?.length && (
              <>
                <h3>Equipo del episodio</h3>
                <p>
                  {episode.crew
                    .slice(0, 8)
                    .map((p) => `${p.name} (${p.job})`)
                    .join(", ")}
                </p>
              </>
            )}
            {mediaError ? (
              <p role="alert">
                {mediaError}{" "}
                <button
                  className="text-link"
                  onClick={() => setMediaRetry((n) => n + 1)}
                >
                  Reintentar
                </button>
              </p>
            ) : !media ? (
              <p role="status">Cargando imágenes y vídeos…</p>
            ) : (
              <>
                <VideoLinks
                  videos={media.videos}
                  onPlay={(v) => {
                    setEpisode(null);
                    onPlay(v);
                  }}
                />
                {media.stills.length ? (
                  <>
                    <h3>Imágenes del episodio</h3>
                    <div className="modal-gallery">
                      {media.stills.slice(0, 12).map((still) => (
                        <button
                          key={still.file_path}
                          aria-label="Ampliar imagen del episodio"
                          onClick={() => {
                            setEpisode(null);
                            onArt({
                              path: still.file_path,
                              title: episode.name,
                            });
                          }}
                        >
                          <MediaImage
                            path={still.file_path}
                            alt={episode.name}
                            backdrop
                            sizes="400px"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="provider-country">
                    No hay imágenes adicionales para este episodio.
                  </p>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}
