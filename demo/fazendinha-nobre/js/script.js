/* =========================================
   FAZENDINHA NOBRE — script.js
   Os links de WhatsApp já estão prontos no HTML;
   este arquivo cuida só das interações.
========================================= */

(function () {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;

    /* ---------- Placeholders de imagem ---------- */
    function initPlaceholders() {
        const toPlaceholder = (img) => {
            if (img.dataset.fallback === 'logo') { img.remove(); return; }
            const ph = document.createElement('div');
            ph.className = 'ph';
            ph.setAttribute('role', 'img');
            ph.setAttribute('aria-label', img.alt || 'Imagem');
            ph.innerHTML = '<i class="bi bi-image"></i>' + (img.dataset.label ? '<span>assets/' + img.dataset.label + '</span>' : '');
            img.replaceWith(ph);
        };
        $$('img').forEach((img) => {
            if (img.classList.contains('lightbox__img')) return;
            if (img.complete && img.naturalWidth === 0) toPlaceholder(img);
            else img.addEventListener('error', () => toPlaceholder(img), { once: true });
        });
    }

    /* ---------- Scroll: header, barra de progresso, parallax, WhatsApp flutuante ---------- */
    function initScroll() {
        const header = $('#header');
        const bar = $('#progressBar');
        const heroMedia = $('#heroMedia');
        const hero = $('.hero');
        const waFloat = $('.wa-float');
        const cta = $('.cta');
        let ticking = false;

        const update = () => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (header) header.classList.toggle('is-scrolled', y > 30);
            if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

            if (heroMedia && hero && !reduceMotion && window.innerWidth > 1000 && y < hero.offsetHeight) {
                heroMedia.style.transform = 'translate3d(0,' + (y * 0.25) + 'px,0)';
            }

            if (waFloat && hero) {
                const pastHero = y > hero.offsetHeight * 0.6;
                const ctaTop = cta ? cta.getBoundingClientRect().top : Infinity;
                const atCta = ctaTop < window.innerHeight * 0.85;
                waFloat.classList.toggle('is-visible', pastHero && !atCta);
            }
            ticking = false;
        };

        update();
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        window.addEventListener('resize', update);
    }

    /* ---------- Menu mobile ---------- */
    function initMenu() {
        const toggle = $('#menuToggle');
        const nav = $('#nav');
        const overlay = $('#navOverlay');
        if (!toggle || !nav) return;

        const setMenu = (open) => {
            nav.classList.toggle('is-open', open);
            toggle.classList.toggle('is-open', open);
            if (overlay) overlay.classList.toggle('is-open', open);
            document.body.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        };

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenu(!nav.classList.contains('is-open'));
        });
        if (overlay) overlay.addEventListener('click', () => setMenu(false));
        $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
        window.addEventListener('resize', () => { if (window.innerWidth > 1000) setMenu(false); });
    }

    /* ---------- Link ativo no menu ---------- */
    function initScrollSpy() {
        if (!('IntersectionObserver' in window)) return;
        const links = $$('.nav__link');
        const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach((s) => spy.observe(s));
    }

    /* ---------- Fade-in no scroll ---------- */
    function initReveal() {
        const reveals = $$('.reveal');
        if (!('IntersectionObserver' in window) || reduceMotion) {
            reveals.forEach((el) => el.classList.add('is-visible'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach((el) => {
            const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
            el.style.transitionDelay = Math.min(siblings.indexOf(el), 4) * 100 + 'ms';
            io.observe(el);
        });
        setTimeout(() => reveals.forEach((el) => {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
        }), 3000);
    }

    /* ---------- Spotlight que segue o mouse ---------- */
    function initSpotlight() {
        if (!canHover) return;
        $$('.spot').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                el.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    }

    /* ---------- Lightbox da galeria ---------- */
    function initLightbox() {
        const lightbox = $('#lightbox');
        if (!lightbox) return;
        const lbImg = $('.lightbox__img', lightbox);
        const counter = $('#lightboxCount');
        const items = $$('.galeria__item');
        let index = 0;
        let lastFocus = null;

        const photos = () => items.map((it) => $('img', it)).filter(Boolean);

        const show = (i) => {
            const list = photos();
            if (!list.length) return;
            index = (i + list.length) % list.length;
            lbImg.src = list[index].src;
            lbImg.alt = list[index].alt;
            if (counter) counter.textContent = (index + 1) + ' / ' + list.length;
        };
        const open = (img) => {
            const i = photos().indexOf(img);
            if (i < 0) return;
            lastFocus = document.activeElement;
            show(i);
            lightbox.hidden = false;
            requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add('is-open')));
            document.body.style.overflow = 'hidden';
            $('.lightbox__close', lightbox).focus();
        };
        const close = () => {
            lightbox.classList.remove('is-open');
            document.body.style.overflow = '';
            setTimeout(() => { lightbox.hidden = true; lbImg.removeAttribute('src'); }, 350);
            if (lastFocus) lastFocus.focus({ preventScroll: true });
        };

        items.forEach((item) => item.addEventListener('click', () => open($('img', item))));
        $('.lightbox__close', lightbox).addEventListener('click', close);
        $('.lightbox__arrow--prev', lightbox).addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
        $('.lightbox__arrow--next', lightbox).addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
        document.addEventListener('keydown', (e) => {
            if (lightbox.hidden) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') show(index - 1);
            if (e.key === 'ArrowRight') show(index + 1);
        });

        let x0 = null;
        lightbox.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
            if (x0 === null) return;
            const dx = e.changedTouches[0].clientX - x0;
            if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
            x0 = null;
        });
    }

    /* ---------- Carrossel de depoimentos ---------- */
    function initCarousel() {
        const carousel = $('#carousel');
        if (!carousel) return;
        const slides = $$('.depo', carousel);
        const dotsWrap = $('.carousel__dots', carousel);
        if (slides.length < 2) return;
        let current = 0;
        let timer = null;

        const dots = slides.map((_, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-label', 'Depoimento ' + (i + 1));
            b.addEventListener('click', () => { go(i); restart(); });
            dotsWrap.appendChild(b);
            return b;
        });

        function go(i) {
            current = (i + slides.length) % slides.length;
            slides.forEach((s, idx) => s.classList.toggle('is-active', idx === current));
            dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current));
        }
        function stop() { clearInterval(timer); timer = null; }
        function restart() {
            stop();
            if (!reduceMotion) timer = setInterval(() => go(current + 1), 7000);
        }

        $$('.carousel__btn', carousel).forEach((btn) => {
            btn.addEventListener('click', () => { go(current + Number(btn.dataset.dir)); restart(); });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', restart);

        let x0 = null;
        carousel.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
        carousel.addEventListener('touchend', (e) => {
            if (x0 === null) return;
            const dx = e.changedTouches[0].clientX - x0;
            if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
            x0 = null;
        });

        go(0);
        restart();
    }

    /* ---------- Ano no rodapé ---------- */
    function initYear() {
        const ano = $('#ano');
        if (ano) ano.textContent = new Date().getFullYear();
    }

    /* Cada parte roda isolada: se uma falhar, as outras continuam */
    function init() {
        [initPlaceholders, initScroll, initMenu, initScrollSpy, initReveal, initSpotlight, initLightbox, initCarousel, initYear]
            .forEach((fn) => { try { fn(); } catch (err) { console.error('[Fazendinha Nobre]', fn.name, err); } });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();