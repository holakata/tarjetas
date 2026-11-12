// Kata Studio · funciones compartidas
const KATA = {
  url: 'https://pxviwzkfljcvmrwrselw.supabase.co',
  key: 'sb_publishable_l-V4Nhz_lHpEafNLNwCPqQ_XTGVlzaL',
};
const sb = window.supabase.createClient(KATA.url, KATA.key, { auth: { persistSession: true, storageKey: 'kata-panel' } });

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const params = new URLSearchParams(location.search);

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};

async function rpc(fn, args = {}) {
  const { data, error } = await sb.rpc(fn, args);
  if (error) {
    const m = (error.message || '').trim();
    const e = new Error(m); e.code = m; throw e;
  }
  return data;
}

const MENSAJES = {
  negocio: 'No encontramos este negocio.',
  nombre: 'Escribe tu nombre.',
  telefono: 'Revisa el número de WhatsApp.',
  pin: 'El código debe tener 4 números.',
  existe: 'Ese WhatsApp ya tiene tarjeta. Entra con tu código.',
  datos: 'El WhatsApp o el código no coinciden.',
  cliente: 'No encontramos tu tarjeta en este celular.',
  qr: 'Ese QR ya cambió. Escanea el de recepción otra vez.',
  hoy: 'Ya sumaste tu sello de hoy. Te esperamos en tu próxima visita.',
  sin_premio: 'Todavía no tienes un premio listo.',
  sin_cumple: 'No hay regalo de cumpleaños disponible.',
  regalo: 'Esta tarjeta de regalo ya no está activa.',
  vencida: 'Esta tarjeta de regalo ya venció.',
  permiso: 'Tu sesión terminó. Vuelve a entrar.',
  codigo: 'No encontramos ese código.',
  usado: 'Ese código ya se usó.',
  expirado: 'Ese código venció. Pide al cliente que lo vuelva a abrir.',
  monto: 'Revisa el monto.',
  para: 'Escribe para quién es.',
  servicio: 'Escribe el servicio.',
  sin_vip: 'Esta membresía no está activa.',
  vip_cuota: 'La membresía se activa en recepción.',
  vip: 'El club no está disponible.',
  vip_hoy: 'El descuento del club ya se aplicó hoy.',
  incluido_usado: 'Ese servicio incluido ya se usó este mes.',
  nivel: 'Escoge el nivel de la membresía.',
  meses: 'Escoge el tiempo de la membresía.',
  promo: 'Puedes tener hasta 6 promociones.',
  no_cliente: 'Ese WhatsApp todavía no tiene tarjeta. Primero el cliente la crea escaneando el QR del mostrador.',
};
const msg = (e) => MENSAJES[e.code] || 'Algo no funcionó. Revisa tu conexión e intenta de nuevo.';

function hexRgb(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mezclar(a, b, t) { const x = hexRgb(a), y = hexRgb(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; }
function aplicarMarca(cfg, slug) {
  const r = document.documentElement.style;
  if (cfg.color) r.setProperty('--marca', cfg.color);
  if (cfg.color2) r.setProperty('--marca-2', cfg.color2);
  if (cfg.fondo) r.setProperty('--fondo-marca', cfg.fondo);
  // Tonos derivados calculados aquí (no con color-mix de CSS, que los iPhone con iOS viejo no entienden)
  const m1 = cfg.color || '#2B86C2', m2 = cfg.color2 || '#123A5E', ac = cfg.color3 || m1;
  r.setProperty('--acento', ac);
  r.setProperty('--acento-glow', rgba(ac, .55));
  r.setProperty('--acento-suave', rgba(ac, .35));
  r.setProperty('--marca-claro', mezclar(m1, '#ffffff', .18));
  r.setProperty('--marca-oscuro', mezclar(m2, '#000000', .38));
  r.setProperty('--sombra-marca', rgba(m2, .3));
  if (slug) { const g = {}; for (const k of ['--marca', '--marca-2', '--fondo-marca', '--acento', '--acento-glow', '--acento-suave', '--marca-claro', '--marca-oscuro', '--sombra-marca']) g[k] = r.getPropertyValue(k); store.set('kata-marca-' + slug, JSON.stringify(g)); }
  const tc = document.querySelector('meta[name="theme-color"][data-marca]'); if (tc && cfg.color2) tc.content = cfg.color2;
}

function qrSVG(texto, px = 240) {
  const q = qrcode(0, 'M');
  q.addData(texto); q.make();
  const n = q.getModuleCount(), cel = px / (n + 2);
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${((x + 1) * cel).toFixed(2)} ${((y + 1) * cel).toFixed(2)}h${cel.toFixed(2)}v${cel.toFixed(2)}h-${cel.toFixed(2)}z`;
  return `<svg viewBox="0 0 ${px} ${px}" width="${px}" height="${px}" role="img" aria-label="Código QR"><rect width="${px}" height="${px}" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
}

function toast(texto, tipo = '') {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.className = 'toast ' + tipo; t.textContent = texto;
  requestAnimationFrame(() => t.classList.add('ver'));
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('ver'), 4200);
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function fechaCorta(iso) {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]}`;
}
const dinero = (n) => '$' + Number(n || 0).toFixed(2).replace(/\.00$/, '');
const telBonito = (t) => (t || '').replace(/^(\d{4})(\d{4})$/, '$1-$2');
const LOTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5c2.1 2.6 2.1 6.9 0 9.5-2.1-2.6-2.1-6.9 0-9.5z"/><path d="M12 14c-2.6-.4-5.8-2.6-6.8-6.3 3.2.2 5.9 2.2 6.8 6.3z"/><path d="M12 14c2.6-.4 5.8-2.6 6.8-6.3-3.2.2-5.9 2.2-6.8 6.3z"/><path d="M4 16.5c2.4 1.8 5 2.5 8 2.5s5.6-.7 8-2.5"/></svg>';

/* Actualización automática: si hay una versión publicada más nueva que la que está abierta
   (por ejemplo, la tarjeta guardada en la pantalla de inicio), la página se recarga sola. */
(function () {
  const meta = document.querySelector('meta[name="kata-version"]');
  if (!meta || !document.currentScript) return;
  const actual = meta.content, url = new URL('version.json', document.currentScript.src);
  let revisando = false;
  async function revisar() {
    if (revisando || document.hidden || document.querySelector('.velo, .canje, .escena')) return;
    if ([...document.querySelectorAll('input:not([type=radio]):not([type=checkbox]):not([type=date]), textarea')].some((i) => i.value.trim())) return;
    revisando = true;
    try {
      const r = await fetch(url.href + '?t=' + Date.now(), { cache: 'no-store' });
      const { v } = await r.json();
      let intento = null; try { intento = sessionStorage.getItem('kata-v'); } catch (e) {}
      if (v && v !== actual && intento !== v) {
        try { sessionStorage.setItem('kata-v', v); } catch (e) {}
        const u = new URL(location.href); u.searchParams.set('v', v); location.replace(u.href);
      }
    } catch (e) {}
    revisando = false;
  }
  revisar();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) revisar(); });
  setInterval(revisar, 10 * 60 * 1000);
})();
