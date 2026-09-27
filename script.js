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
   DEVICE / MOTION CAPABILITY CHECKS
   (computed once — every effect below reads these instead of
   re-querying matchMedia on every event)
────────────────────────────────────────────────────────── */
const CAN_HOVER      = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let PAGE_HIDDEN = document.hidden;
document.addEventListener('visibilitychange', () => { PAGE_HIDDEN = document.hidden; });

/* ──────────────────────────────────────────────────────────
   CUSTOM CURSOR + SPARKLE TRAIL
   (skipped entirely on touch/coarse-pointer devices and when
   the user asked for reduced motion — it's pure decoration,
   the #1 source of wasted DOM churn on those devices)
────────────────────────────────────────────────────────── */
function initCursor() {
  if (!CAN_HOVER || REDUCED_MOTION) return;
  const cursor = $('#cursor');
  const ring   = $('#cursor-ring');
  if (!cursor || !ring) return;

  let tx = -100, ty = -100;
  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cursor.style.transform = `translate(calc(${tx}px - 50%), calc(${ty}px - 50%))`;
    spawnSparkle(tx, ty);
  }, { passive: true });

  // Ring follows with slight lag via rAF — one shared loop, paused when
  // the tab isn't visible so it doesn't burn CPU/battery in the background.
  let rx = -100, ry = -100;
  function animRing() {
    if (!PAGE_HIDDEN) {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
    }
    requestAnimationFrame(animRing);
  }
  animRing();

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

/* sparkle trail — throttled harder, and capped so a fast mouse
   sweep can't pile up dozens of live DOM nodes + CSS animations
   at once (this was the main source of stutter on the old page). */
const SPARKLE_COLORS = ['#f0b429','#f06292','#9c27b0','#29b6f6','#66bb6a','#ff8a65'];
const MAX_SPARKLES = 12;
let lastSparkle = 0;
let liveSparkles = 0;
function spawnSparkle(x, y) {
  const now = Date.now();
  if (now - lastSparkle < 70 || liveSparkles >= MAX_SPARKLES) return;
  lastSparkle = now;
  liveSparkles++;

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
  setTimeout(() => { s.remove(); liveSparkles--; }, 750);
}

