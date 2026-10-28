# FyM — Find Your Movie

[English](../en/README.md) · **Español** · [Repositorio](../../README.md)

Descubre películas y series, consulta proveedores y decide qué ver. FyM combina el catálogo real de TMDB con una biblioteca local y una ruleta personal. La interfaz de la aplicación está actualmente en español; la documentación está disponible en inglés y español.

## Funcionalidades

- Explorar tendencias, películas populares, mejor valoradas y próximos estrenos, además de series en emisión.
- Filtrar catálogos por género, año y valoración, ordenar y cargar más resultados. Los filtros del catálogo se guardan en la URL.
- Buscar películas y series con solicitudes diferidas y filtros por tipo de contenido.
- Consultar sinopsis, reparto, equipo, tráileres, producción, colecciones, temporadas y episodios.
- Seleccionar un país para consultar proveedores de suscripción, alquiler y compra.
- Mantener una lista local, marcar títulos como vistos y buscar u ordenar la biblioteca.
- Abrir **Elige por mí** para combinar hasta cuatro géneros y tres integrantes del reparto con años, valoración y duración. Priorizar popularidad, valoración o estrenos y solicitar 6, 9 o 12 candidatas.
- Crear una ruleta desde sugerencias, búsquedas por título o pendientes de la biblioteca. Retirar candidatas, girar y guardar la ganadora.
- Usar diseños adaptables, navegación por teclado, foco visible, diálogos nativos, movimiento reducido y estados explícitos de carga, error y ausencia de resultados.

## Tecnologías

| Capa         | Implementación                                                 |
| ------------ | -------------------------------------------------------------- |
| Aplicación   | Next.js 16.2.1 App Router, React 19.2.4 y TypeScript           |
| Estilos      | Tailwind CSS 4, CSS propio e Inter mediante `next/font`        |
| Datos        | TMDB, componentes de servidor y rutas API locales restringidas |
| Persistencia | `localStorage` del navegador; sin cuenta ni base de datos      |
| Calidad      | ESLint, TypeScript y runner nativo de pruebas de Node          |

## Instalación local

Usa **Node.js 24** y npm. Se recomienda Node 24 porque las pruebas importan TypeScript mediante el runtime nativo.

```bash
git clone https://github.com/JhosepAC/fym.git
cd fym
npm ci
```

Crea `.env.local` en la raíz:

```dotenv
TMDB_API_KEY=tu_clave_de_tmdb
```

```bash
npm run dev
```

Abre [localhost:3000](http://localhost:3000). Conserva el archivo de entorno en privado. Las credenciales se consumen en módulos exclusivos del servidor y las consultas interactivas usan rutas locales. La variable antigua `NEXT_PUBLIC_TMDB_API_KEY` se admite en el servidor por compatibilidad; las instalaciones nuevas deben usar `TMDB_API_KEY`.

## Comandos y comprobaciones

| Comando         | Propósito                                               |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Servidor de desarrollo                                  |
| `npm run build` | Compilación de producción y postbuild del sitemap       |
| `npm run start` | Servir la compilación de producción                     |
| `npm run lint`  | Comprobación ESLint                                     |
| `npm test`      | Pruebas de dominio; integración API si está configurada |

Para producción, ejecuta `npm run build` y después `npm run start`.

Las pruebas cubren identidad, metadatos incompletos, validación de preferencias, proyección pública, almacenamiento dañado, selección aleatoria y geometría de la ruleta. Para activar las tres pruebas de integración, inicia una instancia con credenciales válidas de TMDB y configura su URL en otra terminal:

```powershell
$env:FYM_TEST_URL = "http://localhost:3000"
npm test
```

```bash
FYM_TEST_URL=http://localhost:3000 npm test
```

Sin esta variable, las pruebas de integración se omiten. La evidencia histórica se conserva en [Arquitectura](ARCHITECTURE.md); no sustituye repetir las comprobaciones tras un cambio.

## Estructura

```text
fym/
├── docs/en/                     Documentación en inglés
├── docs/es/                     Documentación en español
├── public/fym-logo.svg          Logo vectorial propio
├── src/app/                     Páginas, metadatos y rutas API
├── src/components/              Interfaz compartida y flujos
├── src/components/decision/     Preferencias, candidatas y ruleta
├── src/lib/api/                 Cliente tipado y credenciales de servidor
├── src/lib/media.ts             Identidad y metadatos compartidos
├── src/lib/decision.ts          Validación, almacenamiento y geometría
├── src/lib/decision-server.ts   Selección de candidatas en servidor
└── tests/                       Pruebas de dominio e integración opcional
```

## Documentación

| Tema                                | English                               | Español                         |
| ----------------------------------- | ------------------------------------- | ------------------------------- |
| Instalación y funcionalidades       | [Guide](../en/README.md)              | [Guía](README.md)               |
| Arquitectura y límites de seguridad | [Architecture](../en/ARCHITECTURE.md) | [Arquitectura](ARCHITECTURE.md) |
| Sistema visual                      | [Design](../en/DESIGN.md)             | [Diseño](DESIGN.md)             |
| Alcance del producto                | [Product](../en/PRODUCT.md)           | [Producto](PRODUCT.md)          |

Actualiza ambas versiones juntas. Los archivos de contexto de la raíz enlazan a estas guías y siguen disponibles para las herramientas del repositorio.

## Gitflow y contribuciones

`master` conserva la línea de publicación y `develop` integra el trabajo. Crea `feature/<nombre>` desde `develop`, usa Conventional Commits firmados, ejecuta las comprobaciones pertinentes y abre un PR contra `develop`. Integra mediante commit de merge. Usa `release/<versión>` para preparar publicaciones y `hotfix/<nombre>` para correcciones urgentes de producción. Nunca versiones credenciales, claves privadas ni archivos de entorno locales.

Reporta errores reproducibles o propón mejoras en [GitHub Issues](https://github.com/JhosepAC/fym/issues). Incluye ruta, pasos, resultado esperado y datos relevantes del dispositivo; omite secretos.

## Persistencia y límites

La biblioteca y la ruleta se guardan en este navegador bajo `fym-library-v1` y `fym-decision-wheel-v1`. Borrar los datos del navegador las elimina. No hay cuenta, copia en la nube ni sincronización entre dispositivos. Las candidatas de la ruleta tampoco se sincronizan entre pestañas.

La ruleta acepta de 2 a 12 películas únicas, todas con la misma probabilidad. El descubrimiento usa hasta las primeras cinco páginas devueltas para la prioridad seleccionada (hasta 100 resultados); no es una muestra uniforme de todo TMDB. Las sugerencias excluyen estrenos futuros y películas con menos de 100 votos. FyM no reproduce películas ni vende suscripciones. La disponibilidad puede cambiar.

## Autor y atribución

Desarrollado por **[Jhosep Argomedo](https://jhosep-ac.pages.dev/)** · [GitHub](https://github.com/JhosepAC).

Datos, valoraciones e imágenes provienen de TMDB y pertenecen a sus respectivos titulares. Este producto utiliza la API de TMDB, pero no está avalado ni certificado por TMDB. La disponibilidad procede de TMDB/JustWatch; los tráileres se integran desde YouTube. El repositorio actualmente no tiene un archivo `LICENSE`; esta documentación no afirma una licencia específica.
