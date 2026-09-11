/* ============================================================
   AT Nova — landing
   Todo el comportamiento comercial vive en CONFIG.
   Bajar la intensidad = tocar solo este objeto.
   ============================================================ */

const CONFIG = {
  whatsapp: '573046521755',

  // Contador: ventana rodante por visitante (estilo Temu).
  // Cambiar a { modo:'fecha', hasta:'2026-09-30T23:59:59-05:00' } para una fecha fija real.
  contador: { modo: 'rodante', horas: 47, reinicioHoras: 47 },

  // Escasez de cupos
  cupos: { total: 12, minLibres: 2, maxLibres: 5 },

  // Ruleta: los pesos controlan la probabilidad real de cada premio
  ruleta: [
    { txt: '$40.000 OFF',        peso: 22 },
    { txt: '1 mes gratis',       peso: 14 },
    { txt: '$80.000 OFF',        peso: 12 },
    { txt: '2 meses gratis',     peso: 14 },
    { txt: '$60.000 OFF',        peso: 16 },
    { txt: 'Web sin costo',      peso: 14 },
    { txt: '$120.000 OFF',       peso: 3  },
    { txt: 'Otra vuelta',        peso: 5  }
  ],

  // Notificaciones de actividad
  toasts: {
    activo: true,
    primerRetraso: 9000,
    intervalo: [16000, 30000],
    items: [
      ['Carlos R.', 'Medellín', 'acaba de cotizar el plan Responde'],
      ['Diana L.', 'Barranquilla', 'reservó su cupo de septiembre'],
      ['Ferretería El Tornillo', 'Bogotá', 'ya tiene el bot contestando'],
      ['Andrés M.', 'Bucaramanga', 'conectó el asistente a su punto de venta'],
      ['Paola G.', 'Cali', 'pidió demo del asistente hace 4 minutos'],
      ['Restaurante La Vereda', 'Pereira', 'automatizó los pedidos de la noche'],
      ['Mateo S.', 'Cartagena', 'contrató el plan Conecta'],
      ['Clínica Sonrisa', 'Manizales', 'agendó su diagnóstico gratis'],
      ['Luisa F.', 'Ibagué', 'pidió cotización para agendar citas'],
      ['Camilo T.', 'Villavicencio', 'reclamó el 51% de descuento']
    ]
  },

  exitIntent: { activo: true, minutos: 15, esperaMovil: 25000 }
};

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Los ResizeObserver viven aquí para que nada los recoja como basura.
const observadores = new Set();
const store = {
  get(k)    { try { return JSON.parse(localStorage.getItem('atn_' + k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem('atn_' + k, JSON.stringify(v)); } catch {} }
};

/* ---------------- WhatsApp ---------------- */
const waLink = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

function conectarWhatsApp() {
  $$('[data-wa]').forEach(el => {
    el.setAttribute('href', waLink(el.dataset.wa));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
}

/* ---------------- Header sticky ---------------- */
function initHeader() {
  const hdr = $('#hdr');
  const onScroll = () => hdr.classList.toggle('is-stuck', window.scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const nav = $('#nav');
  burger.addEventListener('click', () => {
    const abierto = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(abierto));
    burger.querySelector('use').setAttribute('href', abierto ? '#i-x' : '#i-menu');
  });
  nav.addEventListener('click', e => {
    if (e.target.tagName !== 'A') return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.querySelector('use').setAttribute('href', '#i-menu');
  });
}

/* ---------------- Contador ---------------- */
function fechaLimite() {
  const c = CONFIG.contador;
  if (c.modo === 'fecha') return new Date(c.hasta).getTime();

  let fin = store.get('deadline');
  if (!fin || fin < Date.now()) {
    // Se reinicia en cuanto expira: siempre hay una oferta corriendo.
    fin = Date.now() + (fin ? c.reinicioHoras : c.horas) * 3600e3;
    store.set('deadline', fin);
  }
  return fin;
}

function initContador() {
  const pad = n => String(n).padStart(2, '0');
  const els = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };
  const mini = $('#miniT');
  let fin = fechaLimite();

  const tick = () => {
    let dif = fin - Date.now();
    if (dif <= 0) { fin = fechaLimite(); dif = fin - Date.now(); }

    const d = Math.floor(dif / 864e5);
    const h = Math.floor(dif / 36e5) % 24;
    const m = Math.floor(dif / 6e4) % 60;
    const s = Math.floor(dif / 1e3) % 60;

    els.d.textContent = pad(d);
    els.h.textContent = pad(h);
    els.m.textContent = pad(m);
    els.s.textContent = pad(s);
    if (mini) mini.textContent = `${pad(d * 24 + h)}:${pad(m)}:${pad(s)}`;
  };

  tick();
  setInterval(tick, 1000);
}

/* ---------------- Cupos ---------------- */
function initCupos() {
  const { total, minLibres, maxLibres } = CONFIG.cupos;

  let libres = store.get('cupos');
  if (typeof libres !== 'number') {
    libres = minLibres + Math.floor(Math.random() * (maxLibres - minLibres + 1));
    store.set('cupos', libres);
  }

  const barra = $('#cuposBar');
  const frase = $('#cuposFrase');

  // Con un solo cupo la frase cambia de número: "queda 1 cupo", no "quedan 1 cupos".
  const pintar = n => {
    $('#cuposLeft').textContent = n;
    if (!frase) return;
    frase.replaceChildren(
      n === 1 ? 'Queda ' : 'Quedan ',
      Object.assign(document.createElement('b'), { textContent: String(n) }),
      n === 1 ? ' cupo este mes' : ' cupos este mes'
    );
  };

  pintar(libres);

  const pct = ((total - libres) / total) * 100;
  // Se anima al entrar en pantalla, no al cargar: se nota más.
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      barra.style.width = pct + '%';
      obs.disconnect();
    });
  }, { threshold: .4 }).observe(barra);

  // Va bajando durante la sesión, sin llegar nunca a cero.
  if (libres > 1) {
    setTimeout(() => {
      libres--;
      store.set('cupos', libres);
      pintar(libres);
      barra.style.width = ((total - libres) / total) * 100 + '%';
    }, 95000);
  }
}

