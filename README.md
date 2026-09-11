# AT Nova — landing

Sitio estático. Sin build: se sube tal cual y funciona.

**Posicionamiento:** AT Nova hace **software a la medida para negocios pequeños**, y el
asistente de pedidos por WhatsApp con su panel es su producto más definido, no lo único.
El abanico se lee en `#servicios` y va de lo hecho a lo que se cotiza: asistente → panel
→ conexión con el punto de venta del negocio → páginas web → desarrollo a medida. La web
es un servicio para que encuentren al negocio, no la fuente de datos del asistente.

Los **cuatro rubros modelados** que se citan en la web salen de `atnova-flows/contratos/`
(`restaurante-pos`, `clinica-odontologia`, `tienda-variedades`, `servicios-cotizacion`) y
los detalles de cada uno —domicilio, elegir profesional, talla y color, unidad de
medida— son interruptores y atributos reales de esos archivos. Si se añade un rubro,
actualizar la tarjeta 05 y el plan «A la medida».

**Regla de contenido:** la landing no promete nada que el producto no haga hoy. Lo que
está fuera de alcance en `atnova-flows/docs/01-vision-y-alcance.md` no se menciona:
canales distintos de WhatsApp, app móvil, que el cliente edite sus propios flujos,
mensajes fuera de la ventana de 24 h (plantillas de Meta) y cobro dentro del producto.

## Estructura

```
index.html          markup + sprite de iconos Lucide inline
styles.css          dirección de arte riso/print (paleta OKLCH del logo)
app.js              contador, cupos, ruleta, avisos, cupón de salida
assets/             logo, isotipo, favicons, fotos de casos, imagen social
site.webmanifest    icono de app
.nojekyll           evita el pipeline Jekyll de GitHub Pages
```

## Publicado en

**https://www.atnova.fun** — con certificado Let's Encrypt y HTTPS forzado.

DNS gestionado en Hostinger: `CNAME www -> snzxvss.github.io` mas cuatro registros
`A` en el apex hacia las IP de GitHub Pages. El archivo `CNAME` del repositorio es
lo que le dice a Pages que sirva este dominio: si se borra, el sitio vuelve a
`snzxvss.github.io/atnova`.

El certificado lo renueva GitHub automaticamente. `atnova.fun`, `http://` y la URL
antigua de github.io redirigen todos a `https://www.atnova.fun/`.

## Publicar en GitHub Pages

```bash
git init && git add . && git commit -m "landing AT Nova"
git branch -M main
git remote add origin https://github.com/<usuario>/<repo>.git
git push -u origin main
```

En **Settings → Pages** elegir `main` / `root`.

- Repo llamado `<usuario>.github.io` → queda en `https://<usuario>.github.io`
- Repo con otro nombre → queda en `https://<usuario>.github.io/<repo>/`
- Dominio propio → crear un archivo `CNAME` con el dominio y apuntar el DNS

## Ajustar la agresividad comercial

Todo vive en el objeto `CONFIG` al inicio de `app.js`:

| Clave | Qué controla |
|---|---|
| `whatsapp` | Número de destino de todos los botones |
| `contador.modo` | `'rodante'` reinicia por visitante; `'fecha'` usa una fecha fija real |
| `cupos` | Cupos totales y rango de "disponibles" |
| `ruleta` | Premios y su probabilidad real (campo `peso`) |
| `toasts.activo` | Avisos de actividad de otros visitantes |
| `exitIntent.activo` | Cupón al intentar salir |

Para una versión sobria: `contador: { modo:'fecha', hasta:'2026-09-30T23:59:59-05:00' }`,
`toasts.activo: false`, `exitIntent.activo: false` y quitar la sección `#ruleta` del HTML.

## Precios vigentes

| Plan | Antes | Ahora | Plazo |
|---|---|---|---|
| Responde | $590.000 | $290.000 + mensualidad | 4 días hábiles |
| Responde + Web | $990.000 | $490.000 (3 meses de mensualidad incluidos) | 7 días hábiles |
| Conecta | $1.450.000 | $700.000 (3 meses de mensualidad incluidos) | 12 días hábiles |
| A la medida | — | Cotización en 24 h | Entregas quincenales |

La mensualidad va por conversaciones atendidas, según D-034 de `atnova-flows`:
$79.000 (100) · $179.000 (250) · $349.000 (500) · $690.000 (1.000). No hay plan
ilimitado: con el cobro por mensaje, un cliente hablador cuesta diez veces más que uno
callado y quien lo decide no es el negocio sino sus clientes.

Add-on: hosting y soporte de la web $39.000/mes.

Los plazos cuentan días hábiles desde que el cliente entrega su lista de precios y sus
preguntas frecuentes, y se pausan durante las aprobaciones.

**Ojo con el margen:** desde el 1 de octubre de 2026 Meta cobra por mensaje entregado y
las respuestas del bot dejan de ser gratis. El consumo va dentro de la mensualidad, así
que el plan es el que tiene que cubrirlo: una conversación cuesta unos 300 COP de media
y un pedido completo unos 410. Los números y su origen están en
`atnova-flows/docs/18-costes-y-precios.md`; cualquier cambio de tarifa se refleja aquí
antes que en la web.

## Imágenes

Las tres fotos de casos ya están integradas y optimizadas (4,3 MB originales → 224 KB).

| Archivo | Tamaño | Peso | Dónde entra |
|---|---|---|---|
| `assets/caso-panaderia.webp` | 1400×876 | 81 KB | Caso destacado |
| `assets/caso-odontologia.webp` | 1200×900 | 57 KB | Caso 2 |
| `assets/caso-moda.webp` | 1200×900 | 81 KB | Caso 3 |

Si se reemplaza alguna, mantener el nombre y volver a comprimir:

```bash
npx sharp-cli -i original.webp -o assets/ resize 1400 --fit cover -f webp -q 76
```

Cada `<img>` lleva `onerror="this.remove()"`: si el archivo falta, queda el bloque de
color risográfico y nada se rompe. Sobre cada foto se superpone una trama de puntos que
la integra con la dirección de arte, así que conviene que tengan buen contraste y no
dependan de detalle fino.

**Pendiente:** una captura real de una conversación del bot (750×1400) y una foto del
equipo (1600×1000). Con esas dos se monta la franja de confianza antes del formulario.

## Contenido que sigue siendo de relleno

Los testimonios, las métricas inventadas («38 asistentes», «4.9/5», «12.400
conversaciones», «68% resueltas sin intervenir») y los KPIs de los casos se retiraron: en
Colombia la SIC sanciona la publicidad engañosa y un testimonio atribuido a una empresa
concreta califica como tal. Las secciones que los sostenían se reescribieron con lo que
el producto hace hoy.

Siguen siendo ficticios, y hay que decidir si se quedan: los avisos de actividad
(`toasts` en `app.js`) inventan personas y negocios que acaban de contratar, y los cupos
y el contador de `CONFIG` no corresponden a una disponibilidad real. Se apagan con
`toasts.activo: false` y `contador.modo: 'fecha'`.

La imagen social (`assets/og-image.png`, generada por `.og-image.ps1`) todavía dice
«IA DESDE $290.000» y «Chatbots con IA»: hay que regenerarla con el mensaje nuevo.
