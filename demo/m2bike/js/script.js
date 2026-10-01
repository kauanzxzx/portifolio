/* =========================================================
   M2 BIKE SHOP — interações
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- ano no rodapé ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- header ao rolar ---------- */
  const header = $('#header');
  const onScrollHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- menu mobile ---------- */
  const menuBtn = $('#menuBtn');
  const nav = $('#nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- reveal (só o que está abaixo da dobra) ---------- */
  const reveals = $$('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.remove('is-pending'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el, i) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('is-pending');
        el.style.transitionDelay = `${(i % 4) * 70}ms`;
        io.observe(el);
      }
    });
  }

  /* =========================================================
     HERO
     ========================================================= */
  const hero = $('.hero');
  const bikeSvg = $('.bike');
  if (!hero) return;

  if (reduceMotion) {
    if (bikeSvg && bikeSvg.pauseAnimations) bikeSvg.pauseAnimations();
    return;
  }

  let heroVisible = true;
  new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(hero);

  /* ---------- parallax (mouse + scroll) ---------- */
  const layers = $$('[data-depth]', hero).map((el) => ({ el, d: parseFloat(el.dataset.depth) }));
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width - 0.5;
    target.y = (e.clientY - r.top) / r.height - 0.5;
  });
  hero.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });

  const applyParallax = () => {
    cur.x += (target.x - cur.x) * 0.06;
    cur.y += (target.y - cur.y) * 0.06;
    const sy = Math.min(window.scrollY, window.innerHeight);
    for (const { el, d } of layers) {
      const tx = cur.x * d * -34;
      const ty = cur.y * d * -22 - sy * d * 0.22;
      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
    }
  };

  /* ---------- canvas util ---------- */
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const fitCanvas = (c) => {
    const w = c.clientWidth, h = c.clientHeight;
    c.width = Math.round(w * DPR); c.height = Math.round(h * DPR);
    const ctx = c.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { ctx, w, h };
  };
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- fundo: partículas + linhas de velocidade ---------- */
  const fxCanvas = $('#fx');
  let fx = fitCanvas(fxCanvas);
  const small = () => fx.w < 760;
  const dust = [];
  const streaks = [];
  const seedFx = () => {
    dust.length = 0; streaks.length = 0;
    const nDust = small() ? 45 : 110;
    for (let i = 0; i < nDust; i++) {
      dust.push({ x: rand(0, fx.w), y: rand(0, fx.h), r: rand(0.4, 1.8), vx: rand(-0.5, -0.1), vy: rand(-0.15, 0.05), a: rand(0.15, 0.7), o: Math.random() < 0.12 });
    }
    const nStreak = small() ? 8 : 18;
    for (let i = 0; i < nStreak; i++) streaks.push(newStreak(true));
  };
  function newStreak(anywhere) {
    return {
      x: anywhere ? rand(0, fx.w) : fx.w + rand(0, 300),
      y: rand(fx.h * 0.15, fx.h * 0.85),
      len: rand(80, 320), v: rand(6, 16), a: rand(0.08, 0.35), o: Math.random() < 0.18,
    };
  }
  seedFx();

  const drawFx = () => {
    const { ctx, w, h } = fx;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const s of streaks) {
      s.x -= s.v;
      if (s.x + s.len < 0) Object.assign(s, newStreak(false));
      const g = ctx.createLinearGradient(s.x, 0, s.x + s.len, 0);
      const c = s.o ? '255,120,40' : '106,168,255';
      g.addColorStop(0, `rgba(${c},${s.a})`);
      g.addColorStop(1, `rgba(${c},0)`);
      ctx.strokeStyle = g; ctx.lineWidth = s.o ? 1.4 : 1;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.len, s.y); ctx.stroke();
    }
    for (const p of dust) {
      p.x += p.vx - cur.x * 0.3; p.y += p.vy;
      if (p.x < -5) p.x = w + 5; if (p.x > w + 5) p.x = -5;
      if (p.y < -5) p.y = h + 5; if (p.y > h + 5) p.y = -5;
      ctx.fillStyle = p.o ? `rgba(255,140,70,${p.a})` : `rgba(180,210,255,${p.a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  /* ---------- fumaça nas rodas ---------- */
  const smokeCanvas = $('#smoke');
  let sm = fitCanvas(smokeCanvas);
  const makeSprite = (rgb) => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    for (let i = 0; i < 7; i++) {
      const cx = rand(40, 88), cy = rand(40, 88), r = rand(26, 46);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${rgb},0.55)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    }
    return c;
  };
  const sprites = [makeSprite('215,228,255'), makeSprite('150,190,255'), makeSprite('235,240,250')];
  const puffs = [];
  const sparks = [];
  const wheels = ['#wheelRear', '#wheelFront'].map((s) => $(s)).filter(Boolean);
  const startAt = performance.now() + 1100;

  const emit = () => {
    const hr = smokeCanvas.getBoundingClientRect();
    const rate = small() ? 1 : 2;
    wheels.forEach((wEl, wi) => {
      const r = wEl.getBoundingClientRect();
      if (!r.width) return;
      const cx = r.left - hr.left + r.width * 0.5;
      const bottom = r.bottom - hr.top - r.height * 0.03;
      const scale = r.width / 380; // tamanho relativo da roda na tela
      for (let i = 0; i < rate; i++) {
        // nasce na parte de trás/baixo do pneu
        const ang = rand(Math.PI * 0.5, Math.PI * 0.95);
        const rad = r.width * 0.48;
        puffs.push({
          x: cx + Math.cos(ang) * rad * 0.9,
          y: Math.min(bottom, r.top - hr.top + r.height * 0.5 + Math.sin(ang) * r.height * 0.48),
          vx: rand(-3.2, -1.2) * scale, vy: rand(-0.9, -0.15) * scale,
          size: rand(18, 34) * scale, grow: rand(1.2, 2.2) * scale,
          life: 0, max: rand(90, 170), rot: rand(0, 6.28), vr: rand(-0.01, 0.01),
          spr: sprites[(Math.random() * sprites.length) | 0],
          // intensidade da fumaça: 50% no desktop, 100% no mobile
          peak: (wi === 0 ? 0.3 : 0.24) * rand(0.7, 1.1) * (small() ? 1 : 0.5),
        });
      }
      if (Math.random() < (small() ? 0.25 : 0.5)) {
        sparks.push({
          x: cx - rand(0, r.width * 0.3), y: bottom - rand(0, 10),
          vx: rand(-7, -3) * scale, vy: rand(-3, -0.5) * scale,
          life: 0, max: rand(22, 45), r: rand(0.8, 2),
        });
      }
    });
  };

  const drawSmoke = (now) => {
    const { ctx, w, h } = sm;
    ctx.clearRect(0, 0, w, h);
    if (now > startAt) emit();

    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.life++;
      p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy *= 0.99;
      p.size += p.grow; p.rot += p.vr;
      const t = p.life / p.max;
      if (t >= 1) { puffs.splice(i, 1); continue; }
      const a = t < 0.15 ? (t / 0.15) * p.peak : p.peak * (1 - (t - 0.15) / 0.85);
      ctx.globalAlpha = a;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.drawImage(p.spr, -p.size, -p.size, p.size * 2, p.size * 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life++; s.x += s.vx; s.y += s.vy; s.vy += 0.08;
      const t = s.life / s.max;
      if (t >= 1) { sparks.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(255,${130 + (1 - t) * 90 | 0},60,${1 - t})`;
      ctx.lineWidth = s.r;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 2.2, s.y - s.vy * 2.2); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    // limite de segurança
    if (puffs.length > 600) puffs.splice(0, puffs.length - 600);
  };

  /* ---------- loop ---------- */
  const loop = (now) => {
    if (heroVisible && !document.hidden) {
      applyParallax();
      drawFx();
      drawSmoke(now);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { fx = fitCanvas(fxCanvas); sm = fitCanvas(smokeCanvas); seedFx(); }, 150);
  });
})();