/* ---------------- Ruleta ---------------- */
function initRuleta() {
  const wheel = $('#wheel');
  const btn = $('#spinBtn');
  const labels = $('#wheelLabels');
  const premios = CONFIG.ruleta;
  const n = premios.length;
  const paso = 360 / n;

  premios.forEach(p => {
    const span = document.createElement('span');
    span.textContent = p.txt;
    labels.appendChild(span);
  });
  const etiquetas = [...labels.children];

  // Las etiquetas se colocan en píxeles, así que hay que recalcularlas cada vez
  // que la rueda cambia de tamaño. Con un radio fijo se salían del círculo en
  // pantallas de menos de 340 px.
  const colocarEtiquetas = () => {
    const R = wheel.clientWidth / 2;
    if (!R) return;

    // La fuente se fija aquí y no con unidades de contenedor en CSS: aquellas se
    // resuelven en otra pasada de layout y `offsetWidth` devolvía medidas de la
    // fuente anterior, dejando las etiquetas descolocadas un frame.
    const cuerpo = Math.max(8.5, Math.min(11.5, R * 0.07));
    etiquetas.forEach(s => { s.style.fontSize = cuerpo + 'px'; });

    const margen = R * 0.07;              // aire entre el texto y el borde
    const anchoMayor = Math.max(...etiquetas.map(s => s.offsetWidth));
    // Arranca a un tercio del radio; si el texto no cabe, se acerca al centro
    // antes que desbordar. El cubo del botón ocupa el 26% central.
    const radio = Math.min(R * 0.32, Math.max(R * 0.17, R - margen - anchoMayor));

    etiquetas.forEach((span, i) => {
      const centro = i * paso + paso / 2;   // grados desde arriba, en sentido horario
      const ang = centro - 90;
      // Las de la mitad izquierda se voltean para que ninguna quede cabeza abajo.
      span.style.transform = centro > 180
        ? `rotate(${ang + 180}deg) translate(${-(radio + span.offsetWidth)}px, -0.5em)`
        : `rotate(${ang}deg) translate(${radio}px, -0.5em)`;
    });
  };

  colocarEtiquetas();

  // Al girar el teléfono el círculo cambia de tamaño y las posiciones ya no valen.
  // Se recalcula en el acto (son ocho elementos) y se repite un instante después
  // por si el layout todavía se estaba asentando.
  let asentar = 0;
  const reubicar = () => {
    colocarEtiquetas();
    clearTimeout(asentar);
    asentar = setTimeout(colocarEtiquetas, 150);
  };

  // El observador se guarda en `observadores`: creado al vuelo con
  // `new ResizeObserver(...).observe(x)` nadie lo referencia y el recolector
  // de basura puede llevárselo, con lo que deja de avisar de los cambios.
  const observador = new ResizeObserver(reubicar);
  observador.observe(wheel);
  observadores.add(observador);

  // Respaldo por si el observador no llega a dispararse en algún navegador.
  addEventListener('resize', reubicar, { passive: true });
  addEventListener('orientationchange', reubicar);

  // Bricolage Grotesque llega después del primer render: los anchos medidos con
  // la tipografía de respaldo dejan torcidas las etiquetas de la izquierda.
  document.fonts?.ready.then(colocarEtiquetas);

  const ganador = () => {
    const total = premios.reduce((a, p) => a + p.peso, 0);
    let r = Math.random() * total;
    for (let i = 0; i < n; i++) { r -= premios[i].peso; if (r <= 0) return i; }
    return 0;
  };

  // `desplazar` solo en un giro recién hecho: al recargar la página el premio
  // ya guardado no debe secuestrar el scroll del visitante.
  const mostrarPremio = (txt, desplazar) => {
    const caja = $('#spinPrize');
    $('#spinPrizeText').textContent = txt;
    $('#spinClaim').dataset.wa = `Hola AT Nova, giré la ruleta de la página y me salió: ${txt}. Quiero reclamarlo junto con el descuento de lanzamiento.`;
    conectarWhatsApp();
    caja.hidden = false;
    if (desplazar) caja.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const yaGiro = store.get('spin');
  if (yaGiro) {
    btn.disabled = true;
    btn.textContent = 'YA GIRASTE';
    mostrarPremio(yaGiro, false);
  }

  let vueltas = 0;
  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = 'Girando…';

    const i = ganador();
    // El pin está arriba: hay que dejar el centro del sector i bajo el pin.
    const destino = 360 - (i * paso + paso / 2);
    vueltas += 6;
    wheel.style.transform = `rotate(${vueltas * 360 + destino}deg)`;

    setTimeout(() => {
      const premio = premios[i].txt;
      if (premio === 'Otra vuelta') {
        btn.disabled = false;
        btn.textContent = 'GIRAR';
        toast('¡Casi!', 'Te salió otra vuelta. Prueba de nuevo');
        return;
      }
      btn.textContent = 'YA GIRASTE';
      store.set('spin', premio);
      mostrarPremio(premio, true);
    }, 5100);
  });
}

