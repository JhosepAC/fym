# FyM (Find Your Movie)

[![Project Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)
[![Type](https://img.shields.io/badge/Type-Personal%20Project-blue?style=for-the-badge)](#)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-black?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-black?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-black?style=for-the-badge&logo=tailwind-css&logoColor=white)

> Movies and TV shows explorer with search, filters, and complete details integrated with The Movie Database (TMDB) API.

## 📋 Description

**FyM** is a modern web application to explore movies and TV shows catalog. Built with Next.js 16 and React 19, it uses the App Router for a Server Components-based architecture with hybrid rendering support.

### Key Features

- **Content Exploration**: Browse by categories (Trending, Popular, Top Rated, Upcoming, Now Playing)
- **Multi-domain Search**: Search movies, shows, and people simultaneously
- **Complete Details**: Extended info, credits, trailers, streaming providers
- **Advanced Filtering**: Genre filtering and custom sorting
- **Collections**: Movie collections viewing
- **Responsive Design**: Optimized for mobile and desktop
- **Advanced UX**: Loading skeletons, debounced search, auto-scroll in carousels

## 🚀 Tech Stack

| Technology | Version | Purpose |
|------------|---------|----------|
| [Next.js](https://nextjs.org) | 16.2.1 | React Framework with App Router |
| [React](https://react.dev) | 19.2.4 | UI Library |
| [TypeScript](https://www.typescriptlang.org) | 5.x | Static Typing |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Style Utilities |
| [TMDB API](https://www.themoviedb.org) | v3 | Data Source |

## 📁 Project Structure

```
fym/
├── public/                    # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── globals.css       # Global styles
│   │   ├── favicon.ico
│   │   ├── movies/          # Movies catalog
│   │   │   ├── page.tsx
│   │   │   ├── MoviesClient.tsx
│   │   │   └── loading.tsx
│   │   ├── series/          # TV Series catalog
│   │   │   ├── page.tsx
│   │   │   ├── SeriesClient.tsx
│   │   │   └── loading.tsx
│   │   ├── search/          # Search page
│   │   │   └── page.tsx
│   │   ├── movie/[id]/      # Movie details
│   │   │   └── page.tsx
│   │   ├── series/[id]/     # Series details
│   │   │   └── page.tsx
│   │   └── collection/[id]/  # Collection details
│   │       └── page.tsx
│   ├── components/          # React Components
│   │   ├── HeroBanner.tsx
│   │   ├── HeroBannerWrapper.tsx
│   │   ├── MovieCard.tsx
│   │   ├── MovieFilters.tsx
│   │   ├── MovieGrid.tsx
│   │   ├── MovieRow.tsx
│   │   ├── Navbar.tsx
│   │   └── SearchSkeleton.tsx
│   ├── hooks/               # Custom React Hooks
│   │   ├── useSearch.ts
│   │   └── useDebounce.ts
���   ├── lib/                 # Utilities and business logic
│   │   └── api/
│   │       ├── client.ts   # API Client + TypeScript interfaces
│   │       ├── config.ts   # Configuration and endpoints
│   │       └── index.ts    # Exports
│   └── types/               # TypeScript types
│       └── movie.ts
├── .env.local               # Environment variables
├── eslint.config.mjs        # ESLint configuration
├── next.config.ts          # Next.js configuration
├── package.json
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js 18.x or higher
- NPM, Yarn, PNPM or Bun

### Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd fym
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Configure environment variables**

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key   # Optional
```

> To get a TMDB API key, register at [themoviedb.org](https://www.themoviedb.org/settings/api).

4. **Run the development server**

```bash
npm run dev
```

5. **Open in browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Script | Description |
|--------|------------|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint |

## 🧩 Architecture

### Server Components

Main pages use Server Components for direct server-side data fetching:

```typescript
// src/app/page.tsx
async function getData() {
  const [trending, popular, topRated] = await Promise.all([
    apiClient.getTrending("movie"),
    apiClient.getMoviePopular(),
    apiClient.getMovieTopRated(),
  ]);
  return { trending, popular, topRated };
}
```

### Client Components

Interactive components that require state or effects:

- `Navbar`: Navigation with search
- `HeroBannerWrapper`: Auto-scrolling carousel
- `MovieRow`: Carousels with auto-scroll
- `MoviesClient/SeriesClient`: Client-side state for filters and infinite scroll
- `SearchSkeleton`: Loading states

### Custom Hooks

- **useSearch**: Hook for search with 500ms debounce and state management
- **useDebounce**: Utility to prevent excessive requests during typing

### Rendering Strategy

| Page | Strategy |
|--------|-------------|
| Home | SSR with cache (revalidate: 3600s) |
| Movies/Series | Initial SSR + CSR for interaction |
| Search | CSR (client-side search) |
| Details | SSR with related data |

## 📡 API Integration

### TMDB API v3

The project consumes The Movie Database API with the following implemented endpoints:

#### Movies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getTrending(mediaType)` | `/trending/{mediaType}/week` | Trending content |
| `getMoviePopular(page)` | `/movie/popular` | Popular movies |
| `getMovieTopRated(page)` | `/movie/top_rated` | Top rated movies |
| `getMovieUpcoming(page)` | `/movie/upcoming` | Upcoming movies |
| `getMovieNowPlaying(page)` | `/movie/now_playing` | Now in theaters |
| `getMovieDetails(id)` | `/movie/{id}` | Full details |
| `getMovieSimilar(id)` | `/movie/{id}/similar` | Similar movies |
| `getMovieCredits(id)` | `/movie/{id}/credits` | Cast and crew |
| `getMovieVideos(id)` | `/movie/{id}/videos` | Trailers and clips |
| `getMovieWatchProviders(id)` | `/movie/{id}/watch/providers` | Where to watch |
| `discoverMovies(genre, page, sortBy)` | `/discover/movie` | Discover by genre |

#### TV Shows

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getTvPopular(page)` | `/tv/popular` | Popular TV shows |
| `getTvTopRated(page)` | `/tv/top_rated` | Top rated TV shows |
| `getTvOnTheAir(page)` | `/tv/on_the_air` | Currently airing |
| `getTvDetails(id)` | `/tv/{id}` | Full details |
| `getTvSeasonDetails(id, season)` | `/tv/{id}/season/{season}` | Season details |

#### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| `searchMulti(query, page)` | `/search/multi` | Global search |
| `searchMovies(query, page)` | `/search/movie` | Search movies |
| `searchTvShows(query, page)` | `/search/tv` | Search TV shows |

### Image Configuration

```typescript
// src/lib/api/config.ts
export const IMAGE_SIZES = {
  poster: { small: "w185", medium: "w342", large: "w500", original: "original" },
  backdrop: { small: "w300", medium: "w780", large: "w1280", ultra: "original" },
  profile: { small: "w45", medium: "w185", large: "h632", original: "original" },
} as const;
```

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_TMDB_API_KEY` | ✅ | TMDB API Key |
| `NEXT_PUBLIC_OMDB_API_KEY` | ❌ | OMDB API Key (optional) |

> **Note**: API keys in `.env.local` are for development. For production, use secure environment variables on your hosting platform.

## 🎨 UI/UX

### Design System

- **Framework**: Tailwind CSS 4 with PostCSS
- **Theme**: Dark with red accents
- **Typography**: Geist (sans/mono) + Rubik Glitch (brand)
- **Effects**: Backdrop blur, smooth transitions, hover states

### Color Palette

| Color | Usage |
|-------|-------|
| `#1A1A1B` | Main background |
| `#FFFFFF` | Primary text |
| `#9CA3AF` | Secondary text |
| `#DC2626` (red-600) | Accents, actions |
| `#EF4444` (red-500) | Hover states |

### UI Components

- **HeroBanner**: Auto-scrolling carousel with background gradient
- **MovieRow**: Horizontal carousel with auto-scroll
- **MovieGrid**: Responsive card grid
- **MovieCard**: Card with poster, title and rating
- **Navbar**: Fixed navigation with search
- **SearchSkeleton**: Loading state skeletons
- **MovieFilters**: Genre and sorting filters

## 🏗️ Built With

- [Next.js](https://nextjs.org) - React framework
- [React](https://react.dev) - UI library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TMDB](https://www.themoviedb.org) - Data provider

---

## 📩 Contact & Socials

[![Portfolio](https://img.shields.io/badge/Portfolio-Check%20it%20out-black?style=for-the-badge&logo=googlechrome&logoColor=white)](https://jhosep-ac.pages.dev)
[![Instagram](https://img.shields.io/badge/Instagram-Follow%20Me-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/jh_slin)
[![Gmail](https://img.shields.io/badge/Gmail-Contact%20Me-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:jhosepjamil@gmail.com)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-WRITE%20ME-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/51978777386)

---

## 📄 License

MIT License - Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy of this software to deal in the Software without restriction.