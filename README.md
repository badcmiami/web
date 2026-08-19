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
| `proposal.html` | **La presentación**: dirección de diseño, marca, alcance y fases |

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

## Imágenes

Todas las imágenes son **SVG generados** (`tools/make_assets.py`): duotonos abstractos en la
paleta de marca, sin licencias de terceros. Están pensados como marcadores de posición —
reemplácelos por fotografía real del centro respetando las mismas proporciones
(`scene-*.svg`, `fig--tall` 4:5, `fig--wide` 16:10, `fig--sq` 1:1). Los mapas
(`map-1.svg`, `map-2.svg`) se sustituyen por Google Maps embebido.

El logotipo (`logo.svg`) es una propuesta con el símbolo del infinito; si existe un
logotipo definitivo, se sustituye el archivo sin tocar el resto del sistema.

## Formularios

Los formularios de `contact.html` y `providers.html` validan en el navegador y muestran un
estado de confirmación, pero **no envían nada**: falta conectar un endpoint seguro. Por
diseño solo piden datos de contacto, nunca información clínica, e incluyen el aviso
correspondiente.

## Utilidades de desarrollo

```bash
npm install            # solo si va a usar las herramientas de captura (Playwright)
npm run shot           # capturas de página completa en .screenshots/
npm run audit          # enlaces rotos, iconos faltantes, alt, errores JS, switch EN/ES
```
