"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { MediaItem } from "@/lib/api";
import { mediaKey, mediaTitle } from "@/lib/media";
import Icon from "./Icon";
export type LibraryEntry = {
  item: MediaItem;
  status: "pending" | "watched";
  addedAt: string;
};
type LibraryContextType = {
  entries: LibraryEntry[];
  ready: boolean;
  save: (item: MediaItem) => void;
  remove: (item: MediaItem) => void;
  setStatus: (item: MediaItem, status: LibraryEntry["status"]) => void;
};
const LibraryContext = createContext<LibraryContextType | null>(null);
const STORAGE_KEY = "fym-library-v1";
export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    function read() {
      try {
        const data: unknown = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]",
        );
        if (Array.isArray(data))
          setEntries(
            data.filter(
              (e): e is LibraryEntry =>
                e &&
                Number.isInteger(e.item?.id) &&
                (e.status === "pending" || e.status === "watched") &&
                typeof e.addedAt === "string",
            ),
          );
      } catch {
        setMessage("No se pudo leer tu lista guardada en este navegador.");
      }
      setReady(true);
    }
    read();
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) read();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);
  const commit = useCallback((next: LibraryEntry[], notice: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setEntries(next);
      setMessage(notice);
    } catch {
      setMessage(
        "No se pudo guardar. Comprueba el espacio y los permisos del navegador.",
      );
    }
  }, []);
  const save = (item: MediaItem) => {
    if (!ready || entries.some((e) => mediaKey(e.item) === mediaKey(item)))
      return;
    commit(
      [
        { item, status: "pending", addedAt: new Date().toISOString() },
        ...entries,
      ],
      `${mediaTitle(item)} se guardó en tu lista.`,
    );
  };
  const remove = (item: MediaItem) =>
    commit(
      entries.filter((e) => mediaKey(e.item) !== mediaKey(item)),
      `${mediaTitle(item)} se quitó de tu lista.`,
    );
  const setStatus = (item: MediaItem, status: LibraryEntry["status"]) =>
    commit(
      entries.map((e) =>
        mediaKey(e.item) === mediaKey(item) ? { ...e, status } : e,
      ),
      status === "watched" ? "Marcada como vista." : "Movida a pendientes.",
    );
  return (
    <LibraryContext.Provider
      value={{ entries, ready, save, remove, setStatus }}
    >
      {children}
      <div
        className={`toast ${message ? "toast-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message && (
          <>
            <Icon name="check" />
            <span>{message}</span>
          </>
        )}
      </div>
    </LibraryContext.Provider>
  );
}
export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("LibraryProvider is required");
  return ctx;
}
export function SaveButton({
  item,
  compact = false,
}: {
  item: MediaItem;
  compact?: boolean;
}) {
  const { entries, ready, save, remove } = useLibrary();
  const saved = entries.some((e) => mediaKey(e.item) === mediaKey(item));
  return (
    <button
      className={compact ? "save-icon" : "button button-secondary"}
      disabled={!ready}
      onClick={() => (saved ? remove(item) : save(item))}
      aria-pressed={saved}
      aria-label={`${saved ? "Quitar de mi lista" : "Guardar en mi lista"}: ${mediaTitle(item)}`}
      title={saved ? "Quitar de mi lista" : "Guardar en mi lista"}
    >
      <Icon name={saved ? "check" : "plus"} />
      {!compact && (saved ? "En mi lista" : "Mi lista")}
    </button>
  );
}
