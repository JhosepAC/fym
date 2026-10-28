# FyM — Product

**English** · [Español](../es/PRODUCT.md) · [Documentation](README.md)

## Purpose and users

Help people discover films and series, compare their details, find viewing providers and decide what to watch. The intended audience is inferred from the application's discovery, detail and watchlist flows. The requested quality is a coherent, complete software engineering graduation project.

## Platform and capabilities

Web application built with Next.js 16, React 19, TypeScript and Tailwind 4. Preserve real TMDB catalogues, search, filters, film and series details, seasons, episodes, collections, cast, trailers and country-specific providers.

The personal library supports pending and watched titles. **Elige por mí** combines genre, cast, year, rating, runtime and priority filters with suggested candidates and a personal roulette. Users can search for their own films or import pending library items. Both collections persist locally.

## Constraints and evidence

- No authentication, cloud storage or synchronization between devices.
- Credentials and authenticated TMDB requests remain on the server.
- Use actual TMDB data and images; never invent ratings, availability or catalogue content.
- Show understandable failures and empty states; allow provider-country selection.
- Explain bounded discovery sampling and equal probabilities within the selected roulette.
- The product UI is Spanish. Bilingual documentation does not imply application localization.

## Brand commitments

FyM / Find Your Movie uses the explicitly requested black, white and red palette. Its custom SVG wordmark uses F/y/M letterforms and a red projection cut. The decision tool is available from the home page and navigation, with a prominent red action. The footer credits Jhosep Argomedo and links to his portfolio.

## Principles

- Connect discovery, evaluation, saving and decision-making.
- Present real data and actionable error states.
- Keep navigation consistent and accessible on mobile and desktop.
- Use reusable components and maintain both documentation languages.
