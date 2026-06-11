(() => {
'use strict';

/* ── NAV ── */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), {passive: true});

/* ── REVEALS + CONTADORES ── */
const fmtCL = n => n.toLocaleString('es-CL');
function animCount(el) {
  const target = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  const t0 = performance.now(), dur = 1600;
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
}), {threshold: .18});
document.querySelectorAll('.reveal,[data-count]').forEach(el => io.observe(el));

/* ── CLIENTES marquee (referencias públicas de tressa.cl) ── */
const CLIENTES = ['Codelco', 'Cencosud', 'Nestlé', 'Starbucks', 'Agrosuper', 'AquaChile',
  'Ariztía', 'Camanchaca', 'Lipigas', 'OK Market', 'Pronto Copec', 'Dreams',
  'Fantasilandia', 'Castaño', 'Rosa Agustina', 'Sodimac', 'Jumbo', 'Tottus'];
function fillMarquee(id, list) {
  const el = document.getElementById(id);
  if (!el) return;
  const items = [...list, ...list]; // duplicado para loop continuo
  el.innerHTML = items.map(c => `<span class="client"><span class="cd"></span>${c}</span>`).join('');
}
fillMarquee('mq1', CLIENTES.slice(0, 9));
fillMarquee('mq2', CLIENTES.slice(9));

/* ── BENTO: glow que sigue el mouse ── */
document.querySelectorAll('.bcard').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

})();
