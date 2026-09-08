# AT Nova — landing

Sitio estático. Sin build: se sube tal cual y funciona.

**Posicionamiento:** el producto principal son los asistentes de WhatsApp con IA y las
integraciones de IA. La página web es un servicio de soporte que alimenta al asistente,
no el eje del negocio. El orden de servicios, planes, casos y métricas refleja esa jerarquía.

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

https://snzxvss.github.io/atnova/

El `canonical`, `og:image`, `og:url`, el JSON-LD y el `sitemap.xml` ya apuntan ahi.
Si el sitio se mueve a un dominio propio hay que actualizar esos cinco puntos y
crear un archivo `CNAME`.

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
| Responde | $590.000 | $290.000 + $99.000/mes | 4 días hábiles |
| Responde + Web | $990.000 | $490.000 (3 meses de IA incluidos) | 7 días hábiles |
| Vende | $1.450.000 | $700.000 (3 meses de IA incluidos) | 12 días hábiles |
| Automatiza | — | Cotización en 24 h | Entregas quincenales |

Add-ons: 3.000 conversaciones extra $99.000/mes · hosting y soporte $39.000/mes ·
reentrenamiento mensual del bot $149.000/mes.

Los plazos cuentan días hábiles desde que el cliente entrega su lista de precios y sus
preguntas frecuentes, y se pausan durante las aprobaciones.

**Ojo con el margen:** el consumo de la API de WhatsApp que cobra Meta va aparte
($60.000–$120.000/mes típico para un negocio pequeño) y está declarado en las FAQ para
que no aparezca como sorpresa en la primera factura. Desde el 1 de octubre de 2026 Meta
cobra por mensaje entregado, no por conversación: conviene revisar la mensualidad contra
el volumen real antes de firmar contratos largos.

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

Los nombres de empresa de los casos, los tres testimonios, «38 asistentes», «4.9/5»,
«12.400 conversaciones» y «68% resueltas sin intervenir» son inventados. Reemplazarlos por
datos reales antes de hacer campaña paga: en Colombia la SIC sanciona la publicidad
engañosa y un testimonio atribuido a una empresa concreta califica como tal.
