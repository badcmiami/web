# Best American Diagnostic Center — Propuesta de sitio web

Prototipo funcional completo de la nueva presencia digital para **Best American Diagnostic
Center** (Hialeah, Florida). Ocho páginas estáticas, bilingües (EN/ES), responsivas y sin
dependencias de terceros en el front-end.

👉 Empiece por **`proposal.html`**: explica la dirección de diseño, el sistema de marca,
la arquitectura, el inventario de componentes y las fases de entrega.

---

## Cómo verlo

```bash
python3 -m http.server 8899     # o: npm run serve
# abrir http://127.0.0.1:8899/index.html
```

No hay proceso de compilación necesario para verlo: los `.html` de la raíz ya están generados.

## Cómo editarlo

Las páginas de la raíz **se generan**. No las edite directamente: edite `src/` y reconstruya.

```
src/partials/     head · header · footer · icons   (compartidos por todas las páginas)
src/pages/        una plantilla por página, con front-matter <!--meta title/desc/nav-->
tools/build.py    reemplaza {{> partial}}, {{title}}, {{desc}}, {{cur:nav}}
tools/set_logo.py coloca un logotipo en un solo paso
tools/make_logo.py regenera el kit del logotipo en vector
tools/png_export.js exporta iconos y tarjeta social a PNG
tools/bundle.py   empaqueta todo el sitio en dist/preview.html
```

```bash
python3 tools/build.py          # o: npm run build   → regenera los .html de la raíz
python3 tools/make_assets.py    # o: npm run assets  → regenera el kit SVG
```

## Estructura

| Página | Rol |
| --- | --- |
| `index.html` | Home — confianza en 5 segundos, servicios, cifras, proceso, sedes, FAQ |
| `services.html` | Los 7 estudios: uso, duración, preparación |
| `patients.html` | Qué traer, preparación por estudio (pestañas), seguros, formularios, FAQ |
| `providers.html` | Médicos referentes: tiempos, cómo referir, formulario |
| `about.html` | Historia, valores, equipo médico, calidad y acreditaciones |
| `contact.html` | Formulario de cita, dirección, horario, mapa y WhatsApp |
| `proposal.html` | **La presentación**: dirección, identidad, marca, alcance y fases (`noindex`) |
| `legal.html` | Privacidad (HIPAA), términos, accesibilidad y no discriminación (`noindex`) |
| `404.html` | Página de error con rutas de rescate |

## Sistema

- **Colores** — Infinity Navy `#001C77`, Tahoe Green `#00C6C1`, más neutros y degradado de marca.
  Todos los tokens viven en `:root` dentro de `assets/css/style.css`.
- **Tipografía** — Inter Tight (titulares, tracking −3.2%) + Inter (texto), vía Google Fonts
  con pila de respaldo del sistema.
- **Bilingüe** — cada texto lleva su traducción en el atributo `data-es`. El botón EN/ES
  intercambia el contenido, guarda la preferencia en `localStorage` y actualiza `<html lang>`.
  No hay páginas duplicadas que mantener.
- **Movimiento** — aparición al scroll, contadores, cinta continua, mega-menú, acordeones,
  pestañas, barra de progreso, Ken Burns en el hero. Todo se desactiva con
  `prefers-reduced-motion`.
- **SEO / técnica** — títulos y descripciones por página, datos estructurados
  `MedicalBusiness` con ambas sedes y horarios, HTML semántico, foco visible, navegación
  por teclado, y cero librerías JS externas.

## Datos de contacto en uso

| Canal | Destino | Dónde aparece |
| --- | --- | --- |
| Botones de llamada | **(305) 681-7555** | Barra superior, cabecera, cada CTA, barra fija móvil |
| WhatsApp | **(786) 819-6086** (`wa.me/17868196086`) | Barra superior, menú móvil, FAQ, CTA, pie, botón flotante, barra fija móvil |
| Formularios | **billing@bestamericandiagnostics.com** (`MAIL_TO` en `send.php`) | Cita en `contact.html`, referencia en `providers.html` |
| Dirección | **5005 E 8th Ave, Hialeah, FL 33013** | Home (sección *Visit us*), contacto, pie, datos estructurados |
| Fax | (305) 681-7040 | Pie, contacto, servicios, médicos |

Al ser una sola dirección oficial, **no hay página de sedes**: la dirección, el horario y el
mapa viven en la home y en contacto. Para verificar que ningún botón quedó apuntando a otro
lado después de un cambio:

