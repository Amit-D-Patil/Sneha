/* ============================================================
   FOR SNEHA — Full Feature Script
   Features: custom cursor · sparkle trail · scroll progress ·
   particles · floating hearts · fireworks · confetti ·
   scroll reveal · stagger reveal · chapter progress dots ·
   lightbox · tilt cards · stats counter · music player ·
   PWA install prompt · typewriter · toast · replay
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   UTILITY
────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));

function showToast(msg, duration = 3200) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), duration);
}

/* ──────────────────────────────────────────────────────────
   CANVAS SETUP (shared resize logic)
────────────────────────────────────────────────────────── */
function resizeCanvas(canvas) {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* ──────────────────────────────────────────────────────────
   CUSTOM CURSOR + SPARKLE TRAIL
────────────────────────────────────────────────────────── */
function initCursor() {
  const cursor = $('#cursor');
  const ring   = $('#cursor-ring');
  if (!cursor || !ring) return;

  // Use CSS transform directly — no lag rAF loop for dot
  document.addEventListener('mousemove', e => {
    const x = e.clientX, y = e.clientY;
    // Dot follows instantly via CSS transform (no lag)
    cursor.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
    spawnSparkle(x, y);
  }, { passive: true });

  // Ring follows with slight lag via rAF
  let rx = -100, ry = -100, tx = -100, ty = -100;
  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
  }, { passive: true });

  function animRing() {
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
    requestAnimationFrame(animRing);
  }
  animRing();

  // hover enlargement
  document.addEventListener('mouseover', e => {
    if (e.target.closest('button, a, .scroll-card, .polaroid, figure, .progress-dot')) {
      cursor.style.width  = '20px';
      cursor.style.height = '20px';
      cursor.style.background = 'var(--gold)';
      ring.style.width  = '54px';
      ring.style.height = '54px';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('button, a, .scroll-card, .polaroid, figure, .progress-dot')) {
      cursor.style.width  = '';
      cursor.style.height = '';
      cursor.style.background = '';
      ring.style.width  = '';
      ring.style.height = '';
    }
  });
}

/* sparkle trail */
const SPARKLE_COLORS = ['#f0b429','#f06292','#9c27b0','#29b6f6','#66bb6a','#ff8a65'];
let lastSparkle = 0;
function spawnSparkle(x, y) {
  const now = Date.now();
  if (now - lastSparkle < 40) return;
  lastSparkle = now;

  const s = document.createElement('div');
  s.className = 'sparkle';
  const size = randInt(4, 9);
  s.style.cssText = `
    width:${size}px; height:${size}px;
    left:${x}px; top:${y}px;
    background:${SPARKLE_COLORS[randInt(0, SPARKLE_COLORS.length - 1)]};
    --tx:${rand(-30, 30)}px; --ty:${rand(-30, 30)}px;
    border-radius:50%; opacity:.85;
  `;
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 750);
}

/* ──────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR
────────────────────────────────────────────────────────── */
function initScrollBar() {
  const bar = $('#scroll-bar');
  if (!bar) return;
  function update() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
}

/* ──────────────────────────────────────────────────────────
   PARTICLES
────────────────────────────────────────────────────────── */
function initParticles() {
  const field = $('#particles');
  if (!field) return;

  const COLORS  = ['#f0b429','#fcd97d','#f06292','#9c27b0','#29b6f6','#66bb6a'];
  const COUNT   = window.innerWidth < 700 ? 18 : 35;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const size = rand(2, 5);
    p.style.cssText = `
      left:${rand(0, 100)}vw;
      width:${size}px; height:${size}px;
      background:${COLORS[randInt(0, COLORS.length - 1)]};
      animation-duration:${rand(12, 26)}s;
      animation-delay:${rand(0, 22)}s;
      opacity:${rand(0.1, 0.5)};
    `;
    field.appendChild(p);
  }
}

/* ──────────────────────────────────────────────────────────
   FLOATING HEARTS
────────────────────────────────────────────────────────── */
const HEART_CHARS = ['♥','❤','💕','💖','💗','💓','💝'];
function initFloatingHearts() {
  const layer = $('#hearts-layer');
  if (!layer) return;

  function spawnHeart() {
    const h = document.createElement('span');
    h.className = 'flt-heart';
    h.textContent = HEART_CHARS[randInt(0, HEART_CHARS.length - 1)];
    h.style.cssText = `
      left:${rand(2, 96)}vw;
      font-size:${rand(0.9, 2.2)}rem;
      animation-duration:${rand(10, 20)}s;
      animation-delay:${rand(0, 4)}s;
      color:hsl(${randInt(320, 380)}, 80%, 70%);
      filter:blur(${rand(0, .5)}px);
    `;
    layer.appendChild(h);
    setTimeout(() => h.remove(), 22000);
  }

  // Spawn immediately a few
  for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 900);
  setInterval(spawnHeart, 2400);
}

