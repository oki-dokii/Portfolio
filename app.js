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

// Text Wave Hover
const monoHeadings = document.querySelectorAll('.mono-heading');
monoHeadings.forEach(heading => {
  if (heading.textContent.trim() === 'Feature Presentation') {
    const text = heading.textContent.trim();
    heading.innerHTML = '';
    heading.classList.add('wave-text-container');

    const chars = [];
    text.split('').forEach(char => {
      if (char === ' ') {
        const space = document.createElement('span');
        space.innerHTML = '&nbsp;';
        heading.appendChild(space);
      } else {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.classList.add('hover-char');
        heading.appendChild(charSpan);
        chars.push(charSpan);
      }
    });

    chars.forEach((charSpan, i) => {
      charSpan.addEventListener('mouseenter', () => {
        if (chars[i - 1]) chars[i - 1].classList.add('neighbor-1');
        if (chars[i + 1]) chars[i + 1].classList.add('neighbor-1');
        if (chars[i - 2]) chars[i - 2].classList.add('neighbor-2');
        if (chars[i + 2]) chars[i + 2].classList.add('neighbor-2');
      });
      charSpan.addEventListener('mouseleave', () => {
        if (chars[i - 1]) chars[i - 1].classList.remove('neighbor-1');
        if (chars[i + 1]) chars[i + 1].classList.remove('neighbor-1');
        if (chars[i - 2]) chars[i - 2].classList.remove('neighbor-2');
        if (chars[i + 2]) chars[i + 2].classList.remove('neighbor-2');
      });
    });
  }
});

// Scattered Floating Project Cards (Reference Style)
const stageItems = gsap.utils.toArray('.stage-item');

// 5 cards positioned loosely like floating screens
const floatTransforms = [
  { x: -300, y: -20, rotX: 15, rotY: 20, rotZ: -8 }, // LoadOptimize
  { x: 0, y: -50, rotX: 10, rotY: -5, rotZ: 3 },    // DPR
  { x: 300, y: 0, rotX: 5, rotY: -25, rotZ: 6 },  // GiftAI
  { x: -160, y: 140, rotX: 20, rotY: 10, rotZ: -5 }, // SmartCampus
  { x: 160, y: 130, rotX: -15, rotY: -10, rotZ: 12 }, // SmartClinic
];

let floatTweens = [];

stageItems.forEach((item, i) => {
  const t = floatTransforms[i];

  gsap.set(item, {
    x: t.x,
    y: t.y,
    rotationX: t.rotX,
    rotationY: t.rotY,
    rotationZ: t.rotZ,
    opacity: 0,
    scale: 0.6
  });

  gsap.to(item, {
    opacity: 1,
    scale: 0.9,
    duration: 1.5,
    delay: 0.2 + i * 0.1,
    ease: "power3.out"
  });

  // Continuous subtle float
  let ft = gsap.to(item, {
    y: t.y + 15,
    rotationX: t.rotX + 5,
    rotationY: t.rotY - 5,
    duration: 3 + Math.random() * 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: 1.5 + Math.random()
  });
  floatTweens.push(ft);
});

// Register Flip
gsap.registerPlugin(ScrollTrigger, Flip);

// Scroll trigger for Stage to Grid transition
let st = ScrollTrigger.create({
  trigger: "#grid-anchor",
  start: "top center+=200", // Start snap earlier right below text 
  onEnter: () => {
    document.querySelector('.project-section').classList.add('settled');

    // Pause the background floating animations so we flip cleanly
    floatTweens.forEach(t => t.pause());

    const stageCards = gsap.utils.toArray('.stage-card');
    const featCards = gsap.utils.toArray('.feat-card');
    const state = Flip.getState(stageCards);

    // Swap DOM locations
    featCards.forEach((target, i) => {
      if (stageCards[i]) {
        target.insertBefore(stageCards[i], target.firstChild);
        stageCards[i].classList.add('grid-mode');
      }
    });

    Flip.from(state, {
      duration: 1.0,
      ease: "power2.inOut",
      stagger: 0.05
    });

    // Explicitly hide text before starting fade-in
    gsap.set('.feat-info', { opacity: 0 });
    // Start fading in text only AFTER flying images have settled
    gsap.to('.feat-info', { opacity: 1, duration: 0.6, delay: 1.1, stagger: 0.1 });
    gsap.to('.stage-item', { opacity: 0, duration: 0.3 }); // Fade out float containers
  },
  onLeaveBack: () => {
    document.querySelector('.project-section').classList.remove('settled');

    // Instantly hide text so flying objects don't pass over it
    gsap.killTweensOf('.feat-info');
    gsap.set('.feat-info', { opacity: 0 });

    const stageCards = gsap.utils.toArray('.stage-card');
    const stageItemsArray = gsap.utils.toArray('.stage-item');
    const state = Flip.getState(stageCards);

    // Return to pile
    stageItemsArray.forEach((item, i) => {
      if (stageCards[i]) {
        item.appendChild(stageCards[i]);
        stageCards[i].classList.remove('grid-mode');
      }
    });

    Flip.from(state, {
      duration: 1.2,
      ease: "power3.inOut",
      stagger: -0.05,
      onComplete: () => {
        // Resume floating after returning to exact scatter pos
        floatTweens.forEach(t => t.play());
      }
    });

    // No need to animate feat-info to 0 anymore, it's instantly hidden above
    gsap.to('.stage-item', { opacity: 1, duration: 0.5, delay: 0.3 });
  }
});


