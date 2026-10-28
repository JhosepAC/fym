<div align="center">

# FyM — Find Your Movie

**Discover your next story. Build your watchlist. Let movie night decide.**

[![Live demo](https://img.shields.io/badge/Demo-Visit_FyM-dc283a?style=for-the-badge)](https://fym-jac.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Live demo](https://fym-jac.vercel.app) · [Report a bug](https://github.com/JhosepAC/fym/issues) · [Suggest a feature](https://github.com/JhosepAC/fym/issues)

**[English documentation](docs/en/README.md) · [Documentación en español](docs/es/README.md)**

</div>

## Overview

FyM is a film and TV discovery application built by **[Jhosep Argomedo](https://jhosep-ac.pages.dev/)**. Browse real TMDB data, compare details and viewing providers, organize a personal library, and turn a shortlist into a decision with a movie roulette.

The product uses a custom SVG identity and a black, white and red interface. The application UI is currently in Spanish; project documentation is available in both English and Spanish.

## Highlights

| Explore                                           | Organize                                            | Decide                                            |
| ------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Trending titles, remote filters and search        | Browser-local watchlist with pending/watched states | Genre, cast, year, runtime and rating preferences |
| Cast, trailers, collections, seasons and episodes | Local search, sorting and persistent saves          | 6, 9 or 12 suggested candidates                   |
| Streaming providers by country                    | No account required                                 | Custom roulette from searches or pending films    |

Responsive layouts, keyboard navigation, visible focus and reduced-motion support are built into the main flows. Credentials stay in server-only modules; interactive catalogue requests use restricted local API routes.

## Tech stack

**Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · TMDB**

App Router and server components provide initial data. Client components manage search, filters, the local library and roulette. ESLint, TypeScript and Node's test runner support validation. See [Architecture](docs/en/ARCHITECTURE.md) for boundaries and tradeoffs.

## Getting started

Use **Node.js 24** and npm.

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

Open [localhost:3000](http://localhost:3000). Keep credentials out of source control. For production, run `npm run build`, then `npm run start`.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

Domain tests cover media identity, preference validation, public fields, storage and roulette geometry. Three live API tests are opt-in: run a configured application and set `FYM_TEST_URL` before `npm test`. See [test commands for PowerShell and POSIX shells](docs/en/README.md#commands-and-checks).

## Project structure

```text
fym/
├── docs/
│   ├── en/               English guides
│   └── es/               Spanish guides
├── public/               Static assets and custom SVG logo
├── src/
│   ├── app/              Pages, metadata and local API routes
│   ├── components/       Shared UI and product flows
│   └── lib/              Typed data access and domain logic
└── tests/                Domain and opt-in API tests
```

## Documentation

| Guide                                           | English                         | Español                         |
| ----------------------------------------------- | ------------------------------- | ------------------------------- |
| Features, setup and contribution workflow       | [Read](docs/en/README.md)       | [Leer](docs/es/README.md)       |
| Architecture, data flow and security boundaries | [Read](docs/en/ARCHITECTURE.md) | [Leer](docs/es/ARCHITECTURE.md) |
| Design system and interaction patterns          | [Read](docs/en/DESIGN.md)       | [Leer](docs/es/DESIGN.md)       |
| Product scope and principles                    | [Read](docs/en/PRODUCT.md)      | [Leer](docs/es/PRODUCT.md)      |

Keep both languages aligned when changing behavior. Root context files remain as English entry points for repository tooling.

## Development workflow

Use Gitflow: branch `feature/<name>` from `develop`, make signed Conventional Commits, run relevant checks, and open a PR against `develop`. Integrate with a merge commit. `master` is the publication line; `release/<version>` and `hotfix/<name>` cover release preparation and urgent fixes.

## Limits and attribution

The library and roulette persist only in this browser; clearing its data removes them. There is no account, cloud backup or device synchronization. Each selected roulette candidate has equal probability. Suggested films come from a prioritized sample of up to 100 results, not a uniform draw from all of TMDB. FyM does not stream films or sell subscriptions.

Data and images come from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB. Provider availability is supplied through TMDB/JustWatch; trailers use YouTube. No `LICENSE` file is currently included in this repository.

## Author

Developed by **[Jhosep Argomedo](https://jhosep-ac.pages.dev/)** · [GitHub](https://github.com/JhosepAC) · [Issues and ideas](https://github.com/JhosepAC/fym/issues).
