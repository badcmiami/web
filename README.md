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

Cada imagen del sitio es un **SVG generado** (`tools/make_assets.py`): duotonos abstractos
en la paleta de marca, sin licencias de terceros. Son marcadores de posición y se
reemplazan **sin tocar el HTML**.

```bash
export PEXELS_API_KEY=xxxxxxxx        # clave gratuita en pexels.com/api
python3 tools/fetch_photos.py         # descarga y recorta todas las fotos
python3 tools/fetch_photos.py hero mri  # solo algunas
python3 tools/build.py                # el build cambia el placeholder por la foto
```

`photos.json` define los diez huecos de foto (`hero`, `lobby`, `mri`, `ct`, `mammography`,
`ultrasound`, `xray`, `cardiac`, `tech`, `team`) con su búsqueda y su proporción. Para fijar
una foto concreta, pegue su URL de Pexels en el campo `url` de ese hueco. Los créditos del
fotógrafo quedan en `assets/photos/credits.json`.

El mecanismo es automático: `<img data-photo="mri">` usa el SVG mientras no exista
`assets/photos/mri.jpg`, y cambia a la foto —con `loading="lazy"`— en cuanto el archivo
aparece. También sirve para la fotografía propia del centro: basta copiar los archivos con
esos nombres en `assets/photos/`.

> Las fotos **no se descargaron desde aquí**: el proxy de red de este entorno bloquea
> `pexels.com`. El script está listo y probado en su lógica; corre en cuanto lo ejecute
> desde su máquina con la clave.

## Reseñas de Google

La sección de reseñas de la home se genera desde **`reviews.json`**: calificación, número de
reseñas y las tarjetas con nombre, fecha, estrellas y texto en los dos idiomas. Mientras las
entradas tengan `"placeholder": true`, el sitio imprime automáticamente una nota diciendo que
son de ejemplo — así nunca se publica una reseña inventada como si fuera real.

Para poner las reales: copie el texto de su perfil de Google Business, pegue cada una en
`reviews.json`, ponga `"placeholder": false`, ajuste `rating` y `count`, y reconstruya. Si
añade el `google_place_id` en `site.json`, el botón «Escribir una reseña» lleva directo al
formulario de Google en vez de a la ficha del mapa.

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
| `npm run check:buttons` | Hace clic de verdad: mega menú, acordeones, pestañas, menú móvil, idioma, volver arriba, formulario completo, enlaces externos con `rel="noopener"`, cero `href="#"` |
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
