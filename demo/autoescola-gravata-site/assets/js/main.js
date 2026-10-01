/* Autoescola Gravatá — interações, animações, avaliações e mapa */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const framed = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const fmt = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

  $$('.js-wa').forEach(a => a.href = CONFIG.WHATSAPP);
  const dev = $('#devLink'); dev.href = CONFIG.ALAZO_URL;
  $('#yr').textContent = new Date().getFullYear();

  /* Header + menu */
  const hdr = $('#hdr');
  const onHdr = () => hdr.classList.toggle('scrolled', scrollY > 30);
  onHdr();
  const burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#mnav a').forEach(a => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); }));

  /* Estrelas */
  const starSVG = fill => `<svg viewBox="0 0 24 24"><defs><linearGradient id="sg${Math.round(fill*100)}"><stop offset="${fill}" stop-color="#f6c343"/><stop offset="${fill}" stop-color="rgba(255,255,255,.18)"/></linearGradient></defs><path fill="url(#sg${Math.round(fill*100)})" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`;
  const stars = r => Array.from({ length: 5 }, (_, i) => starSVG(Math.max(0, Math.min(1, r - i)))).join('');
  const paintStars = r => { $$('.stat .stars, #scoreStars').forEach(el => el.innerHTML = stars(r)); };
  paintStars(CONFIG.FALLBACK_RATING);

  /* Skyline da orla (determinístico) */
  (() => {
    const svg = $('#skyline'); let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let x = 0, out = '';
    while (x < 1600) {
      const w = 26 + rnd() * 54, tall = rnd() > .62;
      const h = tall ? 90 + rnd() * 105 : 30 + rnd() * 60;
      const shade = tall ? '#0d1420' : '#141c2a';
      out += `<rect x="${x.toFixed(1)}" y="${(200 - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${shade}"/>`;
      if (tall) {
        for (let wy = 200 - h + 10; wy < 192; wy += 12) for (let wx = x + 5; wx < x + w - 6; wx += 10)
          if (rnd() > .82) out += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="4" height="5" fill="#ffcf8a" opacity="${(.35 + rnd() * .5).toFixed(2)}"/>`;
        out += `<rect x="${x.toFixed(1)}" y="${(200 - h).toFixed(1)}" width="2" height="${h.toFixed(1)}" fill="#ffb46a" opacity=".25"/>`;
      }
      x += w + rnd() * 6;
    }
    svg.innerHTML = out;
  })();

  /* Alinha o chão da cena com as rodas do carro */
  const hero = $('.hero'), car = $('#car');
  const layoutScene = () => {
    const hr = hero.getBoundingClientRect(), cr = car.getBoundingClientRect();
    const ground = (cr.top - hr.top) + cr.height * (474 / 520);
    const road = Math.min(92, Math.max(50, ground / hr.height * 100));
    hero.style.setProperty('--road', road + '%');
    hero.style.setProperty('--horizon', Math.max(34, road - 19) + '%');
  };
  layoutScene(); addEventListener('resize', layoutScene);
  document.fonts && document.fonts.ready.then(layoutScene);
  setTimeout(layoutScene, 2100);

  /* Parallax + rodas + faixa da avenida */
  const spins = $$('.suv .spin'), carBody = $('#carBody'), giant = $('#giant'), sky = $('#sky'), title = $('#title'), avenue = $('#avenue');
  let ticking = false;
  const onScroll = () => {
    onHdr();
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY, h = hero.offsetHeight;
      if (!reduce && y < h * 1.2) {
        car.style.transform = `translate3d(${-y * .22}px, ${y * .05}px, 0) scale(${1 + y / h * .1})`;
        giant.style.transform = `translate(calc(-50% - ${y * .18}px), -100%)`;
        sky.style.translate = `0 ${y * .25}px`;
        title.style.transform = `translateY(${y * .22}px) scale(${1 - y / h * .08})`;
        title.style.opacity = Math.max(0, 1 - y / (h * .8));
        carBody.style.setProperty('--ry', (-7 - Math.min(1, y / h) * 9) + 'deg');
      }
      const ang = (y * 0.9) % 360;
      spins.forEach(s => s.setAttribute('transform', `rotate(${ang})`));
            avenue.style.setProperty('--lane', (y * .6 % 52) + 'px');
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  car.addEventListener('animationend', e => { if (e.target === car) car.style.animation = 'none'; });

  /* Lampejo dos faróis ao passar o mouse nos botões principais */
  $$('.hero .btn-red, .hdr .btn-red').forEach(b => b.addEventListener('mouseenter', () => {
    carBody.classList.remove('flash'); void carBody.offsetWidth; carBody.classList.add('flash');
  }));
  carBody.addEventListener('animationend', e => { if (e.animationName === 'flash') carBody.classList.remove('flash'); });
  title.addEventListener('animationend', e => { if (e.target === title) title.style.animation = 'none'; });

  /* Reflexo de luz passando pela lataria */
  const sheen = $('.suv .sheen');
  if (sheen && !reduce) {
    const t0 = performance.now();
    const loop = t => { const p = ((t - t0) / 6000) % 1; sheen.setAttribute('x', (-500 + p * 2200).toFixed(1)); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  /* Partículas discretas */
  (() => {
    const c = $('#fx'), ctx = c.getContext('2d'); if (!ctx || reduce) return;
    let W, H, P = [];
    const size = () => { W = c.width = hero.offsetWidth * devicePixelRatio; H = c.height = hero.offsetHeight * devicePixelRatio; };
    size(); addEventListener('resize', size);
    const cols = ['227,35,27', '63,210,124', '255,220,170'];
    for (let i = 0; i < 46; i++) P.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, s: .0002 + Math.random() * .0006, c: cols[i % 3], a: .2 + Math.random() * .5 });
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.x -= p.s; if (p.x < -.02) { p.x = 1.02; p.y = Math.random(); }
        ctx.beginPath(); ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.arc(p.x * W, p.y * H, p.r * devicePixelRatio, 0, 7); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
  })();

  /* Revelar ao rolar (apenas abaixo da dobra) */
  const targets = $$('.sec-head, .pillar, .svc, .auto-band, .cat, .combo, .stat, .score, #rvArea, .info, .map, .final h2, .final p, .final .ctas');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  if (!reduce) targets.forEach((el, i) => {
    if (el.getBoundingClientRect().top > innerHeight) {
      el.classList.add('pre', 'rv-in');
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    }
  });

  /* Contadores */
  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; countIO.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), d = +(el.dataset.dec || 0), t0 = performance.now();
    $$('.bar i', el.closest('.stat')).forEach(b => { b.style.transform = 'scaleX(0)'; requestAnimationFrame(() => requestAnimationFrame(() => b.style.transform = 'scaleX(1)')); });
    const step = t => { const p = Math.min(1, (t - t0) / 1800), v = end * (1 - Math.pow(1 - p, 4)); el.textContent = fmt(v, d); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  if (!reduce) $$('[data-count]').forEach(el => { if (el.getBoundingClientRect().top > innerHeight) countIO.observe(el); });

  /* Copiar telefone */
  $$('.copy').forEach(b => b.addEventListener('click', () => {
    const txt = b.dataset.copy;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { b.textContent = 'copiado'; setTimeout(() => b.textContent = 'copiar', 1600); })
      .catch(() => { const r = document.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  }));

  /* Mapa: iframe do Google Maps no site publicado; mapa ilustrado quando embutido */
  if (!framed) {
    const f = document.createElement('iframe');
    f.src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG.ADDRESS)}&z=16&output=embed`;
    f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.title = 'Mapa: Autoescola Gravatá';
    f.addEventListener('load', () => { $('#staticMap').style.display = 'none'; });
    $('#map').prepend(f);
  }

  /* ============ Avaliações do Google (Places API New) ============ */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const setSummary = (rating, count, url) => {
    $('#scoreBig').textContent = fmt(rating, 1);
    $('#statRating').textContent = fmt(rating, 1); $('#statRating').dataset.count = rating;
    $('#scoreCnt').textContent = `Com base em ${fmt(count)} avaliações`;
    $('#statCount').textContent = fmt(count); $('#statCount').dataset.count = count;
    paintStars(rating);
    if (url) { $('#readAll').href = url; $('#writeRv').href = url; }
  };
  const loadMaps = key => new Promise((res, rej) => {
    if (window.google?.maps?.importLibrary) return res();
    window.__gravataMaps = res;
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&language=pt-BR&region=BR&callback=__gravataMaps`;
    s.async = true; s.onerror = rej; document.head.appendChild(s);
    setTimeout(() => rej(new Error('timeout')), 9000);
  });
  const renderReviews = list => {
    const track = $('#rvTrack');
    track.innerHTML = list.map(r => {
      const a = r.authorAttribution || {};
      const name = esc(a.displayName || 'Aluno(a)');
      const photo = a.photoURI ? `<img src="${esc(a.photoURI)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<span class="av">${name.charAt(0)}</span>`;
      const text = esc(typeof r.text === 'string' ? r.text : (r.text?.text || ''));
      return `<article class="rv">
        <div class="rv-h">${photo}<div><b>${name}</b><small>${esc(r.relativePublishTimeDescription || '')}</small></div></div>
        <div class="stars">${stars(r.rating || 5)}</div>
        <p>${text || '<em style="color:var(--muted)">Avaliação sem comentário.</em>'}</p>
        ${a.uri ? `<a class="more" href="${esc(a.uri)}" target="_blank" rel="noopener">Ver no Google →</a>` : ''}
      </article>`;
    }).join('');
    $('#rvEmpty').hidden = true; track.hidden = false; $('#rvAttr').hidden = false; $('#rvNav').hidden = false;
    const by = dir => track.scrollBy({ left: dir * (track.querySelector('.rv').offsetWidth + 16), behavior: 'smooth' });
    $('#rvPrev').onclick = () => by(-1); $('#rvNext').onclick = () => by(1);
  };
  (async () => {
    if (!CONFIG.GOOGLE_API_KEY || framed) return;
    try {
      await loadMaps(CONFIG.GOOGLE_API_KEY);
      const { Place } = await google.maps.importLibrary('places');
      let id = CONFIG.PLACE_ID;
      if (!id) {
        const { places } = await Place.searchByText({ textQuery: CONFIG.PLACE_QUERY, fields: ['id'], maxResultCount: 1, language: 'pt-BR' });
        id = places?.[0]?.id;
      }
      if (!id) return;
      const place = new Place({ id, requestedLanguage: 'pt-BR' });
      await place.fetchFields({ fields: ['rating', 'userRatingCount', 'reviews', 'googleMapsURI'] });
      if (place.rating) setSummary(place.rating, place.userRatingCount || CONFIG.FALLBACK_COUNT, place.googleMapsURI);
      const list = place.reviews || [];
      if (list.length) renderReviews(list);
    } catch (err) { console.warn('Avaliações do Google indisponíveis:', err); }
  })();
})();