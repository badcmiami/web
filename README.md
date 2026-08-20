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
| `locations.html` | Dos sedes, horarios (resalta el día actual), acceso, cómo llegar |
| `patients.html` | Qué traer, preparación por estudio (pestañas), seguros, formularios, FAQ |
| `providers.html` | Médicos referentes: tiempos, cómo referir, formulario |
| `about.html` | Historia, valores, equipo médico, calidad y acreditaciones |
| `contact.html` | Formulario de cita con validación + datos directos |
| `proposal.html` | **La presentación**: dirección, identidad, marca, alcance y fases (`noindex`) |
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

## ⚠️ Contenido a confirmar antes de publicar

Este prototipo se construyó **sin acceso directo al sitio actual** (el entorno de trabajo
bloquea la navegación externa), por lo que los textos son propuestas de referencia
redactadas a partir de la información pública del centro. Antes del lanzamiento hay que
validar con el cliente:

1. **Datos de contacto y sedes** — teléfonos (305) 681-7555 / (305) 825-1535, fax
   (305) 681-7040, direcciones 637 E 49th St y 5005 E 8th Ave (Hialeah, FL 33013) y el
   horario Lun–Vie 8:00 am – 6:00 pm.
2. **Lista de servicios por sede** — se asumieron 7 modalidades; confirmar cuáles se
   realizan y en cuál sede.
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
| `logo-mark-inverse.svg` | Marca sobre Infinity Navy — pie de página |
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

## Imágenes

El resto de las imágenes son **SVG generados** (`tools/make_assets.py`): duotonos abstractos
en la paleta de marca, sin licencias de terceros. Están pensados como marcadores de posición —
reemplácelos por fotografía real del centro respetando las mismas proporciones
(`scene-*.svg`, `fig--tall` 4:5, `fig--wide` 16:10, `fig--sq` 1:1). Los mapas
(`map-1.svg`, `map-2.svg`) se sustituyen por Google Maps embebido.

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
3. **Configure el correo del formulario**: abra `send.php` y cambie `MAIL_TO` (dónde llegan
   las solicitudes) y `MAIL_FROM` (una dirección **de su propio dominio**, o el correo no
   pasará los filtros de spam).
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
php -S 127.0.0.1:8000        # sirve el sitio Y prueba send.php de verdad
npm run audit                # enlaces, iconos, alt, errores JS y el switch EN/ES
```

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