/* ──────────────────────────────────────────────────────────
   FIREWORKS
────────────────────────────────────────────────────────── */
function initFireworks() {
  const canvas = $('#fireworks-canvas');
  if (!canvas) return;
  resizeCanvas(canvas);
  window.addEventListener('resize', () => resizeCanvas(canvas));

  const ctx = canvas.getContext('2d');
  const FW_COLORS = [
    '#f0b429','#f06292','#9c27b0','#29b6f6','#66bb6a',
    '#ff8a65','#fcd97d','#e91e8c','#5c6bc0','#26c6da'
  ];

  class Particle {
    constructor(x, y, color) {
      this.x = x; this.y = y;
      this.color = color;
      this.angle  = rand(0, Math.PI * 2);
      this.speed  = rand(1.5, 6);
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.life   = 1;
      this.decay  = rand(0.012, 0.025);
      this.radius = rand(1.5, 3.5);
      this.gravity = 0.07;
    }
    update() {
      this.vx *= 0.97;
      this.vy *= 0.97;
      this.vy += this.gravity;
      this.x  += this.vx;
      this.y  += this.vy;
      this.life -= this.decay;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle   = this.color;
      ctx.shadowBlur  = 6;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let fwParticles = [];
  let fwActive = false;
  let fwTimer = null;

  function launchFirework() {
    const x = rand(canvas.width * 0.15, canvas.width * 0.85);
    const y = rand(canvas.height * 0.1, canvas.height * 0.55);
    const color = FW_COLORS[randInt(0, FW_COLORS.length - 1)];
    const count = randInt(80, 130);
    for (let i = 0; i < count; i++) {
      fwParticles.push(new Particle(x, y, color));
    }
  }

  function fwLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fwParticles = fwParticles.filter(p => p.life > 0);
    fwParticles.forEach(p => { p.update(); p.draw(); });
    if (fwActive) requestAnimationFrame(fwLoop);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // export so we can trigger from outside
  window._launchFireworks = function(duration = 4000) {
    fwActive = true;
    fwLoop();
    const interval = setInterval(launchFirework, 350);
    fwTimer = setTimeout(() => {
      clearInterval(interval);
      fwActive = false;
    }, duration);
  };
}

/* ──────────────────────────────────────────────────────────
   CONFETTI BURST
────────────────────────────────────────────────────────── */
function initConfetti() {
  const canvas = $('#confetti-canvas');
  if (!canvas) return;
  resizeCanvas(canvas);
  window.addEventListener('resize', () => resizeCanvas(canvas));

  const ctx = canvas.getContext('2d');
  const CONF_COLORS = [
    '#f0b429','#f06292','#9c27b0','#29b6f6','#66bb6a',
    '#ff8a65','#fcd97d','#e91e8c','#26c6da','#fff'
  ];

  class Confetto {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x  = rand(0, canvas.width);
      this.y  = initial ? rand(-canvas.height, 0) : rand(-60, -10);
      this.w  = rand(6, 14);
      this.h  = rand(4, 9);
      this.color = CONF_COLORS[randInt(0, CONF_COLORS.length - 1)];
      this.angle = rand(0, Math.PI * 2);
      this.spin  = rand(-0.08, 0.08);
      this.vx    = rand(-2, 2);
      this.vy    = rand(2.5, 6);
      this.life  = 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.spin;
      this.vx *= 0.995;
      if (this.y > canvas.height + 20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    }
  }

  let pieces = [];
  let confActive = false;

  function confLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => { p.update(); p.draw(); });
    if (confActive) requestAnimationFrame(confLoop);
    else {
      setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 3000);
    }
  }

  window._burstConfetti = function(duration = 5000) {
    pieces = Array.from({ length: 160 }, () => new Confetto());
    confActive = true;
    confLoop();
    setTimeout(() => { confActive = false; }, duration);
  };
}