/* ---------------- Toasts de actividad ---------------- */
let toastTimer;
function toast(titulo, sub) {
  const cont = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <span class="toast__av">${titulo.trim().charAt(0).toUpperCase()}</span>
    <div><b></b><span></span></div>`;
  el.querySelector('b').textContent = titulo;
  el.querySelector('span:last-child').textContent = sub;
  cont.appendChild(el);

  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 400);
  }, 5600);
}

function initToasts() {
  if (!CONFIG.toasts.activo) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pool = [...CONFIG.toasts.items];
  const [min, max] = CONFIG.toasts.intervalo;

  const siguiente = () => {
    if (!pool.length) pool.push(...CONFIG.toasts.items);
    const i = Math.floor(Math.random() * pool.length);
    const [nombre, ciudad, accion] = pool.splice(i, 1)[0];
    const hace = 2 + Math.floor(Math.random() * 40);
    toast(`${nombre} · ${ciudad}`, `${accion} — hace ${hace} min`);
    toastTimer = setTimeout(siguiente, min + Math.random() * (max - min));
  };

  toastTimer = setTimeout(siguiente, CONFIG.toasts.primerRetraso);
  addEventListener('pagehide', () => clearTimeout(toastTimer));
}

/* ---------------- Formulario → WhatsApp ---------------- */
function initForm() {
  const form = $('#qform');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const d = new FormData(form);
    const premio = store.get('spin');

    const lineas = [
      'Hola AT Nova, quiero cotizar.',
      '',
      `Nombre: ${d.get('nombre')}`,
      d.get('negocio') ? `Negocio: ${d.get('negocio')}` : null,
      `Necesito: ${d.get('servicio')}`,
      d.get('msg') ? `Detalle: ${d.get('msg')}` : null,
      '',
      'Vengo de la promo de lanzamiento (53% OFF).',
      premio ? `Y en la ruleta me salió: ${premio}.` : null
    ].filter(Boolean);

    open(waLink(lineas.join('\n')), '_blank', 'noopener');
  });
}

/* ---------------- Popup de salida ---------------- */
function initExitIntent() {
  if (!CONFIG.exitIntent.activo) return;
  if (store.get('exitVisto')) return;

  const modal = $('#exitModal');
  let mostrado = false;

  const abrir = () => {
    if (mostrado) return;
    mostrado = true;
    store.set('exitVisto', true);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('[data-close]').focus?.();

    let restante = CONFIG.exitIntent.minutos * 60;
    const out = $('#exitT');
    const t = setInterval(() => {
      restante--;
      if (restante <= 0) { clearInterval(t); out.textContent = '00:00'; return; }
      out.textContent = `${String(Math.floor(restante / 60)).padStart(2, '0')}:${String(restante % 60).padStart(2, '0')}`;
    }, 1000);
  };

  const cerrar = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  $$('[data-close]', modal).forEach(el => el.addEventListener('click', cerrar));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) cerrar(); });

  // Escritorio: el mouse sale por arriba de la ventana.
  document.addEventListener('mouseout', e => {
    if (!e.relatedTarget && e.clientY <= 0) abrir();
  });

  // Móvil: no hay mouse, así que se dispara por tiempo o por scroll de vuelta arriba.
  if (matchMedia('(pointer: coarse)').matches) {
    setTimeout(abrir, CONFIG.exitIntent.esperaMovil);
  }
}

/* ---------------- Revelado al hacer scroll ---------------- */
function initReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const objetivos = $$('.svc, .plan, .caso, .tst, .addons li, .band div, .faq details');

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      // Se anima `translate` (propiedad independiente) y no `transform`, para
      // no pisar las rotaciones que ya traen las tarjetas desde el CSS.
      e.target.animate(
        [{ opacity: 0, translate: '0 20px' }, { opacity: 1, translate: 'none' }],
        { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
      );
      obs.unobserve(e.target);
    });
  }, { threshold: .1, rootMargin: '0px 0px -50px' });

  objetivos.forEach(el => { el.style.opacity = '0'; io.observe(el); });
}

/* ---------------- Arranque ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  conectarWhatsApp();
  initHeader();
  initContador();
  initCupos();
  initRuleta();
  initForm();
  initReveal();
  initToasts();
  initExitIntent();
});