// Typewriter for Hero Role
const roles = ["Software Engineer", "Full-Stack Dev", "AI/ML Enthusiast", "Optimization Expert"];
let roleIdx = 0;
const roleEl = document.getElementById('hero-role');

function typeRole() {
  const text = roles[roleIdx];
  let charIdx = 0;
  roleEl.textContent = "";

  const interval = setInterval(() => {
    roleEl.textContent += text[charIdx];
    charIdx++;
    if (charIdx >= text.length) {
      clearInterval(interval);
      setTimeout(eraseRole, 2000);
    }
  }, 100);
}

function eraseRole() {
  const text = roleEl.textContent;
  let charIdx = text.length;

  const interval = setInterval(() => {
    roleEl.textContent = text.substring(0, charIdx - 1);
    charIdx--;
    if (charIdx <= 0) {
      clearInterval(interval);
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(typeRole, 500);
    }
  }, 50);
}
if (roleEl) typeRole();

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

/* ─── Project Section Transition ─── */
(function () {
  const projectSection = document.getElementById('projects');
  const stageItems = document.querySelectorAll('.stage-item');
  if (!projectSection) return;

  // Mouse Parallax for Floating Items
  window.addEventListener('mousemove', (e) => {
    if (projectSection.classList.contains('settled')) return;

    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;

    stageItems.forEach((item, i) => {
      const factor = (i + 1) * 0.2;
      item.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });
})();

/* ─── Footer Cube Interaction ─── */
(function () {
  const trigger = document.getElementById('cube-trigger');
  const cube = document.getElementById('ui-cube');
  if (!trigger || !cube) return;

  trigger.addEventListener('mousemove', (e) => {
    const rect = trigger.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Higher sensitivity and smoother mapping
    const rx = ((y / rect.height) - 0.5) * -70;
    const ry = ((x / rect.width) - 0.5) * 70;

    cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  trigger.addEventListener('mouseleave', () => {
    // Return to a nice neutral isometric angle
    cube.style.transform = `rotateX(-15deg) rotateY(30deg)`;
  });
})();

/* ─── Lightbox for Certificates ─── */
(function () {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbClose = document.getElementById('lb-close');
  const certCards = document.querySelectorAll('.cert-card');

  if (!lightbox || !lbImg || !lbClose) return;

  certCards.forEach(card => {
    card.addEventListener('click', () => {
      const fullSrc = card.getAttribute('data-full');
      lbImg.src = fullSrc;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock scroll
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scroll
    setTimeout(() => { lbImg.src = ''; }, 400); // Clear src after transition
  };

  lbClose.addEventListener('click', closeLightbox);

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
})();

/* ─── Neural Network Background ─── */
(function () {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 120; // Increased
  const connectionDistance = 160; // Increased visibility
  let mouse = { x: null, y: null, radius: 180 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1.5; // Bigger
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      if (mouse.x !== null && mouse.y !== null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 4;
          this.y += (dy / dist) * force * 4;
        }
      }
    }

    draw() {
      ctx.fillStyle = 'rgba(0, 150, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          let opacity = (1 - (dist / connectionDistance)) * 0.5; // More opaque
          ctx.strokeStyle = `rgba(0, 150, 255, ${opacity})`;
          ctx.lineWidth = 1.2; // Thicker lines
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  init();
  animate();

  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    let currentScroll = window.scrollY;
    let delta = currentScroll - lastScroll;
    lastScroll = currentScroll;

    particles.forEach(p => {
      p.y -= delta * 0.08;
    });
  }, { passive: true });
})();

// ════════════════════════════════
// GITHUB STATS FETCHER
// ════════════════════════════════
async function fetchGitHubStats() {
  try {
    const username = 'oki-dokii';

    // 1. Fetch public profile for repo count
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) return;
    const userData = await userRes.json();

    const reposEl = document.getElementById('github-repos');
    if (reposEl && userData.public_repos) {
      reposEl.textContent = userData.public_repos + '+';
    }

    // 2. Fetch repos for language aggregation
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    if (!reposRes.ok) return;
    const reposData = await reposRes.json();

    const langCounts = {};
    reposData.forEach(repo => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    });

    // Get Top 2 Languages
    const topLangs = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(entry => entry[0]);

    const langsEl = document.getElementById('github-langs');
    if (langsEl && topLangs.length > 0) {
      // Abbreviate common long languages to fit beautifully in the UI
      const formattedLangs = topLangs.map(l => {
        if (l === 'TypeScript') return 'TS';
        if (l === 'JavaScript') return 'JS';
        if (l === 'Python') return 'Py';
        return l;
      }).join(', ');
      langsEl.textContent = formattedLangs;
    }

    // 3. Fetch public commits count dynamically
    // Note: GitHub search API is rate-limited heavily for unauthenticated users, so if it fails, it leaves the hardcoded fallback
    const commitsRes = await fetch(`https://api.github.com/search/commits?q=author:${username}`, {
      headers: { 'Accept': 'application/vnd.github.cloak-preview+json' }
    });
    if (commitsRes.ok) {
      const commitsData = await commitsRes.json();
      const commitsEl = document.getElementById('github-commits');
      if (commitsEl && commitsData.total_count !== undefined) {
        // For accounts with older history that aren't public, u can optionally add a baseline. 
        // Rendering the exact scraped public commits:
        commitsEl.textContent = commitsData.total_count.toLocaleString();
      }
    }
  } catch (error) {
    console.error('Quietly failed to fetch GitHub stats due to rate limiting or connection:', error);
  }
}

// Call fetcher directly since script is loaded at the end of the body
// fetchGitHubStats();

/* ════════════════════════════════
   AI CHAT ASSISTANT LOGIC
   ════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const chatBtn = document.getElementById('ai-chat-btn');
  const chatPanel = document.getElementById('ai-chat-panel');
  const chatClose = document.getElementById('ai-chat-close');
  const chatBody = document.getElementById('ai-chat-body');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSubmit = document.getElementById('ai-chat-submit');
  const chatSuggestions = document.querySelectorAll('.ai-chip');

  if (!chatBtn || !chatPanel) return;

  // Toggle panel
  chatBtn.addEventListener('click', () => {
    chatPanel.classList.remove('hidden');
    chatBtn.classList.add('hidden');
    chatInput.focus();
  });

  chatClose.addEventListener('click', () => {
    chatPanel.classList.add('hidden');
    chatBtn.classList.remove('hidden');
  });

  // Handle messages
  function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('ai-msg', sender);
    msgDiv.innerHTML = text; // allow html formatted responses
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Pre-programmed Knowledge Base (Local RAG substitute)
  const knowledgeBase = [
    {
      keywords: ['project', 'built', 'build', 'work', 'portfolio'],
      response: '<p>Soham has architected several high-impact projects:</p><ul><li><strong>LoadOptimize</strong>: An AI pipeline that reduced delivery cost by 18%.</li><li><strong>DPR Analyser</strong>: An LLM-based RAG tool for financial risk parsing.</li><li><strong>GiftAI</strong>: A smart chatbot for product recommendations.</li><li><strong>SmartCampus & SmartClinic</strong>: Scalable management systems built with Spring Boot.</li></ul>'
    },
    {
      keywords: ['explain', 'ai', 'systems', 'intelligence', 'rag', 'llm', 'machine learning'],
      response: '<p>Soham specializes in integrating AI into practical applications. For instance, in <strong>DPR Analyser</strong>, he used <em>LLMs and RAG</em> to transform 100+ page PDFs into structured schemas for financial risk analysis. In <strong>GiftAI</strong>, he built a conversational recommendation engine using <em>Prompt Engineering and external APIs</em>.</p>'
    },
    {
      keywords: ['github', 'repo', 'commits', 'code', 'open source'],
      response: '<p>Soham is very active on GitHub! He has over <strong>1,200 commits</strong> and <strong>23+ repositories</strong> under the handle <a href="https://github.com/oki-dokii" target="_blank" style="color:var(--blue);">@oki-dokii</a>. His top languages are TypeScript and Python.</p>'
    },
    {
      keywords: ['problem', 'biggest', 'real-world', 'impact', 'challenge', 'logistics', 'loadoptimize'],
      response: '<p><strong>LoadOptimize</strong> solved a massive real-world problem: logistics companies struggling with empty truck runs. By designing an AI heuristic optimization engine mathematically focusing on capacity utilization and CO2, he simulated an <strong>18% cost reduction</strong>. This actually won him the <em>Smart India Hackathon 2025</em>!</p>'
    },
    {
      keywords: ['hello', 'hi', 'hey', 'greetings', 'who'],
      response: 'Hello there! I am Soham\'s digital AI assistant. I am trained entirely on his portfolio context. Feel free to ask me anything about his projects, skills, impact, or GitHub.'
    },
    {
      keywords: ['contact', 'hire', 'email', 'linkedin', 'phone', 'connect'],
      response: 'You can reach Soham directly via email at <a href="mailto:Soham.Banerjee3106@gmail.com" style="color:var(--blue);">Soham.Banerjee3106@gmail.com</a> or connect with him extensively on <a href="https://www.linkedin.com/in/soham-banerjee-tech" target="_blank" style="color:var(--blue);">LinkedIn</a>.'
    }
  ];

  // Comprehensive Soham Developer Context for the true LLM
  const SOHAM_CONTEXT = `
You are Soham Banerjee's AI Portfolio Assistant. You must act as a helpful, concise, and enthusiastic assistant embedded in his portfolio website.
Here is the core information you know about Soham:
- Projects: LoadOptimize (AI pipeline reducing delivery cost by 18%, won SIH 2025), DPR Analyser (LLM/RAG tool for financial parsing), GiftAI (smart chatbot), SmartCampus & SmartClinic (scalable management systems).
- GitHub: Very active, 1200+ commits, 23+ repos. Handles @oki-dokii. Top languages: TypeScript, Python, Java, JavaScript.
- Email: Soham.Banerjee3106@gmail.com
- Character rules: DO NOT HALLUCINATE. Only answer questions using the facts provided above. If asked something unrelated or code-heavy, steer the conversation gracefully back to Soham's projects or skills. Keep responses short and web-friendly (under 3 sentences). You can use HTML formatting tags like <b> or <i> or <br>.
  `;

  async function getBotResponse(userText) {
    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    const typingMsg = document.createElement('div');
    typingMsg.id = typingId;
    typingMsg.classList.add('ai-msg', 'bot');
    typingMsg.innerHTML = '<span style="opacity:0.6;font-size:0.9em;">Thinking...</span>';
    chatBody.appendChild(typingMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      // Build exactly structured prompt for Pollinations Text Endpoint
      const promptText = encodeURIComponent(SOHAM_CONTEXT + "\n\nUser Question: " + userText + "\nYour concise response:");

      const response = await fetch('https://text.pollinations.ai/' + promptText, {
        method: 'GET'
      });

      let answer = "";
      if (response.ok) {
        answer = await response.text();
        // Basic sanity check to prevent empty chunks
        if (!answer || answer.trim() === "") answer = "I apologize, my AI circuits misfired. Could you ask that again?";
      } else {
        answer = "Wow, your question was so intense it overloaded my free API limit! Please ping Soham directly on LinkedIn instead.";
      }

      // Remove typing indicator and show real text
      document.getElementById(typingId)?.remove();
      addMessage(answer, 'bot');

    } catch (e) {
      document.getElementById(typingId)?.remove();
      addMessage("Connection error while reaching my AI brain. I'm currently running on low bandwidth!", 'bot');
    }
  }

  function handleUserInput() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Show User Msg
    addMessage(text, 'user');
    chatInput.value = '';

    // 2. Actually fetch from LLM!
    getBotResponse(text);
  }

  // Event Listeners
  chatSubmit.addEventListener('click', handleUserInput);

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserInput();
    }
  });

  // Suggestion Chips
  chatSuggestions.forEach(chip => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.textContent;
      handleUserInput();
    });
  });
});
