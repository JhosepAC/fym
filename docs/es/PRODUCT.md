# FyM — Find Your Movie

[English](../en/PRODUCT.md) · **Español** · [Documentación](README.md)

<!-- impeccable:product-schema 1 -->

## Plataforma

web

## Propósito

Explorar películas y series, consultar sus fichas y decidir qué ver. El usuario solicita un producto completo y coherente, con mejoras visuales y funcionales, con calidad de proyecto de egreso de ingeniería de software.

## Usuarios

Personas que buscan películas o series y necesitan comparar sinopsis, valoración, reparto y disponibilidad. Audiencia inferida de las rutas y funciones existentes.

## Capacidades y restricciones

Next.js 16, React 19, TypeScript y Tailwind 4. Conservar el catálogo TMDB, búsqueda, filtros, fichas de películas y series, temporadas, episodios, colecciones, reparto, tráileres y proveedores. Lista personal persistente y «Elige por mí»: selección de películas por géneros, reparto, años, valoración, duración y prioridad; catálogo de candidatas y ruleta personal con búsqueda e importación de pendientes. Biblioteca y ruleta se guardan localmente. No existe autenticación ni sincronización entre dispositivos. Credenciales y consultas autenticadas a TMDB permanecen en el servidor.

## Evidencia disponible

Datos e imágenes de TMDB; no inventar valoraciones, disponibilidad o contenido. Mostrar fallos y estados vacíos explícitos. El país de disponibilidad debe poder seleccionarse.

## Compromisos de marca

Nombre FyM / Find Your Movie. El usuario autoriza reemplazar la identidad visual y añadir funcionalidades pertinentes. Colores principales indicados explícitamente por el usuario: negro, blanco y rojo. La nueva función debe estar disponible desde la navegación y el inicio, y permitir tanto descubrir candidatas como construir una ruleta propia.

## Principios

- Descubrir, evaluar y guardar en un flujo continuo.
- Datos reales y estados de error comprensibles.
- Navegación consistente y accesible en móvil y escritorio.
- Componentes reutilizables y documentación mantenible.

La interfaz está en español; la documentación bilingüe no implica traducción de la aplicación. El logo SVG propio se comparte en cabecera y pie. El acceso «Elige por mí» usa una acción roja destacada. El footer acredita a Jhosep Argomedo y enlaza su portafolio.