```bash
node tools/check_actions.js     # o: npm run check
```

Comprueba que todo `tel:` sea (305) 681-7555, que todo enlace de WhatsApp sea el número
correcto, que los formularios envíen a `send.php`, que `send.php` entregue a `billing@`,
que no queden enlaces a la página de sedes eliminada y que el menú ya no la ofrezca.

## ⚠️ Contenido a confirmar antes de publicar

Este prototipo se construyó **sin acceso directo al sitio actual** (el entorno de trabajo
bloquea la navegación externa), por lo que los textos son propuestas de referencia
redactadas a partir de la información pública del centro. Antes del lanzamiento hay que
validar con el cliente:

1. **Fax y horario** — el fax (305) 681-7040 y el horario Lun–Vie 8:00 am – 6:00 pm vienen
   de directorios públicos, no del cliente. El teléfono, el WhatsApp, el correo y la
   dirección sí están confirmados.
2. **Lista de servicios** — se asumieron 7 modalidades; confirmar cuáles se realizan.
3. **Cifras** — años de operación, volumen anual de estudios y tiempo real de entrega de
   reportes (marcados con `*` en el sitio).
4. **Seguros aceptados** — la lista actual es de referencia del mercado de Florida.
5. **Credenciales y acreditaciones** — nombres de radiólogos, subespecialidades y números
   ACR / AHCA / MQSA.
6. **Testimonios** — reemplazar por reseñas reales con autorización.
7. **Formularios PDF y portal de resultados** — hoy son enlaces de demostración.

## Logotipo

El logotipo del centro está **reconstruido en vector** a partir del arte suministrado
(`tools/make_logo.py`): la «b» en Infinity Navy cuyo contrapunzón es el disco Tahoe Green,
sosteniendo el gantry y la camilla del equipo.