/* ──────────────────────────────────────────────────────────
   OPENING COVER SEQUENCE
────────────────────────────────────────────────────────── */
function initCover() {
  const coverLines = $$('.cover-line');
  coverLines.forEach((line, i) => {
    setTimeout(() => line.classList.add('show'), 400 + i * 1100);
  });

  // tagline fades in after last line
  const tagline = $('#coverTagline');
  if (tagline) {
    setTimeout(() => tagline.classList.add('show'),
      400 + coverLines.length * 1100 + 200);
  }

  const beginBtn = $('#beginBtn');
  const cover    = $('#cover');
  const story    = $('#story');

  // Button ripple
  beginBtn.addEventListener('click', e => {
    const rect = beginBtn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const d = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${d}px; height:${d}px;
      left:${e.clientX - rect.left - d/2}px;
      top:${e.clientY - rect.top - d/2}px;`;
    beginBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);

    // Transition out cover
    cover.style.transition = 'opacity 1.1s ease, transform 1.1s ease';
    cover.style.opacity = '0';
    cover.style.transform = 'scale(1.04)';
    setTimeout(() => {
      cover.style.display = 'none';
      story.hidden = false;
      requestAnimationFrame(() => {
        story.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      initReveals();
      initScrollRevealStagger();
      initTiltCards();
      initStatsCounters();
      initLightbox();
    }, 1100);
  });
}

/* ──────────────────────────────────────────────────────────
   SCROLL REVEAL
────────────────────────────────────────────────────────── */
function initReveals() {
  const targets = $$('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(t => io.observe(t));
}

function initScrollRevealStagger() {
  const targets = $$('[data-reveal-stagger]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => io.observe(t));
}

/* ──────────────────────────────────────────────────────────
   CHAPTER PROGRESS DOTS
────────────────────────────────────────────────────────── */
function initProgressDots() {
  const sections = $$('[data-chapter]');
  const dots     = $$('.progress-dot');
  const dotMap   = {};
  dots.forEach(d => { dotMap[d.dataset.chapter] = d; });

  // click to scroll
  dots.forEach(d => {
    d.addEventListener('click', () => {
      const target = $(`[data-chapter="${d.dataset.chapter}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const key = entry.target.dataset.chapter;
        dots.forEach(d => d.classList.remove('active'));
        if (dotMap[key]) dotMap[key].classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
}

/* ──────────────────────────────────────────────────────────
   TILT CARDS  (3-D perspective tilt on hover)
────────────────────────────────────────────────────────── */
function initTiltCards() {
  $$('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r    = card.getBoundingClientRect();
      const cx   = r.left + r.width / 2;
      const cy   = r.top  + r.height / 2;
      const dx   = (e.clientX - cx) / (r.width  / 2);
      const dy   = (e.clientY - cy) / (r.height / 2);
      const tiltX = dy * -12;
      const tiltY = dx *  12;
      card.style.transform =
        `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.04)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}

/* ──────────────────────────────────────────────────────────
   STATS COUNTERS  (count up when in view)
────────────────────────────────────────────────────────── */
function initStatsCounters() {
  const nums = $$('[data-count]');
  const io   = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur    = 1800;
      const steps  = 50;
      const inc    = target / steps;
      let current  = 0;
      const timer  = setInterval(() => {
        current += inc;
        if (current >= target) {
          el.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current).toLocaleString();
        }
      }, dur / steps);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
}

/* ──────────────────────────────────────────────────────────
   LIGHTBOX
────────────────────────────────────────────────────────── */
function initLightbox() {
  const box     = $('#lightbox');
  const lbImg   = $('#lightbox-img');
  const lbCap   = $('#lightbox-caption');
  const closeBtn= $('#lightbox-close');
  const prevBtn = $('#lightbox-prev');
  const nextBtn = $('#lightbox-next');

  if (!box) return;

  // Collect all lightbox-able images
  const figures = $$('[data-lightbox]');
  let current   = 0;

  function open(idx) {
    current = ((idx % figures.length) + figures.length) % figures.length;
    const fig = figures[current];
    const img = fig.querySelector('img');
    const cap = fig.querySelector('.cap');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : '';
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 350);
  }

  figures.forEach((fig, i) => {
    fig.style.cursor = 'pointer';
    fig.addEventListener('click', () => open(i));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => open(current - 1));
  nextBtn.addEventListener('click', () => open(current + 1));
  box.addEventListener('click', e => { if (e.target === box) close(); });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   open(current - 1);
    if (e.key === 'ArrowRight')  open(current + 1);
  });

  // Touch swipe
  let touchStartX = 0;
  box.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? open(current + 1) : open(current - 1);
  });
}

/* ──────────────────────────────────────────────────────────
   MUSIC PLAYER
────────────────────────────────────────────────────────── */
function initMusic() {
  const btn   = $('#musicBtn');
  const audio = $('#bgMusic');
  if (!btn || !audio) return;

  let ready = true;

  audio.addEventListener('error', () => {
    ready = false;
    btn.style.opacity = '.3';
    btn.title = 'No audio file found — add /audio/song.mp3';
  }, true);

  function fadeIn() {
    audio.volume = 0;
    audio.play().then(() => {
      btn.classList.add('playing');
      showToast('♪ Music playing');
      let v = 0;
      const t = setInterval(() => {
        v = Math.min(v + 0.04, 0.5);
        audio.volume = v;
        if (v >= 0.5) clearInterval(t);
      }, 100);
    }).catch(() => {
      ready = false;
      btn.style.opacity = '.3';
    });
  }

  function fadeOut() {
    let v = audio.volume;
    const t = setInterval(() => {
      v = Math.max(v - 0.04, 0);
      audio.volume = v;
      if (v <= 0) {
        clearInterval(t);
        audio.pause();
        btn.classList.remove('playing');
        showToast('♪ Music paused');
      }
    }, 90);
  }

  btn.addEventListener('click', () => {
    if (!ready) { showToast('Add /audio/song.mp3 to enable music'); return; }
    audio.paused ? fadeIn() : fadeOut();
  });
}

/* ──────────────────────────────────────────────────────────
   REPLAY BUTTON
────────────────────────────────────────────────────────── */
function initReplay() {
  const btn = $('#replayBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ──────────────────────────────────────────────────────────
   FIREWORKS + CONFETTI TRIGGERS
   — fires when specific sections come into view
────────────────────────────────────────────────────────── */
function initCelebrationTriggers() {
  // Trigger on: wedding date reveal, happy birthday, final section
  const triggers = [
    { selector: '#ch5 .date-reveal',   fn: () => { window._launchFireworks?.(4500); window._burstConfetti?.(4500); } },
    { selector: '.happy-birthday',     fn: () => { window._launchFireworks?.(3500); window._burstConfetti?.(4000); showToast('🎂 Happy Birthday Sneha! ♥'); } },
    { selector: '#finalBday',          fn: () => { window._launchFireworks?.(5000); window._burstConfetti?.(5500); } },
  ];

  triggers.forEach(({ selector, fn }) => {
    const el = $(selector);
    if (!el) return;
    let fired = false;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !fired) {
          fired = true;
          fn();
          io.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

/* ──────────────────────────────────────────────────────────
   PWA INSTALL PROMPT
────────────────────────────────────────────────────────── */
function initPWA() {
  let deferredPrompt = null;
  const btn = $('#installBtn');
  if (!btn) return;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    btn.classList.add('visible');
    showToast('📲 You can install this story as an app!', 4000);
  });

  btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('💖 Story installed on your device!', 4000);
      btn.classList.remove('visible');
    }
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    showToast('💖 Story installed! Open it anytime from your home screen.', 4500);
    btn.classList.remove('visible');
  });
}

/* ──────────────────────────────────────────────────────────
   PARALLAX on hero photos (subtle)
────────────────────────────────────────────────────────── */
function initParallax() {
  const heroes = $$('.hero-photo img');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    heroes.forEach(img => {
      const rect = img.closest('.hero-photo').getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const pct = 1 - (rect.top + rect.height / 2) / window.innerHeight;
      img.style.transform = `scale(1.06) translateY(${pct * 12}px)`;
    });
  }, { passive: true });
}

/* ──────────────────────────────────────────────────────────
   SERVICE WORKER REGISTRATION (PWA)
────────────────────────────────────────────────────────── */
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // SW unavailable — graceful degradation
      });
    });
  }
}

/* ──────────────────────────────────────────────────────────
   BIRTHDAY SURPRISE MODAL
────────────────────────────────────────────────────────── */
function initBirthdayModal() {
  const modal    = $('#bday-modal');
  const closeBtn = $('#bday-close');
  if (!modal) return;

  // Fire confetti + fireworks immediately on modal
  setTimeout(() => {
    window._burstConfetti?.(6000);
    window._launchFireworks?.(5000);
  }, 600);

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hide');
    // After hide transition, remove from layout
    setTimeout(() => {
      modal.style.display = 'none';
      // Trigger another small burst as the cover screen appears
      window._burstConfetti?.(3000);
    }, 850);
  });

  // Also close on backdrop click
  modal.addEventListener('click', e => {
    if (e.target === modal) closeBtn.click();
  });
}

/* ──────────────────────────────────────────────────────────
   BOOT
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  initCursor();
  initScrollBar();
  initParticles();
  initFloatingHearts();
  initFireworks();
  initConfetti();
  initBirthdayModal();   // ← surprise modal first
  initCover();
  initProgressDots();
  initMusic();
  initReplay();
  initPWA();
  initParallax();
  registerSW();

  // Celebration triggers activate after story is revealed
  // (called again inside beginBtn click — but also here for direct-link loads)
  const story = $('#story');
  if (story && !story.hidden) {
    initReveals();
    initScrollRevealStagger();
    initTiltCards();
    initStatsCounters();
    initLightbox();
    initCelebrationTriggers();
  }

  // Expose celebration trigger init so beginBtn can call it
  window._initCelebrationTriggers = initCelebrationTriggers;
});

/* Patch beginBtn to also init celebration triggers after reveal */
document.addEventListener('DOMContentLoaded', () => {
  const btn = $('#beginBtn');
  if (!btn) return;
  const _orig = btn.onclick;
  btn.addEventListener('click', () => {
    setTimeout(() => {
      window._initCelebrationTriggers?.();
    }, 1300);
  });
});
