# FyM — Design system

**English** · [Español](../es/DESIGN.md) · [Documentation](README.md)

## Direction

“Cineclub selection” is the guiding idea: recognizable stories, compact editing, true black, neutral surfaces, white text and functional red. Real posters carry the photography; the interface supports discovery, evaluation, saving and deciding. Preserve the existing flat system across home, catalogues, search, library, details and the decision workspace.

The custom `public/fym-logo.svg` contains vector F/y/M letterforms and a red projection cut below the F. It requires no installed font. `Logo` shares it between navigation and footer. The footer uses brief TMDB attribution and a linked credit to Jhosep Argomedo.

## Tokens

| Role        | Value     | Use                                     |
| ----------- | --------- | --------------------------------------- |
| Ground      | `#000`    | Page and navigation                     |
| Surface     | `#111`    | Panels, filters and search              |
| Raised      | `#2a2a2a` | Secondary actions, counters and notices |
| Border      | `#252525` | Functional separators                   |
| Control     | `#444`    | Input outlines                          |
| Text        | `#fff`    | Primary text and white actions          |
| Muted       | `#b4b4b4` | Descriptions and inactive navigation    |
| Faint       | `#949494` | Dates and secondary notes               |
| Brand       | `#dc283a` | Identity and decision actions           |
| Interaction | `#ff7b83` | Focus and state text                    |
| Negative    | `#ff9d9d` | Explicit error messages                 |

Brand red marks generation, spinning, selected candidates, the wheel centre, pointer and winner. The prominent navigation and home actions for **Elige por mí** also use red; hover uses `#b91e2e`. Ratings remain white. Errors use their semantic token rather than decorative color.

## Typography

Inter is loaded through `next/font/google` in `src/app/layout.tsx`, using the Latin subset and `--font-inter`. No second family is used.

| Role          | Size / weight | Treatment                                                  |
| ------------- | ------------- | ---------------------------------------------------------- |
| Display       | 30px / 600    | 1.12 leading, -0.035em tracking; 27/26px at smaller widths |
| Headline      | 28px / 600    | 1.2 leading, -0.035em; 24px on mobile                      |
| Section title | 20px / 600    | 1.3 leading, -0.025em; 18px on mobile                      |
| Body          | 14px / 400    | 1.5 leading                                                |
| Label         | 13px / 500    | Sentence case                                              |
| Metadata      | 12px / 400    | 1.5 leading; tabular rating/count figures                  |

Detail titles use 32/28/24px. Compact panels use 16px headings; decision-area headings use 18px, dropping to 17px below 1250px. Decision helper text, genres, sample provenance and roulette-list titles use 13px; auxiliary wheel notes and poster actions use 12px. Candidate titles use 13px, rising to 14px on mobile, with a two-line limit. Some dense detail/cast/episode metadata uses 11px. Detail synopsis measure is capped at 75 characters.

## Layout and responsive behavior

The shared container is centred with a 1440px maximum, increasing to 1536px from 1600px viewports. Horizontal padding is 48px, 32px below 1150px and 20px below 650px. Sticky navigation heights are 80/70/64px. Catalogue grids and horizontal poster rows have six items with 20px gaps, then five below 1150px, four below 900px and two below 650px. Mobile gaps are 16px. Rows retain intentional horizontal scrolling; grids continue vertically.

Main home panels stack at 900px. The side recommendation panel disappears there, while a compact decision entry stays available. Below 650px the hero image sits above text at a 2.1 ratio. Desktop navigation and search become a mobile menu with a search destination. Detail posters shrink to 90px and metadata/providers reflow.

`/decide` has a 1600px maximum and three independent task areas: preferences, candidates and roulette. Columns are 270px / flexible / 318px, with 28px gaps; at 1600px they become 290px / flexible / 340px with 32px gaps. Below 1250px side columns become 230px and 280px with 20px gaps. Below 1000px preferences spans the full width and folds; candidates and roulette remain alongside each other. Below 650px all areas stack, the wheel stops being sticky, and **Ir a mi ruleta** jumps to it. The wheel panel is centred, at most 460px wide, with a wheel up to 320px. Candidate grids use 3 columns, 2 below 1250px, 3 below 1000px and 2 below 800px.

Common spacing is 8, 12, 16, 20, 24 and 32px; sections use 38px desktop and 30px mobile separation. Panel padding ranges from 20–30px, commonly 22px. This is not a universal four-pixel grid.

## Shape, imagery and depth

