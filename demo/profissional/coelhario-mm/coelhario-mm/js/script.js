/* ==========================================================
   COELHÁRIO MM — script.js
   JavaScript puro, sem dependências.
   ========================================================== */

window.__coelhario = true; // avisa o HTML que o script carregou

/* =========================
   CONFIGURAÇÃO (edite aqui)
========================= */

// PLACEHOLDER: troque pelo número real do WhatsApp, só dígitos, no formato
// internacional: 55 + DDD + número (ex.: "5517999999999").
// Enquanto for o número de exemplo, os botões NÃO abrem o WhatsApp:
// mostram um aviso de teste com a mensagem que seria enviada.
const whatsappNumber = "5511999999999";

// Instagram do criatório
const instagramUrl = "https://www.instagram.com/coelhariomm/";

// Mensagens automáticas do WhatsApp
const whatsappGenericMessage =
  "Olá! Vi o site do Coelhário MM e gostaria de saber mais sobre os coelhinhos disponíveis.";
const whatsappRabbitMessage = (nome) =>
  `Olá! Vi o site do Coelhário MM e gostaria de saber mais sobre o coelhinho ${nome}.`;

// Número de exemplo usado acima (não altere: serve para detectar que ainda não foi trocado)
const WHATSAPP_PLACEHOLDER = "5511999999999";

/* =========================
   UTILIDADES
========================= */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollBehavior = () => (prefersReducedMotion() ? "auto" : "smooth");

let toastTimer;
function showToast(message, duration = 6000) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), duration);
}

/* =========================
   HEADER: fundo sólido ao rolar
========================= */
function initHeader() {
  const header = $(".site-header");
  if (!header) return;

  let ticking = false;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}

/* =========================
   MENU MOBILE
========================= */
function initMenu() {
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  const nav = $("#menu");
  if (!header || !toggle || !nav) return () => {};

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("menu-open", open);
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Ao voltar para o layout de desktop, garante o menu fechado
  window.matchMedia("(min-width: 960px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });

  return () => setOpen(false);
}

/* =========================
   NAVEGAÇÃO SUAVE ENTRE SEÇÕES
========================= */
function initAnchors(closeMenu) {
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute("data-wa")) return;

    const hash = link.getAttribute("href");
    if (!hash || hash.length < 2) return;

    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    history.pushState(null, "", hash);

    // Leva o foco do teclado para a seção de destino
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

/* =========================
   LINK ATIVO NO MENU
========================= */
function initActiveNav() {
  const links = $$(".nav__link");
  if (!links.length || !("IntersectionObserver" in window)) return;

  const byId = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
  const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.remove("is-active");
          link.removeAttribute("aria-current");
        });
        const active = byId.get(entry.target.id);
        if (active) {
          active.classList.add("is-active");
          active.setAttribute("aria-current", "true");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/* =========================
   ANIMAÇÕES DE ENTRADA (IntersectionObserver)
========================= */
function initReveal() {
  const items = $$(".reveal");

  // Pequeno atraso escalonado para itens de uma mesma grade
  $$("[data-stagger]").forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      child.style.setProperty("--d", `${(index % 4) * 80}ms`);
    });
  });

  if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

/* =========================
   IMAGENS AUSENTES: mostra o espaço de foto (placeholder)
========================= */
function initImageFallbacks() {
  const handleMissing = (img) => {
    const brand = img.closest(".brand");
    if (brand) {
      brand.classList.add("is-fallback"); // logo ausente: mostra o nome em texto
    } else {
      const host = img.closest(".media");
      if (host) host.classList.add("is-missing");
    }
    img.hidden = true;
  };

  $$("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) {
      handleMissing(img);
    } else {
      img.addEventListener("error", () => handleMissing(img), { once: true });
    }
  });
}

/* =========================
   WHATSAPP
========================= */
function buildWhatsAppUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function getRabbitName(link) {
  const card = link.closest("[data-rabbit]");
  const name = card && card.querySelector(".rabbit__name");
  return name ? name.textContent.trim() : "disponível";
}

function initWhatsApp() {
  $$("[data-wa]").forEach((link) => {
    const message =
      link.dataset.wa === "rabbit" ? whatsappRabbitMessage(getRabbitName(link)) : whatsappGenericMessage;
    link.href = buildWhatsAppUrl(message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.message = message;
  });

  // Enquanto o número for o de exemplo, não abre conversa com um número que não é do criatório
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-wa]");
    if (!link || whatsappNumber !== WHATSAPP_PLACEHOLDER) return;
    event.preventDefault();
    showToast(
      `Modo de teste: defina o número em js/script.js (whatsappNumber). Mensagem que seria enviada: “${link.dataset.message}”`,
      9000
    );
  });
}

