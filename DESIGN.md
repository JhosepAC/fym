---
name: FyM — Find Your Movie
description: Cine, series y una próxima sesión en un catálogo negro y compacto.
colors:
  ground: "#000"
  surface: "#111"
  raised: "#2a2a2a"
  border: "#252525"
  control: "#444"
  text: "#fff"
  muted: "#b4b4b4"
  faint: "#949494"
  accent: "#e5b863"
  negative: "#ff9d9d"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  metadata:
    fontFamily: "Inter, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  thumbnail: "4px"
  poster: "8px"
  utility: "12px"
  panel: "16px"
  pill: "99px"
  circle: "50%"
spacing:
  tight: "8px"
  compact: "12px"
  small: "16px"
  medium: "20px"
  panel: "22px"
  large: "24px"
  wide: "32px"
  gutter: "48px"
components:
  button-primary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 17px"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 17px"
  input-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.poster}"
    padding: "0 12px"
  chip-genre:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "8px 17px"
  chip-genre-selected:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    padding: "8px 17px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "22px"
  movie-poster:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.poster}"
  navigation:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
---

# Design System: FyM — Find Your Movie

## Overview

**Creative North Star: "Selección de cineclub"**

FyM presenta historias reconocibles con una edición compacta: negro real, superficies neutrales y carteles que aportan el color. La interfaz acompaña la consulta y la biblioteca personal con acciones blancas, títulos contenidos y metadatos legibles.

La identidad True-black flat se aplica a descubrimiento, catálogo, búsqueda, biblioteca y fichas. Inter sostiene toda la jerarquía. Las fotografías y carteles proceden de datos dinámicos de TMDB; cuando faltan, aparece un sustituto neutral con icono de película y descripción, sin inventar una imagen.

**Key Characteristics:**

- Negro real y separación por tonos, sin sombras ornamentales.
- Inter cargada mediante next/font y títulos compactos.
- Carteles reconocibles, metadatos discretos y valoraciones ámbar.
- Acciones blancas, píldoras y controles nativos.
- Filas de carteles y retículas que se adaptan al ancho disponible.

## Colors

La paleta neutral cede el protagonismo a la fotografía; el ámbar identifica información de valoración y estados de interacción accesibles.

### Primary

- **Ámbar de proyección** (`accent`): estrellas y puntuaciones; también foco visible, cursor de texto y selección de texto. Estas excepciones funcionales están implementadas y forman parte del sistema.

### Neutral

- **Negro de sala** (`ground`): fondo general, navegación y texto de acciones blancas.
- **Superficie de catálogo** (`surface`): paneles, buscador, filtros y fondo provisional de imágenes.
- **Neutral elevado** (`raised`): acciones secundarias, contadores, avisos y sustitutos de imágenes.
- **División discreta** (`border`): separadores de navegación, pie, pestañas y episodios.
- **Contorno de control** (`control`): borde de campos y diálogo; foco del buscador de navegación.
- **Blanco de lectura** (`text`): texto principal, acción primaria y selección activa.
- **Gris de descripción** (`muted`): sinopsis, navegación inactiva y explicaciones.
- **Gris de metadatos** (`faint`): fechas, tipos, notas secundarias y placeholders.

El token `negative` es **Rosa de error**: mensajes de fallo explícitos. Su función semántica no lo convierte en un acento decorativo.

**The Ámbar informativo Rule.** Usa ámbar en valoraciones y en foco, cursor o selección de texto; las acciones y selecciones ordinarias usan blanco y negro.

## Typography

**Display Font:** Inter (fallback sans-serif).
**Body Font:** Inter (fallback sans-serif).

Inter se carga en `src/app/layout.tsx` con `next/font/google`, subconjunto latin y variable `--font-inter`; el cuerpo y Tailwind consumen esa variable. No hay segunda familia de etiquetas ni monoespaciada.

### Hierarchy

- **Display:** título destacado del panel de selección; tamaño adaptable a 27 px bajo 1150 px y 26 px en móvil. Las fichas usan un título de 32 px, que baja a 28 y 24 px.
- **Headline:** título principal de página; baja a 24 px en móvil.
- **Title:** secciones principales; baja a 18 px en móvil. Los paneles compactos usan 16 px.
- **Body:** lectura general. La sinopsis destacada usa interlineado 1.7 y 13 px en móvil; la sinopsis de ficha usa 1.8 y un máximo de 75 caracteres de ancho.
- **Label:** navegación y acciones. Los títulos de cartel usan 14 px y peso 500, con 13 px en móvil; las etiquetas compactas de ficha pueden usar 11 px.
- **Metadata:** fechas, valoraciones y explicaciones breves. Algunas notas densas de reparto y episodios usan 11 px. Puntuaciones y contadores usan cifras tabulares.

