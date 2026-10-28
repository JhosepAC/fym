---
name: FyM — Find Your Movie
description: Films, series and your next movie night in a compact black catalogue.
colors:
  ground: "#000"
  surface: "#111"
  raised: "#2a2a2a"
  border: "#252525"
  control: "#444"
  text: "#fff"
  muted: "#b4b4b4"
  faint: "#949494"
  brand: "#dc283a"
  accent: "#ff7b83"
  negative: "#ff9d9d"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  metadata:
    fontFamily: "Inter, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  thumbnail: "4px"
  poster: "8px"
  utility: "12px"
  panel: "16px"
  pill: "99px"
  circle: "50%"
spacing:
  tight: "8px"
  compact: "12px"
  small: "16px"
  medium: "20px"
  panel: "22px"
  large: "24px"
  wide: "32px"
  gutter: "48px"
components:
  button-primary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 17px"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 17px"
  button-decision:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 17px"
    height: "42px"
  input-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.poster}"
    padding: "0 12px"
  chip-genre:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "8px 17px"
  chip-genre-selected:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    padding: "8px 17px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "22px"
  movie-poster:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.poster}"
  navigation:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
---

# Design System: FyM — Find Your Movie

The maintained visual system is documented in [English](docs/en/DESIGN.md) and [Spanish](docs/es/DESIGN.md). The token block above remains available to design tooling.

Preserve true black, neutral surfaces, Inter, white text and functional red. The custom SVG wordmark is shared by header and footer. Decision actions are prominent red pills. Use real TMDB posters, visible focus, native controls, explicit empty/error states and reduced motion. The three-area decision workspace separates preferences, candidates and the local roulette.
