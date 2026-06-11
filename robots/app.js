(() => {
'use strict';

/* ───────── NAV ───────── */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), {passive: true});

/* ───────── HERO: canvas estilo barrido LiDAR ───────── */
const cv = document.getElementById('lidar');
const ctx = cv.getContext('2d');
let W, H, pts = [];
function resize() {
  W = cv.width = cv.offsetWidth * devicePixelRatio;
  H = cv.height = cv.offsetHeight * devicePixelRatio;
  pts = Array.from({length: 130}, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: (Math.random() * 1.6 + .4) * devicePixelRatio,
    tw: Math.random() * Math.PI * 2,
    vx: (Math.random() - .5) * .12 * devicePixelRatio,
    vy: (Math.random() - .5) * .12 * devicePixelRatio
  }));
}
resize(); addEventListener('resize', resize);

let ang = 0;
function lidarFrame() {
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H * .62, maxR = Math.hypot(W, H) * .56;
  ctx.strokeStyle = 'rgba(38,198,218,.07)';
  ctx.lineWidth = devicePixelRatio;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath(); ctx.arc(cx, cy, maxR * i / 4.4, 0, Math.PI * 2); ctx.stroke();
  }
  ang += .0042;
  if (ctx.createConicGradient) {
    const sweep = ctx.createConicGradient(ang, cx, cy);
    sweep.addColorStop(0, 'rgba(38,198,218,.14)');
    sweep.addColorStop(.08, 'rgba(38,198,218,.025)');
    sweep.addColorStop(.16, 'rgba(38,198,218,0)');
    sweep.addColorStop(1, 'rgba(38,198,218,0)');
    ctx.fillStyle = sweep;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, maxR, 0, Math.PI * 2); ctx.fill();
  }
  for (const p of pts) {
    p.tw += .025; p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    const pa = Math.atan2(p.y - cy, p.x - cx);
    let diff = (pa - ang) % (Math.PI * 2);
    if (diff < 0) diff += Math.PI * 2;
    const lit = Math.max(0, 1 - diff / 1.1);
    const a = .12 + Math.abs(Math.sin(p.tw)) * .1 + lit * .55;
    ctx.fillStyle = `rgba(123,227,242,${a})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + lit * p.r, 0, Math.PI * 2); ctx.fill();
  }
  requestAnimationFrame(lidarFrame);
}
requestAnimationFrame(lidarFrame);

/* ───────── HERO 3D: fallback si Spline no carga ───────── */
const hero3d = document.getElementById('hero3d');
if (hero3d) {
  setTimeout(() => {
    const viewer = hero3d.querySelector('spline-viewer');
    const ok = viewer && viewer.shadowRoot && viewer.shadowRoot.querySelector('canvas');
    if (!ok) hero3d.classList.add('failed');
  }, 9000);
}

/* ───────── Spotlight que sigue el mouse (tarjetas) ───────── */
document.querySelectorAll('.acc, .pstep').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* ───────── MARQUEE capacidades ───────── */
const CAPS = ['Navegación AI Never‑Lost™', 'LiDAR 3D 360°', 'Reportes en la nube',
  'Detección de personas', 'Actualizaciones OTA', 'Mapas de cobertura verificados',
  'Operación silenciosa', 'Soporte Tressa en terreno', 'Monitoreo 24/7'];
const track = document.getElementById('capTrack');
if (track) track.innerHTML = [...CAPS, ...CAPS].map(c => `<span class="cap"><i>◆</i>${c}</span>`).join('');

/* ───────── STATEMENT: palabras que se encienden ───────── */
const st = document.getElementById('stWords');
if (st) {
  const frag = document.createDocumentFragment();
  for (const node of [...st.childNodes]) {
    if (node.nodeType === 3) {
      for (const w of node.textContent.split(/\s+/).filter(Boolean)) {
        const s = document.createElement('span');
        s.className = 'w'; s.textContent = w;
        frag.appendChild(s); frag.appendChild(document.createTextNode(' '));
      }
    } else frag.appendChild(node);
  }
  st.replaceChildren(frag);
  const words = [...st.querySelectorAll('.w')];
  addEventListener('scroll', () => {
    const r = st.getBoundingClientRect();
    const prog = Math.min(1, Math.max(0, (innerHeight * .78 - r.top) / (innerHeight * .9)));
    const n = Math.floor(prog * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  }, {passive: true});
}

/* ───────── REVEALS + CONTADORES ───────── */
const fmtCL = n => n.toLocaleString('es-CL');
function animCount(el) {
  const target = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  const t0 = performance.now(), dur = 1700;
  (function step(t) {
    const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + fmtCL(Math.round(target * e)) + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('vis');
  if (e.target.dataset.count) animCount(e.target);
  io.unobserve(e.target);
}), {threshold: .2});
document.querySelectorAll('.reveal,[data-count]').forEach(el => io.observe(el));

/* ───────── PARALLAX producto ───────── */
const pImgs = [...document.querySelectorAll('.parallax')];
function parallax() {
  for (const img of pImgs) {
    const r = img.getBoundingClientRect();
    const c = (r.top + r.height / 2 - innerHeight / 2) * (+img.dataset.speed || .05);
    img.style.transform = `translateY(${-c}px)`;
  }
}
addEventListener('scroll', () => requestAnimationFrame(parallax), {passive: true});
parallax();

/* ───────── PANTALLA AD: rotación de slides ───────── */
const adscreen = document.getElementById('adscreen');
if (adscreen) {
  const slides = [...adscreen.querySelectorAll('.ad-slide')];
  const dots = [...adscreen.querySelectorAll('.ad-dots span')];
  let cur = 0;
  setInterval(() => {
    cur = (cur + 1) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('on', i === cur));
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
  }, 2600);
}

/* ───────── INTELIGENCIA: pasos ───────── */
const steps = [...document.querySelectorAll('.istep')];
const ioSteps = new IntersectionObserver(es => es.forEach(e =>
  e.target.classList.toggle('on', e.isIntersecting)
), {rootMargin: '-38% 0px -38% 0px'});
steps.forEach(s => ioSteps.observe(s));

/* ───────── FAQ accordion ───────── */
document.querySelectorAll('.qa button').forEach(btn => btn.addEventListener('click', () => {
  const qa = btn.parentElement, ans = qa.querySelector('.ans');
  const open = qa.classList.toggle('open');
  ans.style.maxHeight = open ? ans.scrollHeight + 'px' : '0';
  document.querySelectorAll('.qa').forEach(other => {
    if (other !== qa && other.classList.contains('open')) {
      other.classList.remove('open');
      other.querySelector('.ans').style.maxHeight = '0';
    }
  });
}));

/* ───────── MAPA: presencia por ciudad (datos generales) ───────── */
const CIUDADES = [
  {n: 'San Felipe',  lat: -32.7497, lng: -70.7253},
  {n: 'Gran Valparaíso', lat: -33.0608, lng: -71.3823},
  {n: 'Santiago',    lat: -33.45,   lng: -70.66, big: true},
  {n: 'Chillán',     lat: -36.6066, lng: -72.1034},
  {n: 'Temuco',      lat: -38.7359, lng: -72.5904},
  {n: 'Valdivia',    lat: -39.8142, lng: -73.2459},
  {n: 'Osorno',      lat: -40.5739, lng: -73.1335}
];
const mapa = L.map('mapa', {scrollWheelZoom: false, zoomControl: false, attributionControl: false});
L.control.attribution({prefix: false}).addAttribution('© OpenStreetMap © CARTO').addTo(mapa);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {maxZoom: 12}).addTo(mapa);
mapa.fitBounds(CIUDADES.map(c => [c.lat, c.lng]), {padding: [50, 50]});
mapa.on('click', () => mapa.scrollWheelZoom.enable());
for (const c of CIUDADES) {
  const size = c.big ? 20 : 14;
  L.marker([c.lat, c.lng], {icon: L.divIcon({
    className: '', html: `<div class="pulse-dot" style="width:${size}px;height:${size}px"></div>`,
    iconSize: [size, size], iconAnchor: [size / 2, size / 2]
  })}).addTo(mapa).bindPopup(`<b>${c.n}</b><br>Robots Tressa en operación`);
}
document.getElementById('cityChips').innerHTML =
  CIUDADES.map(c => `<span class="city">${c.n}</span>`).join('');

/* ───────── LIGHTBOX ───────── */
const lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg');
document.querySelectorAll('.work').forEach(w => w.addEventListener('click', () => {
  lbImg.src = w.dataset.img; lb.classList.add('open');
}));
document.getElementById('lbX').addEventListener('click', () => lb.classList.remove('open'));
lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

})();