**The Una familia Rule.** Mantén Inter y construye jerarquía mediante tamaño, peso, espacio y tono; los títulos se equilibran y las etiquetas permanecen en caja de oración.

## Layout

La página y la navegación comparten un contenedor centrado de máximo 1440 px, ampliado a 1536 px a partir de 1600 px. Los márgenes interiores horizontales son 48 px; bajan a 32 px bajo 1150 px y a 20 px bajo 650 px. La navegación permanece fija al desplazarse mediante sticky, con alturas de 80, 70 y 64 px según el ancho.

Las retículas de catálogo y las filas horizontales muestran seis carteles con 20 px entre ellos; pasan a cinco bajo 1150 px, cuatro bajo 900 px y dos bajo 650 px. En móvil el espacio entre carteles es 16 px. Las filas admiten desplazamiento horizontal y ajuste de posición; las retículas continúan verticalmente. Los botones de avance de fila se ocultan en móvil.

Los paneles combinan rellenos de 20–30 px; los bloques secundarios comparten 22 px. Las secciones de carteles se separan 38 px en escritorio y 30 px en móvil. El ritmo predominante usa 8, 12, 16, 20, 24 y 32 px; no es una cuadrícula universal de múltiplos de cuatro.

Los paneles principales se apilan a 900 px o menos; el panel de recomendaciones lateral desaparece en ese ancho. Su acción «Elige por mí» permanece disponible en una franja compacta debajo de la selección destacada: superficie neutral, radio de panel, relleno de 16 px por 20 px y separación superior de 14 px. Bajo 650 px, la selección destacada coloca la fotografía sobre el texto y usa una proporción de imagen de 2.1. La navegación de escritorio y su búsqueda se sustituyen por un menú con destino Buscar. Las fichas reducen el cartel a 90 px, distribuyen el texto en el ancho completo y reorganizan datos y proveedores sin desbordar.

## Elevation & Depth

No hay sombras en el sistema vigente. La profundidad procede de superficies neutrales, separación espacial, recortes de fotografía y contornos en los controles. Los carteles reposan directamente sobre el fondo de página, sin una caja adicional alrededor del texto. El diálogo usa superficie neutral, borde de control y fondo oscurecido (`rgb(0 0 0 / 0.85)`), sin desenfoque.

**The Plano por defecto Rule.** Separa superficies mediante tono, espacio o contorno funcional; conserva los carteles y paneles sin sombras ni gradientes decorativos.

La respuesta al pulsar reduce las acciones a 0.97; el hover baja su opacidad a 0.85. Las transiciones de acción duran 160 ms con `cubic-bezier(0.23, 1, 0.32, 1)`. Los carteles amplían su imagen a 1.035 en 300 ms y revelan el enlace de ficha al pasar el puntero o recibir foco. La preferencia de movimiento reducido elimina animaciones, transiciones y desplazamiento suave.

## Shapes

Paneles principales y diálogos usan esquinas de 16 px; carteles, fotografías de reparto, imágenes de episodios y campos usan 8 px. Filtros, buscador amplio y avisos usan 12 px; miniaturas de recomendaciones, 4 px. Botones y géneros forman píldoras de 99 px, mientras que iconos de acción y contadores son circulares.

Los carteles conservan proporción 2:3. Las imágenes se recortan con object-fit cover; la vista ampliada usa contain para consultar el recurso completo. Los bordes finos delimitan controles y separadores, sin marcos ornamentales sobre los carteles.

## Components

### Buttons

Acciones compactas, contrastadas y con etiqueta explícita. La primaria usa blanco sobre negro invertido y la secundaria neutral elevado con texto blanco. Comparten píldora, separación de 8 px entre icono y etiqueta, altura mínima de 38 px y relleno horizontal de 17 px. La variante de selección destacada usa 36 px y relleno de 14 px en escritorio; en móvil usa 40 px y relleno de 18 px. Los botones generales y enlaces de texto alcanzan 44 px en móvil. El foco visible es un contorno ámbar de 2 px separado 5 px.

