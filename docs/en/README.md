# FyM — Find Your Movie

**English** · [Español](../es/README.md) · [Repository](../../README.md)

Discover films and series, find streaming providers and decide what to watch. FyM combines a real TMDB catalogue with a local watchlist and a personal movie roulette. The application interface is currently in Spanish; these documents are available in English and Spanish.

## Features

- Browse trending, popular, top-rated and upcoming films, plus TV series currently airing.
- Filter catalogues by genre, year and rating, change sorting and load more results. Catalogue filters are stored in the URL.
- Search films and series with debounced requests and content-type filters.
- Explore synopses, cast, crew, trailers, production details, collections, seasons and episodes.
- Select a country to check subscription, rental and purchase providers.
- Keep a local watchlist, mark titles as watched, and search or sort your library.
- Open **Elige por mí** (Choose for me) to combine up to four genres and three cast members with years, rating and runtime. Prioritize popularity, rating or recent releases and request 6, 9 or 12 candidates.
- Build a roulette from suggestions, title searches or pending films in your watchlist. Remove candidates, spin and save the winner.
- Use responsive layouts, keyboard navigation, visible focus, native dialogs, reduced motion and explicit loading, error and empty states.

## Technology

| Layer       | Implementation                                           |
| ----------- | -------------------------------------------------------- |
| Application | Next.js 16.2.1 App Router, React 19.2.4, TypeScript      |
| Styling     | Tailwind CSS 4, custom CSS and Inter through `next/font` |
| Data        | TMDB, server components and restricted local API routes  |
| Persistence | Browser `localStorage`; no account or database           |
| Quality     | ESLint, TypeScript and Node's native test runner         |

## Local setup

Use **Node.js 24** and npm. Node 24 is recommended because the tests import TypeScript through the native runtime.

```bash
git clone https://github.com/JhosepAC/fym.git
cd fym
npm ci
```

Create `.env.local` in the project root:

```dotenv
TMDB_API_KEY=your_tmdb_api_key
```

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). Keep the environment file private. Credentials are consumed by server-only modules; interactive requests use local routes. The legacy `NEXT_PUBLIC_TMDB_API_KEY` variable is accepted by the server for compatibility, but new installations should use `TMDB_API_KEY`.

## Commands and checks

| Command         | Purpose                                                 |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Development server                                      |
| `npm run build` | Production build and sitemap postbuild                  |
| `npm run start` | Serve the production build                              |
| `npm run lint`  | ESLint checks                                           |
| `npm test`      | Domain tests; API integration tests run when configured |

For production, run `npm run build`, then `npm run start`.

The suite covers media identity, incomplete metadata, preference validation, public data projection, malformed storage, random selection and roulette geometry. To enable the three integration tests, first run an application instance with valid TMDB credentials, then set its URL in another terminal:

```powershell
$env:FYM_TEST_URL = "http://localhost:3000"
npm test
```

```bash
FYM_TEST_URL=http://localhost:3000 npm test
```

Without this variable, integration tests are skipped. Successful historical checks are recorded in [Architecture](ARCHITECTURE.md); they do not replace rerunning checks after a change.

## Project structure

```text
fym/
├── docs/en/                     English documentation
├── docs/es/                     Spanish documentation
├── public/fym-logo.svg          Custom vector wordmark
├── src/app/                     Pages, metadata and API routes
├── src/components/              Shared UI and product flows
├── src/components/decision/     Preferences, candidates and roulette
├── src/lib/api/                 Typed client and server-only credentials
├── src/lib/media.ts             Media identity and shared metadata
├── src/lib/decision.ts          Validation, storage and wheel geometry
├── src/lib/decision-server.ts   Server-side candidate selection
└── tests/                       Domain and opt-in integration tests
```

## Documentation

| Topic                                | English                         | Español                               |
| ------------------------------------ | ------------------------------- | ------------------------------------- |
| Setup and features                   | [Guide](README.md)              | [Guía](../es/README.md)               |
| Architecture and security boundaries | [Architecture](ARCHITECTURE.md) | [Arquitectura](../es/ARCHITECTURE.md) |
| Visual system                        | [Design](DESIGN.md)             | [Diseño](../es/DESIGN.md)             |
| Product scope                        | [Product](PRODUCT.md)           | [Producto](../es/PRODUCT.md)          |

Update both language versions together. Root context files link to these guides and remain available to repository tooling.

## Gitflow and contributions

`master` is the publication line and `develop` integrates work. Create `feature/<name>` from `develop`, use signed Conventional Commits, run relevant checks, and open a PR against `develop`. Integrate with a merge commit. Use `release/<version>` to prepare releases and `hotfix/<name>` for urgent production fixes. Never commit credentials, private keys or local environment files.

Report reproducible bugs or propose improvements through [GitHub Issues](https://github.com/JhosepAC/fym/issues). Include the route, steps, expected result and relevant device details; omit secrets.

## Persistence and limitations

Watchlist and roulette data are stored in this browser under `fym-library-v1` and `fym-decision-wheel-v1`. Clearing browser data deletes them. There is no account, cloud backup or device synchronization. Roulette candidates do not synchronize across tabs.

The wheel accepts 2–12 unique films, each with equal probability. Discovery samples up to the first five pages returned for the selected priority (up to 100 results); it is not a uniform sample of the entire TMDB catalogue. Suggestions exclude future releases and films with fewer than 100 votes. FyM does not play films or sell subscriptions. Streaming availability may change.

## Author and attribution

Developed by **[Jhosep Argomedo](https://jhosep-ac.pages.dev/)** · [GitHub](https://github.com/JhosepAC).

Data, ratings and images come from TMDB and belong to their respective owners. This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability comes from TMDB/JustWatch; trailers are embedded from YouTube. The repository currently has no `LICENSE` file; a specific license grant is not asserted here.
