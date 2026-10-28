---
version: 1
slug: "src-app-decide-page-tsx"
primary_target: "src/app/decide/page.tsx"
related_targets: ["src/components/decision/DecisionStudio.tsx", "src/components/decision/MovieWheel.tsx"]
---

# Elige por mí
Modo: Operate. Extensión del sistema existente y flujo concretado por el usuario; sin reemplazo de identidad ni torneo de direcciones. El usuario fija negro, blanco y rojo como marca.

## Direction contract
THESIS: Reducir la indecisión desde preferencias reales hasta una selección de películas y una decisión visible.
OWN-WORLD: Negro #000, superficies #111/#2a2a2a, blanco, rojo de marca #e53945 y rojo claro #ff7b83 para texto/foco; Inter y carteles auténticos. Se hereda True-black flat con paleta fijada por el usuario.
STORY: Filtrar por géneros, reparto, años, duración y valoración; comparar una selección aleatoria; añadir o quitar candidatas y girar con igualdad de oportunidades. También buscar películas o usar pendientes para una ruleta propia.
FIRST VIEWPORT: Navegación con Elige por mí; título compacto; dos modos; preferencias en columna izquierda, cartelera al centro y ruleta a la derecha. En móvil, filtros plegables y acceso explícito a la ruleta.
FORM: Mesa de selección de cineclub. Decisión concreta delegada por el usuario; se hereda seed:7245c5df33f87fb6, composición propia de esta extensión. La firma es una ruleta construida a partir de títulos reales cuyo resultado geométrico y ganador coinciden.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Datos y estados
Sin datos de muestra: catálogo y reparto públicos de TMDB. Credenciales solo en servidor. Selección aleatoria dentro de una muestra declarada de hasta 100 resultados, sin afirmar aleatoriedad uniforme sobre todo el catálogo. Ruleta de2–12 películas con identidad única y selección persistente en este navegador. Generación, errores, cero coincidencias, búsquedas vacías, límite y movimiento reducido explícitos.

## Composición considerada
Panel único con filtros arriba: comprime ruleta; asistente por pasos: oculta el catálogo; mesa de tres áreas: permite comparar y modificar antes de decidir (elegida). En teléfono se apilan sin ocultar funciones.

