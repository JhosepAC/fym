# Arquitectura de FyM

## Alcance

FyM es una aplicación de descubrimiento de cine y series. Permite explorar un catálogo externo, evaluar una ficha y organizar una biblioteca personal en el navegador. No reproduce películas ni ofrece cuentas, pagos o sincronización entre dispositivos.

## Flujo de datos

```mermaid
flowchart LR
  TMDB[API TMDB] --> Server[Server Components y caché de Next.js]
  Server --> Home[Inicio y catálogos iniciales]
  Browser[Componentes interactivos] --> Proxy[GET /api/tmdb/...]
  Proxy --> TMDB
  Browser <--> Library[LibraryProvider]
  Library <--> Storage[localStorage fym-library-v1]
```

`src/lib/api/client.ts` contiene los contratos tipados y las operaciones del catálogo. El navegador consulta únicamente la ruta local. `src/lib/api/server.ts`, protegido con `server-only`, instancia el cliente con credenciales para los componentes de servidor. La clave recomendada es `TMDB_API_KEY`; la variable antigua se acepta exclusivamente en módulos de servidor.

La ruta de consulta permite únicamente un conjunto explícito de endpoints públicos de lectura. No acepta destinos arbitrarios ni reenvía claves enviadas por el navegador. Tiene tiempo límite, normaliza fallos del proveedor y conserva el estado 404. Las respuestas correctas se almacenan en caché durante una hora. La disponibilidad puede cambiar dentro de ese intervalo.

## Superficies y responsabilidades

| Ruta | Responsabilidad |
| --- | --- |
| `/` | Selección destacada, tendencias, series, recomendaciones y elección aleatoria |
| `/movies`, `/series` | Catálogo, categorías, filtros remotos y paginación explícita |
| `/search` | Búsqueda con debounce, tipo de contenido y más resultados |
| `/watchlist` | Pendientes, vistas, búsqueda y orden local |
| `/movie/[id]`, `/series/[id]` | Ficha, vídeos, reparto, equipo y proveedores por país |
| `/collection/[id]` | Películas de una colección ordenadas por estreno o valoración |

`Catalog` reutiliza el flujo de películas y series. `MediaDetails` comparte la estructura de las fichas; `Seasons` concentra temporada, episodios y material adicional. Los carteles, carruseles, estados de carga, navegación, diálogos e iconos tienen componentes comunes.

## Consistencia y concurrencia

- Las entidades se identifican por tipo e ID: `movie-42` y `tv-42` son diferentes.
- Las páginas adicionales se deduplican antes de incorporarse al catálogo.
- Búsqueda y filtros usan generaciones de solicitud para descartar respuestas anteriores que lleguen tarde.
- Los filtros se serializan en la URL y pueden abrirse o compartirse directamente.
- Una ficha utiliza `Promise.allSettled`: el fallo de una recomendación o proveedor no debe ocultar la información principal.
- Las vistas de temporada y episodio descartan resultados al desmontarse o cambiar su selección.

## Biblioteca personal

Se almacena un array de `{ item, status, addedAt }` bajo `fym-library-v1`. Los estados permitidos son `pending` y `watched`. Las operaciones de escritura se confirman al usuario solo después de completar `localStorage.setItem`. El evento `storage` permite reflejar cambios hechos en otras pestañas. Un fallo de permisos o almacenamiento muestra un mensaje y conserva el estado previo.

Es persistencia local: borrar los datos del navegador elimina la biblioteca. No hay garantía transaccional entre escrituras simultáneas de varias pestañas. Una futura sincronización requeriría autenticación, base de datos y resolución de conflictos; esos componentes no forman parte de esta entrega.

## Accesibilidad y movimiento

Idioma español, enlace para saltar al contenido, campos con etiquetas, nombres accesibles en controles de icono, indicadores de foco y mensajes de estado. Los diálogos nativos mantienen el foco dentro de la ventana y lo restauran al cerrar. El movimiento responde al cambio de selección y a acciones del usuario; `prefers-reduced-motion` elimina desplazamientos y transiciones.

## Validación

```powershell
npm run lint
npm test
npm run build
```

Las pruebas automatizadas de dominio cubren colisiones entre tipos, inferencia de series, deduplicación de páginas y metadatos incompletos. La verificación de navegador de esta entrega cubre guardado persistente, vistas, filtros combinados, búsqueda, fichas, carteles, tráileres, selección de país, temporadas, episodios, colecciones y estados de error. Los informes y capturas de trabajo se guardan en `.taste-skill/` y `.impeccable/review/`, sin formar parte de la aplicación publicada.

## Límites y decisiones

La aplicación depende de TMDB y de su cobertura de traducciones, imágenes y proveedores. Las valoraciones y fechas se presentan como datos del catálogo; no se inventan. La selección aleatoria usa tendencias y títulos bien valorados, no un modelo de recomendación personal. La búsqueda multi devuelve películas y series; los resultados de personas se excluyen porque no existe una ficha de persona. Los tráileres se reproducen mediante YouTube y pueden depender de permisos del proveedor.

## Evidencia de esta entrega

Verificación del 28 de octubre de 2026 en Chromium sobre Windows: lint sin errores; 5 pruebas de dominio aprobadas; compilación de producción correcta; 26 comprobaciones de navegador aprobadas, sin excepciones JavaScript. Inicio y ficha se inspeccionaron a 1440, 768 y 390 px con 0 fallos. Permanecen advertencias por metadatos compactos y por bloques de ficha situados debajo del primer viewport. No se ha realizado una certificación completa WCAG ni una matriz de navegadores.

La revisión independiente identificó dos ajustes: conservar la selección aleatoria en móvil/tablet y mantener el nombre accesible del enlace de biblioteca. Ambos fueron corregidos y evaluados como resueltos en el veredicto final. Diseño y sidecar se actualizaron tras ese lote.