| Archivo | Uso |
| --- | --- |
| `logo-mark.svg` | Marca sobre fondo claro — cabecera |
| `logo-mark-white.svg` | Marca sobre Infinity Navy — pie de página |
| `logo-lockup.svg` / `-inverse.svg` | Bloque completo con tipografía |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png` | Iconos de navegador, iOS y Android |
| `og-cover.png` | Imagen para WhatsApp, Facebook y LinkedIn (1200×630) |

La cabecera combina la marca SVG con el texto en HTML, así pesa ~600 bytes, es seleccionable
y se traduce junto con el resto del sitio. La tipografía del bloque usa Inter Tight como
equivalente; **si nos envían el archivo vectorial original (AI o EPS) queda idéntico** al
manual de marca:

```bash
python3 tools/set_logo.py ruta/al/logo.svg                 # marca (cabecera, pie, favicon)
python3 tools/set_logo.py ruta/al/logo.svg blanco.svg      # con versión clara para el pie
python3 tools/set_logo.py ruta/al/lockup.svg --original    # bloque mostrado en proposal.html
node tools/png_export.js                                   # regenera PNGs e iconos
```

## Imágenes y fotografía

### De dónde sacar fotos gratis con derechos comerciales

| Fuente | Clave | Atribución | Notas |
| --- | --- | --- | --- |
| **Openverse** (openverse.org) | ninguna | según la licencia (CC0 o CC-BY) | Agrega museos y bibliotecas. Filtra por «uso comercial + modificación». Es la opción por defecto del script porque funciona sin registrarse |
| **Pexels** | gratuita | no exigida | La mejor biblioteca moderna de temática médica. Licencia Pexels: uso comercial libre, sin atribución |
| **Unsplash** | gratuita | no exigida (agradecida) | Muy buena calidad, muchas 4K+ |
| **Pixabay** | gratuita | no exigida | Contenido más variado, calidad desigual |
| **Wikimedia Commons** | ninguna | sí, CC-BY casi siempre | Útil para equipos médicos concretos y anatomía |

Evite: Google Imágenes (la mayoría tiene copyright), «free stock» de sitios sin licencia
declarada, y cualquier foto con logotipos de fabricantes o rostros reconocibles sin
autorización.

### ⚠️ Lo específico de un centro médico

Esto **no** es teoría legal genérica; son las reglas que rompen los sitios de salud:

1. **Uso sensible.** Las licencias de Pexels, Unsplash y Pixabay prohíben expresamente usar
   una foto de una persona identificable de forma que insinúe que padece una condición
   médica, que recibe tratamiento o que aprueba un producto. Una foto de archivo bajo el
   titular «Nuestros pacientes» puede violar la licencia y exponerle a una demanda por
   derecho de imagen — aunque la foto sea «gratis».
2. **Regla práctica:** para las secciones de servicios y equipos use fotos **sin rostros
   identificables** (equipos, manos, salas, detalle técnico). Reserve los rostros para
   imágenes claramente ilustrativas, nunca junto a un testimonio o un diagnóstico.
3. **El equipo humano y las instalaciones deben ser fotos reales del centro.** Un paciente
   que reconoce una foto de archivo en la página «Nosotros» pierde exactamente la confianza
   que el sitio intenta construir. Vale más una sesión de dos horas con un fotógrafo local
   que diez fotos de banco.
4. **HIPAA:** ninguna imagen puede mostrar pantallas con datos de pacientes, pizarras de
   agenda, expedientes ni etiquetas. Revise el fondo de cada foto propia antes de publicar.
5. Guarde el comprobante de licencia de cada imagen. El script lo hace por usted en
   `assets/photos/credits.json`, y esos créditos se publican en `legal.html`.

### Cómo llenar el sitio, en un comando

```bash
python3 tools/fetch_photos.py                      # Openverse, sin clave, todos los huecos
python3 tools/fetch_photos.py --source pexels      # con PEXELS_API_KEY exportada
python3 tools/fetch_photos.py hero mri --source unsplash
python3 tools/fetch_photos.py --url hero=https://…/foto.jpg   # una foto concreta
python3 tools/fetch_photos.py --local              # fotos que ya descargó usted
python3 tools/build.py
```

### Envato Elements, otra biblioteca de pago, o fotos propias

Envato exige sesión iniciada, así que no hay API que valga: descargue usted las fotos desde
el navegador y deje que el pipeline haga el resto.

1. Descargue de Envato la foto de cada tema (busque «MRI», «CT scan», «medical reception»…).
2. Guárdelas en `assets/photos/_incoming/` **con el nombre de su hueco**:
   `hero.jpg`, `lobby.jpg`, `tech.jpg`, `mri.jpg`, `ct.jpg`, `mammography.jpg`,
   `ultrasound.jpg`, `xray.jpg`, `cardiac.jpg`, `team.jpg`.
3. `python3 tools/fetch_photos.py --local && python3 tools/build.py`

Reciben exactamente el mismo tratamiento que las de banco: recorte a la proporción del
diseño, cinco tamaños, WebP y `srcset`. Los originales quedan en `_masters/`, fuera del
sitio publicado.

Sobre la licencia de Envato Elements: cubre uso comercial, pero **hay que registrar cada
descarga a un «proyecto» desde su cuenta** y conservar el certificado. La licencia muere si
cancela la suscripción sin haber registrado el uso, así que hágalo el mismo día. Y siguen
aplicando las reglas de uso sensible del punto anterior: nada de rostros identificables
junto a texto que insinúe que esa persona es paciente.

Para cada hueco el script:

1. descarga la versión más grande que ofrezca el proveedor (4K cuando existe);
2. guarda ese máster en `assets/photos/_masters/` — fuera de git y bloqueado en el servidor;
3. lo recorta al centro en la proporción que pide el diseño;
4. escribe **JPEG y WebP en 480, 960, 1440, 1920 y 2560 px**;
5. anota autor, licencia y URL de origen en `credits.json`.

El build convierte entonces cada `<img data-photo="…">` en un `<picture>` con `srcset`
completo. Medido en Chromium con el máster de 4K:

| Dispositivo | Archivo servido | Peso |
| --- | --- | --- |
| Teléfono @2x | `hero-960.webp` | 9 KB |
| Tablet @2x | `hero-1920.webp` | 21 KB |
| Portátil @1x | `hero-1440.webp` | 15 KB |
| Escritorio 4K @2x | `hero-2560.webp` | 31 KB |

Esa es la respuesta correcta a «4K»: se **origina** en 4K y se **sirve** el tamaño que cada
pantalla necesita. Publicar el 4K tal cual costaría medio megabyte por imagen en un teléfono.

`photos.json` define los diez huecos (`hero`, `lobby`, `mri`, `ct`, `mammography`,
`ultrasound`, `xray`, `cardiac`, `tech`, `team`) con su búsqueda, su proporción y su
atributo `sizes`. Mientras un hueco no tenga foto, se queda el SVG de marca — el sitio nunca
muestra una imagen rota. Sirve igual para la fotografía propia del centro: copie los archivos
con esos nombres en `assets/photos/`.

> **No se descargaron desde aquí.** El proxy de red de este entorno solo permite npm y PyPI;
> `pexels.com`, `unsplash.com` y `openverse.org` están bloqueados, igual que lo estuvo el
> sitio del cliente. El pipeline está construido y **probado de extremo a extremo** con un
> máster sintético de 3840×2400: recorte, cinco tamaños, WebP, `srcset` y selección correcta
> del navegador. Solo falta ejecutarlo desde su máquina.

## Cambiar las fotos desde el hosting, sin herramientas

`img.php` permite reemplazar la fotografía del sitio **desde el Administrador de
archivos de Hostinger**, sin build, sin GitHub y sin nada instalado:

1. Suba las fotos a `assets/photos/_src/` con el nombre de su hueco
   (`hero.jpg`, `mri.jpg`, `ct.jpg`, `team.jpg`…). Cualquier tamaño, JPG/PNG/WebP.
2. Abra una vez `https://bestamerican.center/img.php?rebuild=all`
3. Listo.

