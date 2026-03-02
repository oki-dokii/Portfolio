/* ── app.js – Portfolio Interactions ── */

/* ─── TYPEWRITER for hero role ─── */
const roles = ['Software Engineer', 'Full-Stack Dev', 'AI / ML Explorer', 'SIH Winner', 'Problem Solver'];
let ri = 0, ci = 0, deleting = false;
const roleEl = document.getElementById('hero-role');

function typeLoop() {
  const word = roles[ri];
  if (!deleting) {
    roleEl.textContent = word.slice(0, ++ci);
    if (ci === word.length) { deleting = true; setTimeout(typeLoop, 2000); return; }
  } else {
    roleEl.textContent = word.slice(0, --ci);
    if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
  }
  setTimeout(typeLoop, deleting ? 50 : 100);
}
typeLoop();

/* ─── Extended Cut cycling word ─── */
const extWords = ['web dev', 'backend', 'AI tools', 'hackathons', 'data engineering'];
let ewi = 0;
const extEl = document.getElementById('ext-cycling');
if (extEl) {
  setInterval(() => {
    extEl.style.opacity = '0';
    setTimeout(() => {
      ewi = (ewi + 1) % extWords.length;
      extEl.textContent = extWords[ewi];
      extEl.style.opacity = '1';
    }, 300);
  }, 1800);
  extEl.style.transition = 'opacity .3s ease';
  extEl.style.color = '#0080ff';
}

/* ─── Scroll reveal ─── */
const elems = document.querySelectorAll(
  '.feat-card, .ext-card, .jcard, .media-card, .contact-pill, .sg-chips, .float-widget'
);
elems.forEach(el => el.classList.add('reveal'));
const ro = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), (i % 5) * 80);
      ro.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
elems.forEach(el => ro.observe(el));

/* ─── Nav active highlight ─── */
const sections = document.querySelectorAll('section[id]');
const nis = document.querySelectorAll('.ni');
const sectionMap = { hero: '#hero', projects: '#projects', journey: '#journey', github: '#github', achievements: '#achievements', stack: '#stack', contact: '#contact' };
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      nis.forEach(n => n.style.color = '');
      const href = sectionMap[e.target.id];
      const match = document.querySelector(`.ni[href="${href}"]`);
      if (match) match.style.color = '#ffffff';
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => secObs.observe(s));

/* ─── Smooth anchor scroll ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ─── Subtle cursor glow ─── */
const glow = document.createElement('div');
Object.assign(glow.style, {
  position: 'fixed', pointerEvents: 'none', zIndex: '9999',
  width: '400px', height: '400px', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(0,128,255,0.04) 0%, transparent 70%)',
  transform: 'translate(-50%,-50%)',
  transition: 'left .15s ease, top .15s ease',
  left: '-500px', top: '-500px'
});
document.body.appendChild(glow);
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

/* ─── Fan card click-to-front (smooth, no jitter) ─── */
(function () {
  // The 5 position classes in fan order (left → right)
  const positions = ['fc1', 'fc2', 'fc3', 'fc4', 'fc5'];

  // Track current order: positions[i] is held by cards[order[i]]
  const cards = Array.from(document.querySelectorAll('.fan-card'));
  if (!cards.length) return;

  // order[i] = which card index is currently at position i
  let order = [0, 1, 2, 3, 4];
  let animating = false;

  function applyPositions() {
    cards.forEach((card, cardIdx) => {
      // find which position this card is at
      const posIdx = order.indexOf(cardIdx);
      // remove all position classes, add the right one
      positions.forEach(p => card.classList.remove(p));
      card.classList.add(positions[posIdx]);
      // bring front card on top
      card.style.zIndex = posIdx === 2 ? '5' : posIdx === 1 || posIdx === 3 ? '2' : '1';
    });
  }

  cards.forEach((card, cardIdx) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      if (animating) return;

      const currentPosIdx = order.indexOf(cardIdx);
      if (currentPosIdx === 2) return; // already center — do nothing

      animating = true;

      // Rotate the order array so clicked card ends up at index 2 (center)
      const shift = currentPosIdx - 2;
      if (shift > 0) {
        // clicked card is to the right → rotate left
        for (let i = 0; i < shift; i++) order.push(order.shift());
      } else {
        // clicked card is to the left → rotate right
        for (let i = 0; i < -shift; i++) order.unshift(order.pop());
      }

      applyPositions();

      // unlock after transition completes (matches CSS transition duration .3s)
      setTimeout(() => { animating = false; }, 350);
    });
  });
})();

