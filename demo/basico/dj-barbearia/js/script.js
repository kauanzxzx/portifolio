/* =========================================================
   DJ BARBEARIA — SCRIPT.JS
   Menu mobile, navbar ao scroll, scroll suave, reveal on scroll,
   lightbox da galeria, slider de depoimentos, links do WhatsApp.
========================================================= */
(function () {
  'use strict';

  /* ---------- Config ---------- */
  var WHATSAPP_NUMBER = '5547997495789'; // +55 47 99749-5789
  var DEFAULT_MESSAGE = 'Olá! Gostaria de agendar um horário na DJ Barbearia.';

  function buildWhatsAppUrl(message) {
    var text = encodeURIComponent(message || DEFAULT_MESSAGE);
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text;
  }

  /* ---------- WhatsApp links (genéricos + contextualizados por serviço) ---------- */
  function initWhatsAppLinks() {
    var genericLinks = document.querySelectorAll('[data-wa-generic]');
    genericLinks.forEach(function (el) {
      el.setAttribute('href', buildWhatsAppUrl());
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });

    var serviceLinks = document.querySelectorAll('[data-wa-service]');
    serviceLinks.forEach(function (el) {
      var serviceName = el.getAttribute('data-wa-service');
      var msg = 'Olá! Gostaria de agendar um horário para o serviço de ' + serviceName + ' na DJ Barbearia.';
      el.setAttribute('href', buildWhatsAppUrl(msg));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* ---------- Navbar on scroll ---------- */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var threshold = 40;

    function update() {
      if (window.scrollY > threshold) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var drawer = document.querySelector('.mobile-drawer');
    var backdrop = document.querySelector('.drawer-backdrop');
    if (!toggle || !drawer || !backdrop) return;

    function openMenu() {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      var isOpen = drawer.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Lightbox da galeria ---------- */
  function initLightbox() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-trigger]'));
    var lightbox = document.querySelector('.lightbox');
    if (!triggers.length || !lightbox) return;

    var imgEl = lightbox.querySelector('img');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    var currentIndex = 0;
    var lastFocused = null;

    function openAt(index) {
      currentIndex = (index + triggers.length) % triggers.length;
      var fullSrc = triggers[currentIndex].getAttribute('data-full') || triggers[currentIndex].querySelector('img').src;
      var alt = triggers[currentIndex].querySelector('img').alt || '';
      imgEl.src = fullSrc;
      imgEl.alt = alt;
      lastFocused = document.activeElement;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }
    function next() { openAt(currentIndex + 1); }
    function prev() { openAt(currentIndex - 1); }

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener('click', function () { openAt(index); });
    });
    closeBtn.addEventListener('click', close);
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

  /* ---------- Slider de depoimentos ---------- */
  function initTestimonialSlider() {
    var track = document.querySelector('.testi-track');
    var wrap = document.querySelector('.testi-track-wrap');
    if (!track || !wrap) return;

    var slides = Array.prototype.slice.call(track.children);
    var prevBtn = document.querySelector('.testi-arrow.prev');
    var nextBtn = document.querySelector('.testi-arrow.next');
    var dotsWrap = document.querySelector('.testi-dots');
    var current = 0;

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'testi-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); });
        dotsWrap.appendChild(dot);
      });
    }
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      // a translação é relativa à largura total do track (slides.length * 100%),
      // então o deslocamento por slide é 100 / slides.length
      var offset = current * (100 / slides.length);
      track.style.transform = 'translateX(-' + offset + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    track.style.transition = 'transform .6s cubic-bezier(.22,.61,.36,1)';
    track.style.display = 'flex';
    track.style.width = (slides.length * 100) + '%';
    slides.forEach(function (slide) {
      slide.style.flex = '0 0 ' + (100 / slides.length) + '%';
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initWhatsAppLinks();
    initHeaderScroll();
    initMobileMenu();
    initReveal();
    initLightbox();
    initTestimonialSlider();

    var yearEl = document.querySelector('[data-current-year]');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });
})();