/* ──────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR
   (docH only changes on resize/content-load, not on every
   scroll tick — so it's cached instead of forcing a layout
   read on every single scroll event)
────────────────────────────────────────────────────────── */
function initScrollBar() {
  const bar = $('#scroll-bar');
  if (!bar) return;

  let docH = 0;
  function measure() {
    docH = document.documentElement.scrollHeight - window.innerHeight;
  }
  measure();
  window.addEventListener('resize', measure, { passive: true });

  let ticking = false;
  function update() {
    const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = pct + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
}

/* ──────────────────────────────────────────────────────────
   PARTICLES
────────────────────────────────────────────────────────── */
function initParticles() {
  const field = $('#particles');
  if (!field || REDUCED_MOTION) return;

  const COLORS  = ['#f0b429','#fcd97d','#f06292','#9c27b0','#29b6f6','#66bb6a'];
  const COUNT   = window.innerWidth < 700 ? 14 : 28;

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
const MAX_HEARTS = 20;
function initFloatingHearts() {
  const layer = $('#hearts-layer');
  if (!layer || REDUCED_MOTION) return;

  function spawnHeart() {
    if (PAGE_HIDDEN || layer.childElementCount >= MAX_HEARTS) return;
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
  if (!coverLines.length) return; // only present on index.html

  coverLines.forEach((line, i) => {
    setTimeout(() => line.classList.add('show'), 400 + i * 1100);
  });

  const tagline = $('#coverTagline');
  if (tagline) {
    setTimeout(() => tagline.classList.add('show'),
      400 + coverLines.length * 1100 + 200);
  }

  // "Begin Our Story" is a real <a href="ch1.html"> now — the browser
  // handles the navigation (and, where supported, the View Transition
  // in style.css handles the crossfade). Just keep the little ripple
  // for tactile feedback; it fires immediately, in parallel with the
  // navigation, so it never delays leaving the page.
  const beginBtn = $('#beginBtn');
  if (beginBtn) {
    beginBtn.addEventListener('click', e => {
      const rect = beginBtn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const d = Math.max(rect.width, rect.height);
      ripple.style.cssText = `width:${d}px; height:${d}px;
        left:${e.clientX - rect.left - d/2}px;
        top:${e.clientY - rect.top - d/2}px;`;
      beginBtn.appendChild(ripple);
    });
  }
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

/* Chapter progress dots are now plain <a href="chN.html"> links,
   each page rendering its own dot as .active at build time (see
   build_pages.py) — no scroll-spying JS needed at all. */

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
    // Thumbnails are deliberately small/compressed for fast scrolling;
    // the lightbox opens the full-resolution version instead.
    lbImg.src = img.dataset.full || img.src;
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
/* Music state persists across page navigations via sessionStorage —
   otherwise moving from chapter to chapter (now real page loads)
   would restart or cut the song every time. */
const MUSIC_KEY = 'sneha:music';
function readMusicState() {
  try { return JSON.parse(sessionStorage.getItem(MUSIC_KEY)) || {}; }
  catch { return {}; }
}
function writeMusicState(state) {
  try { sessionStorage.setItem(MUSIC_KEY, JSON.stringify(state)); } catch {}
}

function initMusic() {
  const btn   = $('#musicBtn');
  const audio = $('#bgMusic');
  if (!btn || !audio) return;

  let ready = true;
  let saveTimer = null;

  audio.addEventListener('error', () => {
    ready = false;
    btn.style.opacity = '.3';
    btn.title = 'No audio file found — add /audio/song.mp3';
  }, true);

  function startSaving() {
    clearInterval(saveTimer);
    saveTimer = setInterval(() => {
      writeMusicState({ playing: true, time: audio.currentTime });
    }, 4000);
  }
  function stopSaving() { clearInterval(saveTimer); }

  function fadeIn(silent) {
    audio.volume = 0;
    audio.play().then(() => {
      btn.classList.add('playing');
      if (!silent) showToast('♪ Music playing');
      startSaving();
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

  function fadeOut(silent) {
    stopSaving();
    writeMusicState({ playing: false, time: audio.currentTime });
    let v = audio.volume;
    const t = setInterval(() => {
      v = Math.max(v - 0.04, 0);
      audio.volume = v;
      if (v <= 0) {
        clearInterval(t);
        audio.pause();
        btn.classList.remove('playing');
        if (!silent) showToast('♪ Music paused');
      }
    }, 90);
  }

  btn.addEventListener('click', () => {
    if (!ready) { showToast('Add /audio/song.mp3 to enable music'); return; }
    audio.paused ? fadeIn() : fadeOut();
  });

  // Resume where the previous page left off, quietly. Browsers may still
  // block this as unsolicited autoplay (most strictly on iOS) — that's
  // fine, it just means the button stays off until the person taps it;
  // it must NOT be treated as "no audio file found".
  const prev = readMusicState();
  if (prev.playing) {
    const resume = () => {
      if (prev.time) { try { audio.currentTime = prev.time; } catch {} }
      audio.volume = 0.5;
      audio.play().then(() => { btn.classList.add('playing'); startSaving(); })
                   .catch(() => { /* blocked by autoplay policy — silent, not an error */ });
    };
    audio.preload = 'metadata';
    if (audio.readyState >= 1) resume();
    else audio.addEventListener('loadedmetadata', resume, { once: true });
  }

  window.addEventListener('pagehide', () => {
    if (!audio.paused) writeMusicState({ playing: true, time: audio.currentTime });
  });
}

/* "Replay Our Story" is a plain <a href="index.html"> now — no JS needed. */

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
  if (!heroes.length || REDUCED_MOTION) return;

  let ticking = false;
  function apply() {
    heroes.forEach(img => {
      const rect = img.closest('.hero-photo').getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const pct = 1 - (rect.top + rect.height / 2) / window.innerHeight;
      img.style.transform = `scale(1.06) translateY(${pct * 12}px)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(apply); }
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
   Every page (index.html and every chapter page) loads this
   same script and runs the same boot sequence. Each init()
   function only touches elements that exist on ITS page and
   no-ops immediately when they're absent (e.g. initStatsCounters
   is a no-op everywhere except our-numbers.html), so nothing
   below needs to know which page it's on.
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollBar();
  initParticles();
  initFloatingHearts();
  initFireworks();
  initConfetti();
  initBirthdayModal();
  initCover();
  initMusic();
  initPWA();
  initParallax();
  initReveals();
  initScrollRevealStagger();
  initTiltCards();
  initStatsCounters();
  initLightbox();
  initCelebrationTriggers();
  registerSW();
});
