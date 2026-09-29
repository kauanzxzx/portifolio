/**
 * js/script.js
 * -----------------------------------------------------------------------
 * Toda a interatividade do site: renderização do cardápio a partir de
 * data/cardapio.js, modal de personalização, carrinho, checkout em
 * etapas e montagem da mensagem final enviada via link wa.me.
 *
 * Estrutura pensada para V2: as funções que hoje leem `LBD_DATA.PRODUTOS`
 * podem futuramente ler de uma API sem alterar o restante do fluxo.
 * -----------------------------------------------------------------------
 */
(function () {
  "use strict";

  const { CATEGORIAS, PRODUTOS, CONFIGURACOES } = window.LBD_DATA;

  const fmtBRL = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  /* ---------------------------------------------------------------------
   * Estado
   * ------------------------------------------------------------------- */
  const state = {
    categoriaAtiva: CATEGORIAS[0].id,
    produtoModal: null,
    modalSelecao: { tamanho: null, adicionais: [], observacao: "", qtd: 1 },
    carrinho: [], // { uid, produtoId, nome, imagem, precoUnit, qtd, detalhes }
    checkout: {
      etapa: 1, // 1 entrega, 2 pagamento, 3 revisão
      tipoEntrega: null, // 'delivery' | 'retirada'
      nome: "",
      whatsapp: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      pagamento: null, // 'pix' | 'dinheiro' | 'cartao'
      precisaTroco: null,
      trocoPara: "",
      observacaoPedido: "",
    },
  };

  /* ---------------------------------------------------------------------
   * Referências DOM
   * ------------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const header = $(".header");
  const burger = $(".burger");
  const mobileNav = $(".mobile-nav");
  const menuTabsEl = $(".menu-tabs");
  const menuGridEl = $(".menu-list");
  const menuEmptyEl = $(".menu-empty");

  const overlay = $(".overlay");
  const productModal = $(".product-modal");
  const cartDrawer = $(".cart-drawer");
  const checkoutPanel = $(".checkout");

  const cartCountEls = $$(".cart-count");
  const toastEl = $(".toast");

  /* ---------------------------------------------------------------------
   * Header: transparência -> sólido ao rolar + menu mobile
   * ------------------------------------------------------------------- */
  function onScrollHeader() {
    if (window.scrollY > 24) header.classList.add("is-solid");
    else header.classList.remove("is-solid");
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  const navLinks = $$(".header__nav a");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("section[id]").forEach((sec) => spy.observe(sec));

  burger.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
  });
  $$(".mobile-nav a").forEach((a) =>
    a.addEventListener("click", () => mobileNav.classList.remove("is-open"))
  );

  /* ---------------------------------------------------------------------
   * Categorias do cardápio
   * ------------------------------------------------------------------- */
  function renderTabs() {
    menuTabsEl.innerHTML = CATEGORIAS.map(
      (c) =>
        `<button class="menu-tab${c.id === state.categoriaAtiva ? " is-active" : ""}" data-cat="${c.id}">${c.nome}</button>`
    ).join("");
  }

  menuTabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu-tab");
    if (!btn) return;
    state.categoriaAtiva = btn.dataset.cat;
    renderTabs();
    renderMenu();
  });

  /* ---------------------------------------------------------------------
   * Grid de produtos
   * ------------------------------------------------------------------- */
  function cardHTML(p, i) {
    return `
      <article class="product-card" data-id="${p.id}" style="animation-delay:${Math.min(i * 0.04, 0.3)}s">
        <div class="product-card__media">
          <span class="product-card__cat">${p.grupo || categoriaLabel(p.categoria)}</span>
          <img src="${p.imagem}" alt="${p.nome}" loading="lazy" onerror="this.closest('.product-card__media').classList.add('no-img'); this.remove();">
        </div>
        <div class="product-card__body">
          <h3>${p.nome}</h3>
          <p>${p.descricao}</p>
          <div class="product-card__footer">
            <span class="product-card__price">${fmtBRL(p.preco)}</span>
            <button class="add-btn" data-quick="${p.id}" aria-label="Adicionar ${p.nome}"><i class="bi bi-plus-lg"></i></button>
          </div>
        </div>
      </article>`;
  }

  function renderMenu() {
    const cat = CATEGORIAS.find((c) => c.id === state.categoriaAtiva);
    const lista = PRODUTOS.filter((p) => p.disponivel && p.categoria === state.categoriaAtiva);

    menuEmptyEl.style.display = lista.length ? "none" : "block";

    // Cabeçalho de tamanho (ex.: "Pizza Grande · 35cm · 12 fatias")
    let html = "";
    if (cat && cat.pizza) {
      html += `<div class="menu-size"><h3>${cat.nome}</h3>${cat.detalhe ? `<span>${cat.detalhe}</span>` : ""}<p>Escolha o sabor e personalize.</p></div>`;
    }

    // Agrupa por "grupo" (Salgadas / Doces) quando existir
    const grupos = [];
    lista.forEach((p) => {
      const nome = p.grupo || "";
      let g = grupos.find((g) => g.nome === nome);
      if (!g) grupos.push((g = { nome, itens: [] }));
      g.itens.push(p);
    });

    let idx = 0;
    grupos.forEach((g) => {
      if (g.nome) html += `<h4 class="menu-group">Pizzas ${g.nome.toLowerCase()}</h4>`;
      html += `<div class="menu-grid">${g.itens.map((p) => cardHTML(p, idx++)).join("")}</div>`;
    });

    menuGridEl.innerHTML = html;
  }

  function categoriaLabel(id) {
    const c = CATEGORIAS.find((c) => c.id === id);
    return c ? c.nome : "";
  }

  menuGridEl.addEventListener("click", (e) => {
    const quick = e.target.closest("[data-quick]");
    if (quick) {
      e.stopPropagation();
      const produto = PRODUTOS.find((p) => p.id == quick.dataset.quick);
      // Produto sem opções (tamanho/adicionais): adiciona direto ao carrinho.
      if (!produto.tamanhos && (!produto.adicionais || !produto.adicionais.length)) {
        addAoCarrinho(produto, { tamanho: null, adicionais: [], observacao: "", qtd: 1 });
        bump(quick);
        showToast(`${produto.nome} adicionado ao pedido`);
        return;
      }
      openModal(produto.id);
      return;
    }
    const card = e.target.closest(".product-card");
    if (card) openModal(card.dataset.id);
  });

  function bump(el) {
    el.classList.remove("is-bumped");
    void el.offsetWidth;
    el.classList.add("is-bumped");
  }

  /* ---------------------------------------------------------------------
   * Modal de personalização
   * ------------------------------------------------------------------- */
  function openModal(id) {
    const produto = PRODUTOS.find((p) => p.id == id);
    if (!produto) return;
    state.produtoModal = produto;
    state.modalSelecao = {
      tamanho: produto.tamanhos ? produto.tamanhos[produto.tamanhos.length - 1].id : null,
      adicionais: [],
      observacao: "",
      qtd: 1,
    };
    renderModal();
    openPanel(productModal);
  }

  function renderModal() {
    const p = state.produtoModal;
    if (!p) return;
    const sel = state.modalSelecao;

    let html = `
      <div class="modal__media">
        <img src="${p.imagem}" alt="${p.nome}" onerror="this.style.display='none'">
        <button class="modal__close" data-close-modal aria-label="Fechar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="modal__body">
        <h3>${p.nomeCarrinho || p.nome}</h3>
        ${p.tamanhoNome ? `<span class="modal__size">${p.tamanhoNome}</span>` : ""}
        <p class="desc">${p.descricao}</p>`;

    if (p.tamanhos) {
      html += `
        <div class="opt-group">
          <div class="opt-group__title">Escolha o tamanho</div>
          <div class="opt-size">
            ${p.tamanhos
              .map(
                (t) => `
              <label>
                <input type="radio" name="tamanho" value="${t.id}" ${t.id === sel.tamanho ? "checked" : ""}>
                ${t.nome}
              </label>`
              )
              .join("")}
          </div>
        </div>`;
    }

    if (p.adicionais && p.adicionais.length) {
      html += `
        <div class="opt-group">
          <div class="opt-group__title">Adicionais</div>
          ${p.adicionais
            .map(
              (a) => `
            <div class="opt-extra">
              <label><input type="checkbox" name="adicional" value="${a.id}" ${sel.adicionais.includes(a.id) ? "checked" : ""}> ${a.nome}</label>
              <span class="price">+ ${fmtBRL(a.preco)}</span>
            </div>`
            )
            .join("")}
        </div>`;
    }

    html += `
        <div class="opt-group opt-note">
          <div class="opt-group__title">Observações</div>
          <textarea name="observacao" placeholder="Ex: retirar cebola...">${sel.observacao}</textarea>
        </div>

        <div class="opt-group">
          <div class="opt-group__title">Quantidade</div>
          <div class="qty-control">
            <button type="button" data-qty="-1" aria-label="Diminuir"><i class="bi bi-dash"></i></button>
            <span>${sel.qtd}</span>
            <button type="button" data-qty="1" aria-label="Aumentar"><i class="bi bi-plus"></i></button>
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <div class="modal__total">
          <span class="label">Total</span>
          <span class="value">${fmtBRL(calcularTotalModal())}</span>
        </div>
        <button class="btn btn-primary btn-lg" data-add-cart>Adicionar ao pedido</button>
      </div>`;

    productModal.innerHTML = html;
  }

  function calcularUnitario() {
    const p = state.produtoModal;
    const sel = state.modalSelecao;
    let base = p.preco;
    if (p.tamanhos) {
      const t = p.tamanhos.find((t) => t.id === sel.tamanho);
      if (t) base = p.preco * t.fator;
    }
    let adicionaisTotal = 0;
    if (p.adicionais) {
      sel.adicionais.forEach((id) => {
        const a = p.adicionais.find((a) => a.id === id);
        if (a) adicionaisTotal += a.preco;
      });
    }
    return base + adicionaisTotal;
  }

  function calcularTotalModal() {
    return calcularUnitario() * state.modalSelecao.qtd;
  }

  productModal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-modal]")) return closePanel(productModal);

    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const delta = parseInt(qtyBtn.dataset.qty, 10);
      state.modalSelecao.qtd = Math.max(1, state.modalSelecao.qtd + delta);
      renderModal();
      return;
    }

    if (e.target.closest("[data-add-cart]")) {
      const p = state.produtoModal;
      addAoCarrinho(p, { ...state.modalSelecao });
      showToast(`${p.nome} adicionado ao pedido`);
      closePanel(productModal);
    }
  });

  productModal.addEventListener("change", (e) => {
    if (e.target.name === "tamanho") {
      state.modalSelecao.tamanho = e.target.value;
      renderModal();
    }
    if (e.target.name === "adicional") {
      const id = e.target.value;
      const list = state.modalSelecao.adicionais;
      const idx = list.indexOf(id);
      if (e.target.checked && idx === -1) list.push(id);
      if (!e.target.checked && idx > -1) list.splice(idx, 1);
      renderModal();
    }
  });

  productModal.addEventListener("input", (e) => {
    if (e.target.name === "observacao") state.modalSelecao.observacao = e.target.value;
  });

  /* ---------------------------------------------------------------------
   * Carrinho
   * ------------------------------------------------------------------- */
  function addAoCarrinho(produto, selecao) {
    const detalhes = [];
    let tamanhoNome = null;
    if (produto.tamanhoNome) {
      tamanhoNome = produto.tamanhoNome;
      detalhes.push(produto.tamanhoNome);
    } else if (selecao.tamanho && produto.tamanhos) {
      const t = produto.tamanhos.find((t) => t.id === selecao.tamanho);
      if (t) { tamanhoNome = t.nome; detalhes.push(t.nome); }
    }
    const adicionaisNomes = [];
    if (selecao.adicionais && selecao.adicionais.length && produto.adicionais) {
      selecao.adicionais.forEach((id) => {
        const a = produto.adicionais.find((a) => a.id === id);
        if (a) { adicionaisNomes.push(a.nome); detalhes.push(`+ ${a.nome}`); }
      });
    }
    if (selecao.observacao) detalhes.push(`Obs: ${selecao.observacao}`);

    const precoUnit = (function () {
      let base = produto.preco;
      if (selecao.tamanho && produto.tamanhos) {
        const t = produto.tamanhos.find((t) => t.id === selecao.tamanho);
        if (t) base = produto.preco * t.fator;
      }
      let extra = 0;
      if (produto.adicionais) {
        (selecao.adicionais || []).forEach((id) => {
          const a = produto.adicionais.find((a) => a.id === id);
          if (a) extra += a.preco;
        });
      }
      return base + extra;
    })();

    state.carrinho.push({
      uid: `${produto.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      produtoId: produto.id,
      nome: produto.nomeCarrinho || produto.nome,
      imagem: produto.imagem,
      tamanho: tamanhoNome,
      adicionaisNomes,
      observacao: selecao.observacao || "",
      precoUnit,
      qtd: selecao.qtd || 1,
      detalhesTexto: detalhes,
    });

    renderCartCount();
    renderCart();
  }

  function removerDoCarrinho(uid) {
    state.carrinho = state.carrinho.filter((i) => i.uid !== uid);
    renderCartCount();
    renderCart();
  }

  function alterarQtdCarrinho(uid, delta) {
    const item = state.carrinho.find((i) => i.uid === uid);
    if (!item) return;
    item.qtd = Math.max(1, item.qtd + delta);
    renderCartCount();
    renderCart();
  }

  function subtotalCarrinho() {
    return state.carrinho.reduce((sum, i) => sum + i.precoUnit * i.qtd, 0);
  }

  function totalItensCarrinho() {
    return state.carrinho.reduce((sum, i) => sum + i.qtd, 0);
  }

  function renderCartCount() {
    const n = totalItensCarrinho();
    cartCountEls.forEach((el) => {
      el.textContent = n;
      el.classList.toggle("is-visible", n > 0);
    });
  }

  function renderCart() {
    const listEl = $(".cart-drawer__list");
    const footEl = $(".cart-drawer__foot");

    if (!state.carrinho.length) {
      listEl.innerHTML = `
        <div class="cart-empty">
          <div class="icon"><i class="bi bi-bag"></i></div>
          <p>Seu carrinho está vazio.<br>Adicione itens do cardápio.</p>
        </div>`;
      footEl.style.display = "none";
      return;
    }

    footEl.style.display = "block";
    listEl.innerHTML = state.carrinho
      .map(
        (i) => `
      <div class="cart-item" data-uid="${i.uid}">
        <div class="cart-item__media"><img src="${i.imagem}" alt="${i.nome}" onerror="this.style.display='none'"></div>
        <div class="cart-item__info">
          <h4>${i.nome}</h4>
          ${i.detalhesTexto.length ? `<div class="cart-item__opts">${i.detalhesTexto.join(" · ")}</div>` : ""}
          <div class="cart-item__row">
            <div class="cart-item__qty">
              <button data-cart-qty="-1" aria-label="Diminuir"><i class="bi bi-dash"></i></button>
              <span>${i.qtd}</span>
              <button data-cart-qty="1" aria-label="Aumentar"><i class="bi bi-plus"></i></button>
            </div>
            <span class="cart-item__price">${fmtBRL(i.precoUnit * i.qtd)}</span>
          </div>
          <button class="cart-item__remove" data-cart-remove>Remover</button>
        </div>
      </div>`
      )
      .join("");

    footEl.innerHTML = `
      <div class="cart-drawer__subtotal">
        <span>Subtotal</span>
        <strong>${fmtBRL(subtotalCarrinho())}</strong>
      </div>
      <button class="btn btn-primary btn-block btn-lg" data-go-checkout>Finalizar pedido</button>
      <button class="cart-clear" data-clear-cart>Limpar pedido</button>`;
  }

  cartDrawer.addEventListener("click", (e) => {
    const uidEl = e.target.closest("[data-uid]");
    const uid = uidEl ? uidEl.dataset.uid : null;

    if (e.target.closest("[data-cart-qty]")) {
      alterarQtdCarrinho(uid, parseInt(e.target.closest("[data-cart-qty]").dataset.cartQty, 10));
    }
    if (e.target.closest("[data-cart-remove]")) removerDoCarrinho(uid);
    if (e.target.closest("[data-clear-cart]")) {
      state.carrinho = [];
      renderCartCount();
      renderCart();
    }
    if (e.target.closest("[data-go-checkout]")) {
      closePanel(cartDrawer);
      abrirCheckout();
    }
    if (e.target.closest("[data-close-cart]")) closePanel(cartDrawer);
  });

  /* ---------------------------------------------------------------------
   * Painéis (modal / drawer / checkout) — abrir / fechar
   * ------------------------------------------------------------------- */
  function openPanel(panel) {
    overlay.classList.add("is-open");
    panel.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closePanel(panel) {
    panel.classList.remove("is-open");
    const anyOpen = $$(".is-open").some((el) => el !== overlay);
    if (!anyOpen) {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }
  overlay.addEventListener("click", () => {
    [productModal, cartDrawer, checkoutPanel].forEach(closePanel);
  });

  $$("[data-open-cart]").forEach((btn) =>
    btn.addEventListener("click", () => {
      renderCart();
      openPanel(cartDrawer);
    })
  );

  /* ---------------------------------------------------------------------
   * Checkout em etapas
   * ------------------------------------------------------------------- */
  function abrirCheckout() {
    if (!state.carrinho.length) return;
    state.checkout.etapa = 1;
    renderCheckout();
    openPanel(checkoutPanel);
  }

  function renderCheckout() {
    const c = state.checkout;
    const progress = `
      <div class="checkout__progress">
        <span class="${c.etapa >= 1 ? "is-done" : ""}"></span>
        <span class="${c.etapa >= 2 ? "is-done" : ""}"></span>
        <span class="${c.etapa >= 3 ? "is-done" : ""}"></span>
      </div>`;

    let title = "Como você prefere receber?";
    let body = "";
    let foot = "";

    if (c.etapa === 1) {
      body = `
        <label class="choice-card">
          <input type="radio" name="tipoEntrega" value="delivery" ${c.tipoEntrega === "delivery" ? "checked" : ""}>
          <span class="icon"><i class="bi bi-bicycle"></i></span>
          <span class="txt"><strong>Delivery</strong><span>Receba no seu endereço</span></span>
        </label>
        <label class="choice-card">
          <input type="radio" name="tipoEntrega" value="retirada" ${c.tipoEntrega === "retirada" ? "checked" : ""}>
          <span class="icon"><i class="bi bi-shop"></i></span>
          <span class="txt"><strong>Retirada</strong><span>Busque direto na pizzaria</span></span>
        </label>

        <div class="form-field" style="margin-top:22px;">
          <label>Nome</label>
          <input type="text" name="nome" value="${c.nome}" placeholder="Seu nome">
        </div>
        <div class="form-field">
          <label>WhatsApp</label>
          <input type="tel" name="whatsapp" value="${c.whatsapp}" placeholder="(47) 99999-9999">
        </div>

        ${
          c.tipoEntrega === "delivery"
            ? `
        <div class="form-field">
          <label>CEP</label>
          <input type="text" name="cep" value="${c.cep}" placeholder="00000-000">
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Endereço</label>
            <input type="text" name="endereco" value="${c.endereco}" placeholder="Rua">
          </div>
          <div class="form-field" style="max-width:110px;">
            <label>Número</label>
            <input type="text" name="numero" value="${c.numero}" placeholder="Nº">
          </div>
        </div>
        <div class="form-field">
          <label>Complemento</label>
          <input type="text" name="complemento" value="${c.complemento}" placeholder="Apto, bloco... (opcional)">
        </div>
        <div class="form-field">
          <label>Bairro</label>
          <input type="text" name="bairro" value="${c.bairro}" placeholder="Bairro">
        </div>`
            : ""
        }`;

      foot = `<button class="btn btn-primary btn-block btn-lg" data-next>Continuar</button>`;
    }

    if (c.etapa === 2) {
      title = "Forma de pagamento";
      body = `
        <label class="choice-card">
          <input type="radio" name="pagamento" value="pix" ${c.pagamento === "pix" ? "checked" : ""}>
          <span class="icon"><i class="bi bi-qr-code"></i></span>
          <span class="txt"><strong>Pix</strong></span>
        </label>
        <label class="choice-card">
          <input type="radio" name="pagamento" value="dinheiro" ${c.pagamento === "dinheiro" ? "checked" : ""}>
          <span class="icon"><i class="bi bi-cash-coin"></i></span>
          <span class="txt"><strong>Dinheiro</strong></span>
        </label>
        <label class="choice-card">
          <input type="radio" name="pagamento" value="cartao" ${c.pagamento === "cartao" ? "checked" : ""}>
          <span class="icon"><i class="bi bi-credit-card"></i></span>
          <span class="txt"><strong>Cartão</strong></span>
        </label>

        ${
          c.pagamento === "dinheiro"
            ? `
        <div class="opt-group">
          <div class="opt-group__title">Precisa de troco?</div>
          <div style="display:flex; gap:10px;">
            <label class="choice-card" style="flex:1; margin-bottom:0;">
              <input type="radio" name="precisaTroco" value="nao" ${c.precisaTroco === "nao" ? "checked" : ""}>
              <span class="txt"><strong>Não</strong></span>
            </label>
            <label class="choice-card" style="flex:1; margin-bottom:0;">
              <input type="radio" name="precisaTroco" value="sim" ${c.precisaTroco === "sim" ? "checked" : ""}>
              <span class="txt"><strong>Sim</strong></span>
            </label>
          </div>
        </div>
        ${
          c.precisaTroco === "sim"
            ? `<div class="form-field"><label>Troco para quanto?</label><input type="text" name="trocoPara" value="${c.trocoPara}" placeholder="Ex: R$ 100,00"></div>`
            : ""
        }`
            : ""
        }

        <div class="form-field" style="margin-top:6px;">
          <label>Alguma observação para o pedido?</label>
          <textarea name="observacaoPedido" placeholder="Ex: tocar a campainha">${c.observacaoPedido}</textarea>
        </div>`;
      foot = `<button class="btn btn-primary btn-block btn-lg" data-next>Continuar</button>`;
    }

    if (c.etapa === 3) {
      title = "Confirme seu pedido";
      const taxa = c.tipoEntrega === "delivery" ? CONFIGURACOES.taxaEntrega : 0;
      const total = subtotalCarrinho() + taxa;

      body = `
        ${state.carrinho
          .map(
            (i) => `
          <div class="summary-item">
            <h4>${i.qtd}x ${i.nome}</h4>
            ${i.detalhesTexto.length ? `<div class="opts">${i.detalhesTexto.join(" · ")}</div>` : ""}
            <div class="row"><span></span><span>${fmtBRL(i.precoUnit * i.qtd)}</span></div>
          </div>`
          )
          .join("")}

        <div class="summary-line"><span>Subtotal</span><span>${fmtBRL(subtotalCarrinho())}</span></div>
        ${c.tipoEntrega === "delivery" ? `<div class="summary-line"><span>Entrega</span><span>${fmtBRL(taxa)}</span></div>` : ""}
        <div class="summary-line total"><span>Total</span><span>${fmtBRL(total)}</span></div>`;

      foot = `<button class="btn btn-primary btn-block btn-lg" data-send-whats><i class="bi bi-whatsapp"></i> Enviar pedido pelo WhatsApp</button>`;
    }

    checkoutPanel.innerHTML = `
      <div class="checkout__head">
        <button class="checkout__back" data-checkout-back aria-label="Voltar"><i class="bi bi-arrow-left"></i></button>
        <h3>${title}</h3>
        <button class="checkout__close" data-close-checkout aria-label="Fechar"><i class="bi bi-x-lg"></i></button>
      </div>
      ${progress}
      <div class="checkout__body">${body}</div>
      <div class="checkout__foot">${foot}</div>`;
  }

  // Só os campos de escolha (rádio) precisam re-renderizar o passo, pois
  // alteram quais campos aparecem em seguida. Campos de texto (nome,
  // endereço etc.) são tratados só pelo listener de "input" abaixo, sem
  // recriar o DOM — senão o formulário perderia o foco a cada Tab/clique.
  checkoutPanel.addEventListener("change", (e) => {
    const c = state.checkout;
    const name = e.target.name;
    if (name === "tipoEntrega") { c.tipoEntrega = e.target.value; renderCheckout(); }
    if (name === "pagamento") { c.pagamento = e.target.value; renderCheckout(); }
    if (name === "precisaTroco") { c.precisaTroco = e.target.value; renderCheckout(); }
  });

  checkoutPanel.addEventListener("input", (e) => {
    const c = state.checkout;
    const map = ["nome", "whatsapp", "cep", "endereco", "numero", "complemento", "bairro", "trocoPara", "observacaoPedido"];
    if (map.includes(e.target.name)) c[e.target.name] = e.target.value;
  });

  checkoutPanel.addEventListener("click", (e) => {
    const c = state.checkout;

    if (e.target.closest("[data-close-checkout]")) return closePanel(checkoutPanel);

    if (e.target.closest("[data-checkout-back]")) {
      if (c.etapa > 1) { c.etapa -= 1; renderCheckout(); }
      else closePanel(checkoutPanel);
      return;
    }

    if (e.target.closest("[data-next]")) {
      if (c.etapa === 1) {
        if (!c.tipoEntrega) return showToast("Escolha delivery ou retirada");
        if (!c.nome || !c.whatsapp) return showToast("Preencha nome e WhatsApp");
        if (c.tipoEntrega === "delivery" && (!c.endereco || !c.numero || !c.bairro))
          return showToast("Preencha o endereço completo");
      }
      if (c.etapa === 2 && !c.pagamento) return showToast("Escolha a forma de pagamento");
      c.etapa += 1;
      renderCheckout();
      return;
    }

    if (e.target.closest("[data-send-whats]")) enviarPedidoWhatsapp();
  });

  /* ---------------------------------------------------------------------
   * Geração dinâmica da mensagem do WhatsApp
   * ------------------------------------------------------------------- */
  function enviarPedidoWhatsapp() {
    const c = state.checkout;
    const taxa = c.tipoEntrega === "delivery" ? CONFIGURACOES.taxaEntrega : 0;
    const total = subtotalCarrinho() + taxa;

    const linhas = [];
    linhas.push(`🍕 *NOVO PEDIDO - ${CONFIGURACOES.nomeLoja.toUpperCase()}*`);
    linhas.push("");
    linhas.push(`👤 *Cliente:* ${c.nome}`);
    linhas.push(`📱 *WhatsApp:* ${c.whatsapp}`);
    linhas.push("");
    linhas.push("📦 *PEDIDO*");
    state.carrinho.forEach((i) => {
      linhas.push("");
      linhas.push(`${i.qtd}x ${i.nome}`);
      if (i.tamanho) linhas.push(`   Tamanho: ${i.tamanho}`);
      i.adicionaisNomes.forEach((a) => linhas.push(`   + ${a}`));
      if (i.observacao) linhas.push(`   Obs: ${i.observacao}`);
      linhas.push(`   ${fmtBRL(i.precoUnit * i.qtd)}`);
    });
    linhas.push("");

    if (c.tipoEntrega === "delivery") {
      linhas.push("🛵 *ENTREGA*");
      linhas.push("");
      linhas.push(`${c.endereco}, ${c.numero}${c.complemento ? " - " + c.complemento : ""}`);
      linhas.push(`${c.bairro}`);
      if (c.cep) linhas.push(`CEP: ${c.cep}`);
    } else {
      linhas.push("🏪 *RETIRADA NO BALCÃO*");
      linhas.push(CONFIGURACOES.endereco);
    }
    linhas.push("");

    let pagamentoTexto = { pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão" }[c.pagamento];
    if (c.pagamento === "dinheiro" && c.precisaTroco === "sim" && c.trocoPara) {
      pagamentoTexto += ` (troco para ${c.trocoPara})`;
    }
    linhas.push(`💳 *Pagamento:* ${pagamentoTexto}`);

    if (c.observacaoPedido) {
      linhas.push("");
      linhas.push("📝 *Observação:*");
      linhas.push(c.observacaoPedido);
    }

    linhas.push("");
    linhas.push(`💰 *TOTAL: ${fmtBRL(total)}*`);

    const mensagem = linhas.join("\n");
    const url = `https://wa.me/${CONFIGURACOES.whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");

    // Limpa o pedido após o envio.
    state.carrinho = [];
    renderCartCount();
    closePanel(checkoutPanel);
    showToast("Pedido enviado! Confirme no WhatsApp.");
  }

  /* ---------------------------------------------------------------------
   * Toast
   * ------------------------------------------------------------------- */
  let toastTimer = null;
  function showToast(msg) {
    toastEl.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${msg}`;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
  }

  /* ---------------------------------------------------------------------
   * Scroll reveal simples para seções (fade-up ao entrar no viewport)
   * ------------------------------------------------------------------- */
  function initReveal() {
    const els = $$("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => {
      el.style.opacity = 0;
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
   * Inicialização
   * ------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    renderTabs();
    renderMenu();
    renderCart();
    initReveal();
  });
})();