Main panels/dialogs use 16px corners; posters, cast photos, episode images and fields use 8px. Utility filters/notices use 12px, recommendation thumbnails 4px, pill actions 99px, and circular actions 50%. Posters use 2:3 crops with `object-fit: cover`; enlarged images use `contain`. Missing/failed images use an explicit neutral film-icon fallback. Never invent a poster or rating to fill a space.

Depth comes from tone, spacing, cropping and functional outlines. There are no ornamental shadows, gradients, glows or backdrop blur. The native dialog uses a control border and `rgb(0 0 0 / 0.85)` backdrop.

## Components and interaction

### Actions and navigation

General primary actions are white with black text; secondary actions use raised neutral with white text. They share pill shape, 8px icon gaps, 17px horizontal padding and at least 38px height, increasing to 44px on mobile. The featured variant uses 36px height/14px padding, then 40px/18px on mobile. Decision generation/spin actions are red and at least 42px, or 44px mobile. The home decision action is 44px. Visible focus is a 2px light-red outline with 5px offset.

The header uses the shared vector wordmark, neutral destinations and a prominent red decision action. **Mi lista** retains its accessible name even when its visual label is hidden, and shows a count when nonempty. Mobile uses a labelled menu button. Catalogue tabs use a white underline; decision modes use a red underline and `aria-pressed`.

### Posters, fields and search

Posters sit directly on the page without decorative cards, borders or shadows. Titles clamp to two lines; dates, types and ratings share metadata rows. Save controls remain visible, while the circular detail link appears on hover/focus. Static neutral skeletons retain real poster proportions.

Native inputs/selects use surface backgrounds, control borders, 8px corners and visible labels. General fields are at least 38px (42px mobile). Decision fields are at least 40px (44px mobile), with 11px horizontal padding and 13px labels. Years use two columns. Cast search shows portraits, names and known titles, capped at three selected people. Navigation search is a 40px pill with a Ctrl K hint. Main search is 54px high with 12px corners. Custom-wheel search is 46px high with a labelled clear action and a 2px focus outline offset by 3px.

### Decision workspace

Two modes separate preference-based discovery from custom roulette building. Preferences include up to four genres (any/all), three cast members, years, runtime, rating, priority and candidate count. Visible provenance explains a prioritized sample of up to 100 results rather than uniform catalogue sampling.

Candidate cards show real posters, years, ratings and titles. The add control is a black 30px circle (36px mobile), turning red when selected, plus an explicit text action. Users can add/remove individually, use all candidates or refresh suggestions. Refreshing preserves the existing wheel unless the user explicitly replaces it.

Custom mode searches titles or imports pending library films. The local wheel holds up to 12 unique movies, needs at least two to spin and declares equal probabilities. Neutral SVG segments have numbers matching a removable ordered title list. The centre and pointer are red; the winning segment turns red and geometrically matches the pointer. The result includes poster, metadata, detail link and save action. Candidate changes invalidate the old result; spinning blocks edits.

### Feedback and dialogs

Empty results explain how to broaden preferences or check a title; actor search suggests a full name. Generation/search failures support retry. Storage failures use understandable notices. Empty and one-item wheels explain the next step; the 12-item limit asks users to remove a movie. Updates and winners use polite status regions; errors use alerts.

Native dialogs are at most 900px wide and 90dvh high, with 16px minimum margins. They trap focus, close on Escape, block background scroll and restore focus. Videos use 16:9. Toasts appear centred 24px above the bottom on raised neutral with 12px corners.

## Motion

Actions press to 0.97 scale and hover to 0.85 opacity, with 160ms `cubic-bezier(0.23, 1, 0.32, 1)` transitions. Posters scale to 1.035 over 300ms; decision posters use 1.025 over 260ms. Roulette rotation lasts 4200ms with `cubic-bezier(0.12, 0.7, 0.08, 1)` and announces the result afterward. Reduced motion removes transitions and reveals the winner after 100ms.

## Rules to preserve

- Keep true black, neutral layers, Inter and the approved white/red identity.
- Use real dynamic TMDB imagery, public data and explicit fallbacks.
- Keep labels, native controls, keyboard access, responsive behavior and reduced motion.
- Declare sampling, local persistence, limits, empty states and errors honestly.
- Do not reintroduce amber branding, ornamental shadows or legacy `MovieFilters` shadows.
- Do not add decorative typefaces, invented ratings/availability or semantic error colors as decoration.

The root `DESIGN.md` retains machine-readable tokens. The existing `.impeccable/design.json` sidecar supports design tooling; these guides document the human-facing system.