El servidor recorta cada foto al centro en la proporción exacta que pide su hueco,
genera los cinco anchos en JPEG y WebP la primera vez que un navegador los pide, y
los guarda en disco. A partir de ahí Apache los sirve directo, sin pasar por PHP.

Necesita la extensión GD de PHP, presente en todos los planes de Hostinger. Si
faltara, `img.php` lo dice en texto claro en vez de romper el sitio.

## Reseñas de Google

La sección de reseñas de la home se genera desde **`reviews.json`**: calificación, número de
reseñas y las tarjetas con nombre, fecha, estrellas y texto en los dos idiomas. Mientras las
entradas tengan `"placeholder": true`, el sitio imprime automáticamente una nota diciendo que
son de ejemplo — así nunca se publica una reseña inventada como si fuera real.

Para poner las reales: copie el texto de su perfil de Google Business, pegue cada una en
`reviews.json`, ponga `"placeholder": false`, ajuste `rating` y `count`, y reconstruya. Si
añade el `google_place_id` en `site.json`, el botón «Escribir una reseña» lleva directo al
formulario de Google en vez de a la ficha del mapa.

## Accesibilidad y cookies

**Panel de accesibilidad** — botón flotante a la derecha, a media altura, para que no se cruce
con el de WhatsApp (abajo a la derecha) ni con la barra fija del móvil. Se abre también con
`Alt + A`. Ofrece seis perfiles rápidos (movilidad reducida, baja visión, dislexia, cognitivo,
TDAH y sin destellos) y doce ajustes sueltos: tamaño de texto, espaciado, interlineado, alto
contraste, escala de grises, resaltar enlaces, fuente legible, alinear a la izquierda, ocultar
imágenes, cursor grande, detener animaciones y guía de lectura. Las preferencias se guardan
por visitante en `localStorage` y sobreviven a la navegación.

Está escrito a mano, sin servicios de terceros: no añade scripts externos, no rompe la CSP y
no ralentiza la carga. Es un complemento de la accesibilidad real del sitio (marcado
semántico, navegación por teclado, contraste AA, `prefers-reduced-motion`), no un sustituto —
una capa de overlay no arregla por sí sola un sitio inaccesible, y este no lo necesita.

**Banner de cookies** — abajo a la izquierda, con entrada animada. Aceptar o rechazar guarda
la decisión y expone `window.badcConsent` más un evento `badc:consent`. Hoy el sitio solo usa
almacenamiento propio para el idioma y la accesibilidad; **cuando añada Google Analytics o un
píxel, condicione su carga a ese flag** para que el rechazo signifique algo:

```js
document.addEventListener('badc:consent', function (e) {
  if (e.detail === 'accepted') { /* cargar analytics aquí */ }
});
```

## Enlaces externos y redes sociales

`site.json` concentra todo lo que apunta fuera del sitio: teléfono, WhatsApp, correo, mapa y
redes sociales. **Las redes con URL vacía no se renderizan**, así que el sitio nunca publica
un icono que no lleva a ninguna parte. Hoy están activos WhatsApp y la ficha de Google;
añada Facebook, Instagram, LinkedIn, YouTube o TikTok pegando su URL y reconstruyendo.

