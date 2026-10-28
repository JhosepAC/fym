"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  secureRandomIndex,
  wheelRotation,
  type DecisionMovie,
} from "@/lib/decision";
import Icon from "../Icon";
import MediaImage from "../MediaImage";
import { SaveButton } from "../LibraryProvider";

function point(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return [160 + radius * Math.sin(radians), 160 - radius * Math.cos(radians)];
}
export default function MovieWheel({
  movies,
  ready,
  spinning,
  onSpinningChange,
  onRemove,
  onClear,
}: {
  movies: DecisionMovie[];
  ready: boolean;
  spinning: boolean;
  onSpinningChange: (value: boolean) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<DecisionMovie | null>(null);
  const [resultFor, setResultFor] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const visibleWinner =
    winner && resultFor === movies.map((movie) => movie.id).join(",")
      ? winner
      : null;
  function spin() {
    if (spinning || movies.length < 2 || !ready) return;
    const index = secureRandomIndex(movies.length);
    const snapshot = movies[index];
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setWinner(null);
    onSpinningChange(true);
    setRotation((current) => wheelRotation(current, index, movies.length));
    timer.current = setTimeout(
      () => {
        setWinner(snapshot);
        setResultFor(movies.map((movie) => movie.id).join(","));
        onSpinningChange(false);
        timer.current = null;
      },
      reduced ? 100 : 4300,
    );
  }
  return (
    <aside
      className="wheel-panel"
      id="movie-wheel"
      aria-labelledby="wheel-heading"
    >
      <div className="decision-section-heading">
        <div>
          <h2 id="wheel-heading">Tu ruleta</h2>
          <p>{movies.length} de 12 películas</p>
        </div>
        {movies.length > 0 && (
          <button
            className="text-link"
            onClick={onClear}
            disabled={spinning || !ready}
          >
            Vaciar
          </button>
        )}
      </div>
      <div className={`wheel-stage ${spinning ? "is-spinning" : ""}`}>
        <svg className="wheel-pointer" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3h18L12 22Z" fill="currentColor" />
        </svg>
        <div
          className="wheel-rotor"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg
            className="wheel-svg"
            viewBox="0 0 320 320"
            role="img"
            aria-label={`Ruleta con ${movies.length} películas. Cada número corresponde a la lista inferior.`}
          >
            <circle
              cx="160"
              cy="160"
              r="147"
              fill="var(--surface)"
              stroke="var(--control)"
            />
            {movies.map((movie, index) => {
              const slice = 360 / movies.length;
              const [x1, y1] = point(index * slice - slice / 2, 145);
              const [x2, y2] = point(index * slice + slice / 2, 145);
              const [tx, ty] = point(index * slice, 105);
              const fill =
                visibleWinner?.id === movie.id
                  ? "var(--brand)"
                  : index % 2
                    ? "var(--raised)"
                    : "#1b1b1b";
              return (
                <g key={movie.id}>
                  <title>
                    {index + 1}. {movie.title}
                  </title>
                  <path
                    d={
                      movies.length === 1
                        ? "M160 15A145 145 0 1 1 159.99 15Z"
                        : `M160 160L${x1} ${y1}A145 145 0 ${slice > 180 ? 1 : 0} 1 ${x2} ${y2}Z`
                    }
                    fill={fill}
                    stroke="var(--ground)"
                    strokeWidth="2"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="var(--text)"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="19"
                    fontWeight="500"
                    transform={`rotate(${index * slice},${tx},${ty})`}
                  >
                    {index + 1}
                  </text>
                </g>
              );
            })}
            <circle cx="160" cy="160" r="28" fill="var(--brand)" />
            <text
              x="160"
              y="161"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="600"
            >
              FyM.
            </text>
          </svg>
        </div>
        {movies.length === 0 && (
          <div className="wheel-empty">
            <span>Tu próxima película</span>
            <p>Añade al menos 2 opciones para girar.</p>
          </div>
        )}
      </div>
      <button
        className="button decision-primary spin-button"
        onClick={spin}
        disabled={spinning || movies.length < 2 || !ready}
      >
        <Icon name="shuffle" size={17} />
        {spinning ? "Decidiendo…" : "Girar la ruleta"}
      </button>
      <p className="wheel-fairness">
        {movies.length >= 2
          ? `Todas tienen la misma probabilidad: 1 entre ${movies.length}.`
          : "Elige tus candidatas en el catálogo."}
      </p>
      <div
        className="wheel-result"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {spinning ? (
          <p>La ruleta está girando. Ya casi tenemos película.</p>
        ) : visibleWinner ? (
          <>
            <span className="winner-label">Hoy toca ver</span>
            <div className="winner-movie">
              <div className="winner-poster">
                <MediaImage
                  path={visibleWinner.poster_path}
                  alt={`Cartel de ${visibleWinner.title}`}
                  sizes="68px"
                />
              </div>
              <div>
                <h3>{visibleWinner.title}</h3>
                <p>
                  {visibleWinner.release_date?.slice(0, 4) || "Sin fecha"}
                  {visibleWinner.vote_count > 0
                    ? ` · ${visibleWinner.vote_average.toFixed(1)} / 10`
                    : ""}
                </p>
              </div>
            </div>
            <div className="button-row">
              <Link
                className="button button-primary"
                href={`/movie/${visibleWinner.id}`}
              >
                Ver ficha <Icon name="arrow" size={14} />
              </Link>
              <SaveButton item={visibleWinner} />
            </div>
          </>
        ) : null}
      </div>
      {movies.length > 0 && (
        <ol className="wheel-list" aria-label="Películas en la ruleta">
          {movies.map((movie, index) => (
            <li
              key={movie.id}
              className={
                visibleWinner?.id === movie.id ? "wheel-winner-row" : ""
              }
            >
              <span className="wheel-index">{index + 1}</span>
              <Link href={`/movie/${movie.id}`}>{movie.title}</Link>
              <button
                className="icon-button"
                aria-label={`Quitar ${movie.title} de la ruleta`}
                disabled={spinning}
                onClick={() => onRemove(movie.id)}
              >
                <Icon name="close" size={13} />
              </button>
            </li>
          ))}
        </ol>
      )}
      <p className="wheel-storage-note">
        Tu ruleta se guarda en este navegador.
      </p>
    </aside>
  );
}
