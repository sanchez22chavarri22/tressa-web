(() => {
'use strict';

/* ── NAV: sombra al hacer scroll + menú móvil ── */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20), { passive: true });

const burger = document.getElementById('burger');
const navlinks = document.getElementById('navlinks');
function setMenu(open) {
  navlinks.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
burger.addEventListener('click', () => setMenu(!navlinks.classList.contains('open')));
navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && navlinks.classList.contains('open')) { setMenu(false); burger.focus(); } });
addEventListener('resize', () => { if (innerWidth > 880) setMenu(false); });

/* ── REVEAL on scroll + contadores ── */
const fmt = n => n.toLocaleString('es-CL');
function animCount(el) {
  if (el.dataset.plain) { el.textContent = el.dataset.plain; return; }
  const target = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1700;
  (function step(t) {
    const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(Math.round(target * e)) + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('vis');
  if (e.target.dataset.count !== undefined) animCount(e.target);
  io.unobserve(e.target);
}), { threshold: .2 });
document.querySelectorAll('.reveal, [data-count]').forEach(el => io.observe(el));

/* ── SERVICIO: spotlight que sigue el mouse ── */
document.querySelectorAll('.serv-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* ── SOLUCIONES: filtro por categoría ── */
const filter = document.getElementById('solFilter');
const sols = [...document.querySelectorAll('#solGrid .sol')];
filter.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.classList.contains('active') ? 'true' : 'false'));
filter.addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  filter.querySelectorAll('.chip').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
  const f = btn.dataset.f;
  sols.forEach(s => {
    const show = f === 'todos' || (s.dataset.cat || '').includes(f);
    s.style.display = show ? '' : 'none';
  });
});

/* ── CLIENTES marquee (clientes reales de tressa.cl) ── */
const CLIENTES = ['Agrosuper', 'Nestlé', 'Codelco', 'Walmart', 'Cencosud', 'Sodexo', 'Starbucks',
  'Ariztía', 'Camanchaca', 'Lipigas', 'Unimarc', 'Tottus', 'Dreams', 'Fantasilandia',
  'Softys', 'Unifrutti', 'Sopraval', 'WOM', 'Pronto', 'OK Market', 'Aqua', 'Castaño',
  'Rosa Agustina', 'Super Salmón', 'Tip Top', 'JBA'];
const chip = c => `<span class="client"><span class="cd"></span>${c}</span>`;
const half = Math.ceil(CLIENTES.length / 2);
const a = CLIENTES.slice(0, half), b = CLIENTES.slice(half);
const mq1 = document.getElementById('mq1'), mq2 = document.getElementById('mq2');
if (mq1) mq1.innerHTML = [...a, ...a].map(chip).join('');
if (mq2) mq2.innerHTML = [...b, ...b].map(chip).join('');

/* ── Emojis decorativos: ocultos a lectores de pantalla ── */
document.querySelectorAll('.serv-card .ic, .sol .ic, .mv-card .ic, .cinfo .ic, .cert .seal, .chain-card .big, .hero-eyebrow .pulse')
  .forEach(e => e.setAttribute('aria-hidden', 'true'));

/* ── BACK TO TOP ── */
const totop = document.getElementById('totop');
addEventListener('scroll', () => totop.classList.toggle('show', scrollY > 700), { passive: true });
totop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

})();
