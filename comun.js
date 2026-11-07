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
};
const msg = (e) => MENSAJES[e.code] || 'Algo no funcionó. Revisa tu conexión e intenta de nuevo.';

function aplicarMarca(cfg) {
  const r = document.documentElement.style;
  if (cfg.color) r.setProperty('--marca', cfg.color);
  if (cfg.color2) r.setProperty('--marca-2', cfg.color2);
  if (cfg.fondo) r.setProperty('--fondo-marca', cfg.fondo);
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
const dinero = (n) => 'B/. ' + Number(n || 0).toFixed(2).replace(/\.00$/, '');
const telBonito = (t) => (t || '').replace(/^(\d{4})(\d{4})$/, '$1-$2');
const LOTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5c2.1 2.6 2.1 6.9 0 9.5-2.1-2.6-2.1-6.9 0-9.5z"/><path d="M12 14c-2.6-.4-5.8-2.6-6.8-6.3 3.2.2 5.9 2.2 6.8 6.3z"/><path d="M12 14c2.6-.4 5.8-2.6 6.8-6.3-3.2.2-5.9 2.2-6.8 6.3z"/><path d="M4 16.5c2.4 1.8 5 2.5 8 2.5s5.6-.7 8-2.5"/></svg>';
