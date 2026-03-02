/* ── app.js – Portfolio Interactions ── */

/* ─── Hero Entrance Animation ─── */
let heroEntranceDone = false;

(function () {
  const seq = (fn, ms) => setTimeout(fn, ms);

  const heroText = document.querySelector('.hero-text');
  const heroBio = document.querySelector('.hero-bio');
  const fanTags = document.querySelectorAll('.fan-tag');
  const fanCards = document.querySelectorAll('.fan-card');
  const centerCard = document.querySelector('.fc3');

  // Stack ALL cards at center via inline style — transition hasn't fired yet.
  // The CSS opacity:0 already hides them. The inline transform overrides fc1-fc5.
  fanCards.forEach(card => {
    card.style.transform = 'rotate(0deg) translateX(0) translateY(0) scale(0.88)';
  });

  // Phase 1 (150ms) — hero text slides down into view
  seq(() => {
    if (heroText) heroText.classList.add('anim-in');
  }, 150);

  // Phase 2 (1000ms) — center card fades in, still at center
  seq(() => {
    if (centerCard) centerCard.classList.add('fan-visible');
  }, 1000);

  // Phase 3 (1550ms) — fan out: remove inline transform overrides → CSS
  //   class transforms (fc1–fc5) take over, animated by the .65s transition
  seq(() => {
    requestAnimationFrame(() => {
      fanCards.forEach(c => {
        c.style.transform = ''; // release to CSS class position
        c.classList.add('fan-visible');
      });
    });
  }, 1550);

  // Phase 4 (2350ms) — bio text slides up
  seq(() => {
    if (heroBio) heroBio.classList.add('anim-in');
  }, 2350);

  // Phase 5 (2800ms) — tags pop down with stagger, then unlock clicks
  seq(() => {
    fanTags.forEach((t, i) => seq(() => t.classList.add('anim-in'), i * 200));
    seq(() => { heroEntranceDone = true; }, 600);
  }, 2800);
})();


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
  const positions = ['fc1', 'fc2', 'fc3', 'fc4', 'fc5'];
  const cards = Array.from(document.querySelectorAll('.fan-card'));
  if (!cards.length) return;

  let order = [0, 1, 2, 3, 4];
  let animating = false;

  function applyPositions() {
    cards.forEach((card, cardIdx) => {
      const posIdx = order.indexOf(cardIdx);
      positions.forEach(p => card.classList.remove(p));
      card.classList.add(positions[posIdx]);
      card.style.zIndex = posIdx === 2 ? '5' : posIdx === 1 || posIdx === 3 ? '2' : '1';
    });
  }

  cards.forEach((card, cardIdx) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      if (!heroEntranceDone) return; // locked during entrance
      if (animating) return;

      const currentPosIdx = order.indexOf(cardIdx);
      if (currentPosIdx === 2) return; // already center

      animating = true;

      const shift = currentPosIdx - 2;
      if (shift > 0) {
        for (let i = 0; i < shift; i++) order.push(order.shift());
      } else {
        for (let i = 0; i < -shift; i++) order.unshift(order.pop());
      }

      applyPositions();
      setTimeout(() => { animating = false; }, 350);
    });
  });
})();