/* =========================
   INSTAGRAM
========================= */
function initInstagram() {
  $$("[data-instagram]").forEach((link) => {
    link.href = instagramUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

/* =========================
   FILTRO DOS COELHINHOS
========================= */
function initFilters() {
  const chips = $$(".chip[data-filter]");
  const cards = $$(".rabbit");
  const status = $("#filter-status");
  const empty = $("#rabbits-empty");
  if (!chips.length || !cards.length) return;

  const apply = (filter) => {
    let visible = 0;
    cards.forEach((card) => {
      const show = filter === "todos" || card.dataset.breed === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.filter === filter)));
    if (status) status.textContent = visible === 1 ? "Mostrando 1 coelhinho" : `Mostrando ${visible} coelhinhos`;
    if (empty) empty.hidden = visible !== 0;
  };

  chips.forEach((chip) => chip.addEventListener("click", () => apply(chip.dataset.filter)));

  // Links da seção de raças ("Ver Mini Lop disponíveis")
  $$("[data-filter-link]").forEach((link) =>
    link.addEventListener("click", () => apply(link.dataset.filterLink))
  );
}

/* =========================
   CARROSSEL DE DEPOIMENTOS
========================= */
function initTestimonials() {
  const track = $(".quotes__track");
  const prev = $("[data-quotes-prev]");
  const next = $("[data-quotes-next]");
  const dotsWrap = $("[data-quotes-dots]");
  if (!track || !prev || !next || !dotsWrap) return;

  const slides = Array.from(track.children);
  const gap = () => parseFloat(getComputedStyle(track).columnGap) || 24;
  const step = () => slides[0].getBoundingClientRect().width + gap();
  const visibleCount = () => Math.max(1, Math.round((track.clientWidth + gap()) / step()));
  const pageCount = () => Math.max(1, slides.length - visibleCount() + 1);

  let dots = [];

  const buildDots = () => {
    dotsWrap.innerHTML = "";
    dots = Array.from({ length: pageCount() }, (_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("aria-label", `Ir para o depoimento ${index + 1}`);
      dot.addEventListener("click", () =>
        track.scrollTo({ left: index * step(), behavior: scrollBehavior() })
      );
      dotsWrap.appendChild(dot);
      return dot;
    });
    dotsWrap.hidden = dots.length < 2;
    update();
  };

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const left = track.scrollLeft;
    let index = Math.round(left / step());
    if (left >= max - 2) index = dots.length - 1;
    index = Math.max(0, Math.min(index, dots.length - 1));

    dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));
    prev.disabled = left <= 2;
    next.disabled = left >= max - 2;
  };

  prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: scrollBehavior() }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: scrollBehavior() }));
  track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });

  if ("ResizeObserver" in window) {
    new ResizeObserver(buildDots).observe(track);
  } else {
    window.addEventListener("resize", buildDots);
  }
  buildDots();
}

/* =========================
   LIGHTBOX DA GALERIA
========================= */
function initLightbox() {
  const dialog = $("#lightbox");
  const buttons = $$(".gallery__btn");
  if (!dialog || typeof dialog.showModal !== "function" || !buttons.length) return;

  const img = $(".lightbox__img", dialog);
  const caption = $(".lightbox__caption", dialog);
  const count = $(".lightbox__count", dialog);
  const phLabel = $(".lightbox__ph-label", dialog);
  let index = 0;

  const show = (i) => {
    index = (i + buttons.length) % buttons.length;
    const button = buttons[index];
    dialog.classList.remove("is-missing");
    img.onerror = () => {
      dialog.classList.add("is-missing");
      phLabel.textContent = button.dataset.full;
    };
    img.src = button.dataset.full;
    img.alt = button.dataset.caption || "";
    caption.textContent = button.dataset.caption || "";
    count.textContent = `${index + 1} de ${buttons.length}`;
  };

  const open = (i) => {
    show(i);
    dialog.showModal();
    document.documentElement.classList.add("lightbox-open");
  };

  buttons.forEach((button, i) => button.addEventListener("click", () => open(i)));

  $("[data-lightbox-close]", dialog).addEventListener("click", () => dialog.close());
  $("[data-lightbox-prev]", dialog).addEventListener("click", () => show(index - 1));
  $("[data-lightbox-next]", dialog).addEventListener("click", () => show(index + 1));

  // Clicar fora da foto fecha
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.classList.contains("lightbox__inner")) dialog.close();
  });

  dialog.addEventListener("close", () => document.documentElement.classList.remove("lightbox-open"));

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });

  // Deslizar no celular
  let startX = 0;
  dialog.addEventListener("touchstart", (event) => (startX = event.changedTouches[0].clientX), { passive: true });
  dialog.addEventListener(
    "touchend",
    (event) => {
      const delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 60) show(index + (delta < 0 ? 1 : -1));
    },
    { passive: true }
  );
}

/* =========================
   BOTÃO FIXO DE WHATSAPP (celular)
========================= */
function initFab() {
  const fab = $(".wa-fab");
  const hero = $("#inicio");
  const contact = $("#contato");
  if (!fab || !("IntersectionObserver" in window)) return;

  const state = { hero: true, contact: false };
  const update = () => fab.classList.toggle("is-visible", !state.hero && !state.contact);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) state.hero = entry.isIntersecting;
        if (entry.target === contact) state.contact = entry.isIntersecting;
      });
      update();
    },
    { threshold: 0.15 }
  );

  [hero, contact].forEach((el) => el && observer.observe(el));
}

/* =========================
   INICIALIZAÇÃO
========================= */
initImageFallbacks();
initHeader();
initAnchors(initMenu());
initActiveNav();
initReveal();
initWhatsApp();
initInstagram();
initFilters();
initTestimonials();
initLightbox();
initFab();
