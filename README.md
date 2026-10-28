# FyM — Find Your Movie

Una plataforma para descubrir películas y series, consultar dónde verlas y organizar una lista personal. Construida con **Next.js 16, React 19, TypeScript y Tailwind CSS 4**, con datos reales de TMDB.

## Qué puedes hacer

- Explorar tendencias, títulos populares, mejor valorados, próximos estrenos y series en emisión.
- Filtrar por género, año y valoración; ordenar y cargar más resultados del catálogo completo. Los filtros quedan en la URL.
- Buscar películas y series con escritura diferida y filtros por tipo de contenido.
- Consultar sinopsis, reparto, equipo, producción, recaudación, tráileres y títulos relacionados.
- Seleccionar un país para consultar proveedores de suscripción, alquiler y compra.
- Recorrer temporadas, episodios, imágenes, vídeos y colecciones.
- Guardar títulos en **Mi lista**, marcarlos como vistos y buscar u ordenar la biblioteca.
- Pedir una selección aleatoria desde el inicio.

La interfaz está en español y se adapta a escritorio, tablet y móvil. Incluye navegación por teclado, diálogos accesibles, movimiento reducido y estados de carga, error y ausencia de resultados.

## Ejecutar

Se recomienda Node.js 24 para ejecutar también las pruebas de TypeScript con el runtime nativo.

```powershell
npm install
```

Crea `.env.local` en la raíz:

```dotenv
TMDB_API_KEY=tu_clave_de_tmdb
```

```powershell
npm run dev
```

Abre [localhost:3000](http://localhost:3000). Para producción:

```powershell
npm run build
npm run start
```

La clave se utiliza en el servidor. Las consultas interactivas pasan por `/api/tmdb/...`, que restringe los endpoints permitidos y maneja los fallos del proveedor. La variable antigua `NEXT_PUBLIC_TMDB_API_KEY` se admite en el servidor por compatibilidad; utiliza `TMDB_API_KEY` en instalaciones nuevas.

## Calidad

```powershell
npm run lint
npm test
npm run build
```

Las pruebas cubren identidad de películas y series, rutas, fechas, metadatos incompletos y deduplicación de resultados. El rediseño se verifica también en un navegador real con los flujos de biblioteca, búsqueda, filtros, fichas, temporadas y colecciones.

## Organización

```text
src/app/                 Rutas, estados globales y proxy TMDB
src/components/          Componentes visuales y flujos reutilizables
src/lib/api/client.ts    Cliente y contratos tipados
src/lib/api/server.ts    Cliente exclusivo de servidor con credenciales
src/lib/media.ts         Identidad, rutas y metadatos comunes
tests/                   Pruebas de dominio
```

Consulta [ARCHITECTURE.md](ARCHITECTURE.md) para entender el flujo de datos, la concurrencia y las decisiones técnicas; [DESIGN.md](DESIGN.md) recoge el sistema visual y [PRODUCT.md](PRODUCT.md), el alcance del producto.

## Persistencia y límites

La biblioteca se guarda en este navegador mediante `localStorage`. No requiere cuenta y no se sincroniza entre dispositivos. Borrar los datos del navegador elimina la lista. FyM es un explorador: no reproduce películas ni vende suscripciones. La disponibilidad depende de la información que TMDB recibe de JustWatch y puede cambiar.

Los datos, valoraciones e imágenes pertenecen a sus respectivos titulares y se obtienen de TMDB. Este producto utiliza la API de TMDB, pero no está avalado ni certificado por TMDB. Los tráileres se reproducen desde YouTube.

Proyecto de Jhosep Argomedo. Código bajo licencia MIT.