Las acciones de texto son transparentes. Las acciones de icono son círculos de 32 px, ampliados a un mínimo de 44 px en móvil. El guardado superpuesto al cartel conserva 30 px en escritorio y 32 px en móvil; invierte negro y blanco al estar activo. Los botones deshabilitados usan gris de metadatos y cursor de indisponibilidad.

### Chips

Los géneros usan píldoras sobre superficie con texto secundario; la opción seleccionada invierte a blanco y negro. El hover aumenta el tono de la superficie. El rail de géneros permite desplazamiento horizontal sin scrollbar visible. Los géneros de ficha son más compactos, con neutral elevado y relleno de 5 px por 12 px.

### Cards / Containers

El cartel es el contenedor visual: proporción vertical, radio de cartel y datos debajo, sin borde ni sombra. Títulos limitados a dos líneas; fecha, tipo y valoración forman una sola fila de metadatos. La acción de guardado permanece visible; el enlace circular a la ficha aparece en hover y foco.

Paneles de recomendaciones, ficha y estados vacíos usan superficie neutral con radio de panel. Los estados vacíos explican la situación y ofrecen una acción pertinente. Los esqueletos son bloques neutrales estáticos con la proporción real del cartel.

### Inputs / Fields

Filtros y selectores nativos usan superficie neutral, borde de control, radio de cartel y altura mínima de 38 px. En móvil los filtros llegan a 42 px y se distribuyen en dos columnas cuando cabe. Las etiquetas permanecen visibles sobre cada campo.

El buscador de navegación es una píldora de 40 px con icono, campo y pista Ctrl K; su foco se muestra en el contenedor con un borde de control. El buscador principal tiene campo de 54 px, radio de 12 px y contorno ámbar al recibir foco. Los fallos de carga usan el color semántico de error y texto comprensible.

### Navigation

Cabecera negra con separador inferior y marca blanca dibujada en SVG. Destinos de 13 px y peso 500; el activo y el hover cambian de gris a blanco. Mi lista añade un contador circular cuando hay elementos y conserva el nombre accesible «Mi lista» mediante aria-label, incluso cuando su etiqueta visual se oculta en anchos intermedios. En móvil un botón abre navegación vertical y permite llegar a la búsqueda. Las pestañas de catálogo usan una línea inferior blanca de 2 px para la selección.

### Random selection

«Elige por mí» selecciona un título real de tendencias o mejor valoradas, cambia a «Elegir otra» después de seleccionar y añade un enlace «Ver ficha». El control de escritorio y la franja compacta de hasta 900 px comparten la misma selección y anuncio de estado. La franja organiza el título y la acción en la primera fila y el texto descriptivo en una segunda fila completa; usa títulos y acciones de 13 px y descripción de 12 px. El cambio de disposición conserva la función disponible.

### Dialogs and feedback

El diálogo nativo tiene ancho máximo de 900 px, margen mínimo de 16 px y altura máxima de 90dvh. Mantiene el foco, permite cerrar con Escape, bloquea el desplazamiento del fondo y restaura el foco al disparador. Las imágenes conservan sus proporciones y los vídeos usan 16:9. Los avisos breves aparecen centrados a 24 px del borde inferior sobre neutral elevado, con radio de 12 px.

## Do's and Don'ts

### Do:

- **Do** mantener negro real, capas neutrales e Inter cargada por next/font.
- **Do** usar imágenes dinámicas de TMDB y un sustituto neutral explícito cuando falten.
- **Do** conservar ámbar para valoraciones y estados funcionales de foco, cursor y selección.
- **Do** conservar el contraste de acciones blancas y la inversión blanco/negro en selecciones.
- **Do** adaptar retículas, campos y navegación al ancho y respetar movimiento reducido.
- **Do** mantener controles nativos, etiquetas visibles y acciones accesibles con teclado.

### Don't:

- **Don't** añadir sombras, gradientes o marcos ornamentales al sistema plano.
- **Don't** convertir el ámbar o el rosa de error en fondos decorativos de botones.
- **Don't** inventar carteles, puntuaciones o disponibilidad para completar una composición.
- **Don't** introducir otra familia tipográfica, mayúsculas ornamentales o encabezados auxiliares sin función.
- **Don't** heredar los estilos rojos y sombras del componente antiguo MovieFilters; el catálogo vigente usa sus propios controles nativos.