## Formularios

Los formularios de `contact.html` y `providers.html` validan en el navegador y envían por
`fetch` a **`send.php`**, que valida de nuevo del lado del servidor, filtra bots con un
campo trampa, limita a 6 envíos por IP cada 10 minutos y manda el correo al mostrador.
Si el visitante tiene JavaScript desactivado, el envío normal del formulario funciona
igual y `send.php` lo devuelve a la página con la confirmación.

Por diseño **solo piden datos de contacto, nunca información clínica**, y así lo advierte
el propio formulario. Si en el futuro se agregan campos clínicos, `send.php` debe
reemplazarse por un servicio de intake cifrado y conforme a HIPAA, con BAA firmado.

## Subirlo al servidor

El sitio es HTML estático: sirve cualquier hosting. Para cPanel / Apache:

1. **Suba estos archivos** a `public_html/` (o la raíz del dominio):
   `*.html`, `assets/`, `send.php`, `.htaccess`, `robots.txt`, `sitemap.xml`,
   `site.webmanifest`.
   **No suba** `src/`, `tools/`, `dist/`, `node_modules/` ni `README.md` — el `.htaccess`
   ya los bloquea por si acaso.
2. **Cambie el dominio** si no es `bestamericandiagnostics.com`: edite la constante `SITE`
   en `tools/build.py` (o exporte `SITE_URL=https://sudominio.com`), ejecute
   `python3 tools/build.py` y suba de nuevo. Eso actualiza canonical, Open Graph,
   datos estructurados y `sitemap.xml`. Ajuste también la línea `Sitemap:` de `robots.txt`.
3. **Correo del formulario**: `MAIL_TO` ya apunta a `billing@bestamericandiagnostics.com`.
   Revise `MAIL_FROM` (`website@bestamericandiagnostics.com`): debe existir como buzón o
   alias **en su propio dominio**, o el correo no pasará los filtros de spam.
4. **Revise el `.htaccess`**: fuerza HTTPS, redirige `www` a dominio pelado, comprime,
   cachea los estáticos un año, añade cabeceras de seguridad (CSP incluida) y usa
   `404.html`. Si su hosting ya forza HTTPS, borre ese bloque para no duplicar redirecciones.
   Para nginx use `nginx.conf.example`.
5. **Después de publicar**: envíe `sitemap.xml` en Google Search Console, conecte el Google
   Business Profile y verifique la tarjeta social pegando la URL en WhatsApp.

`proposal.html` lleva `noindex` y está excluido del sitemap y de `robots.txt`: es la
presentación interna, no una página del sitio público.

### Comprobación previa

```bash
php -S 127.0.0.1:8811        # sirve el sitio Y prueba send.php de verdad
npm test                     # las cuatro suites seguidas
```

| Suite | Qué verifica |
| --- | --- |
| `npm run audit` | Enlaces rotos, iconos faltantes, `alt`, un solo `h1`, errores JS, switch EN/ES |
| `npm run check` | Destino de cada `tel:`, WhatsApp, `mailto:`, acción del formulario y destinatario en `send.php` |
| `npm run check:buttons` | Hace clic de verdad: mega menú, acordeones, pestañas, menú móvil, idioma, volver arriba, formulario completo, panel de accesibilidad (perfiles, pasos, persistencia, reset), banner de cookies, enlaces externos con `rel="noopener"`, cero `href="#"` |
| `npm run check:responsive` | 8 dispositivos de 320 px a 1920 px: cero desbordamiento horizontal y ningún control por debajo de 30 px de alto |

## Preview en un solo archivo

```bash
python3 tools/bundle.py      # -> dist/preview.html
```

Empaqueta las ocho páginas, el CSS, el JavaScript y todas las imágenes (como data URI)
en **un único HTML autocontenido**: se abre con doble clic, sin servidor, y sirve para
mandarle el sitio completo al cliente por correo o por link. Los formularios muestran su
estado de confirmación sin enviar nada.

## Utilidades de desarrollo

```bash
npm install            # solo si va a usar las herramientas de captura (Playwright)
npm run shot           # capturas de página completa en .screenshots/
node tools/shot.js index.html --jpeg   # versión comprimida y recortada, fácil de compartir
npm run audit          # enlaces rotos, iconos faltantes, alt, errores JS, switch EN/ES
```
