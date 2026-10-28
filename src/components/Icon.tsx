import type { CSSProperties } from "react";
export type IconName =
  | "search"
  | "plus"
  | "check"
  | "arrow"
  | "left"
  | "right"
  | "play"
  | "close"
  | "menu"
  | "bookmark"
  | "film"
  | "star"
  | "shuffle"
  | "filter"
  | "external"
  | "trash";
const paths: Record<IconName, string> = {
  search: "m21 21-4.5-4.5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
  plus: "M12 5v14M5 12h14",
  check: "m5 12 4 4L19 6",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  left: "m15 5-7 7 7 7",
  right: "m9 5 7 7-7 7",
  play: "m9 5 11 7-11 7V5Z",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  film: "M3 3h18v18H3V3ZM7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z",
  shuffle: "M3 5h4l10 14h4m-4-4 4 4-4 3M3 19h4L17 5h4m-4-3 4 3-4 4",
  filter: "M4 6h16M7 12h10M10 18h4",
  external: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
};
export default function Icon({
  name,
  size = 18,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
