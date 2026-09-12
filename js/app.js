/* ===================================================================
   Balinda Fashion Store — app logic (cart, filters, search, UI)
   =================================================================== */

(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const CURRENCY = { symbol: "$", code: "USD" };

  /* ---------- State ---------- */
  let cart = loadCart();
  let activeFilter = "all";
  let searchTerm = "";
  let sortBy = "featured";

  /* ---------- Elements ---------- */
  const productsGrid = $("#productsGrid");
  const emptyState = $("#emptyState");
  const cartDrawer = $("#cartDrawer");
  const overlay = $("#overlay");
  const cartItems = $("#cartItems");
  const cartSummary = $("#cartSummary");
  const cartCount = $("#cartCount");
  const cartHeaderCount = $("#cartHeaderCount");
  const toast = $("#toast");

  /* ---------- Cart persistence ---------- */
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem("balinda-cart")) || [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem("balinda-cart", JSON.stringify(cart));
    } catch {
      /* storage unavailable */
    }
    updateCartUI();
  }

  /* ---------- Money ---------- */
  const formatMoney = (n) => `${CURRENCY.symbol}${n.toFixed(2)}`;

  /* ---------- Product images (CSS gradients) ---------- */
  const productBg = (p) =>
    `background-image: radial-gradient(circle at 30% 25%, ${p.image[0]}, ${p.image[1]} 78%),
     linear-gradient(160deg, ${p.image[0]}, ${p.image[1]});`;

  /* ---------- Render products ---------- */
  function visibleProducts() {
    let list = PRODUCTS.filter((p) => {
      const matchesCat = activeFilter === "all" || p.category === activeFilter;
      const matchesSearch =
        !searchTerm ||
        `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchTerm);
      return matchesCat && matchesSearch;
    });

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return list;
  }

  function stockNote(p) {
    if (p.stock === 0) {
      return `<span class="stock-note out-of-stock">Sold out</span>`;
    }
    if (p.stock <= 5) {
      return `<span class="stock-note low-stock">Only ${p.stock} left</span>`;
    }
    return `<span class="stock-note in-stock">In stock</span>`;
  }

  function renderProducts() {
    const list = visibleProducts();
    emptyState.hidden = list.length > 0;

    productsGrid.innerHTML = list
      .map(
        (p) => `
      <article class="product-card" data-id="${p.id}">
        <div class="product-media" style="${productBg(p)}">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
          ${p.stock === 0 ? `<span class="product-badge badge-out">Sold out</span>` : ""}
          ${p.stock > 0 && p.stock <= 5 ? `<span class="product-badge badge-low">Low stock</span>` : ""}
          <button class="product-quick" data-add="${p.id}" ${p.stock === 0 ? "disabled" : ""}>${p.stock === 0 ? "Sold Out" : `Add to Bag — ${formatMoney(p.price)}`}</button>
        </div>
        <div class="product-info">
          <span class="product-cat">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          ${stockNote(p)}
          ${p.colors.length ? `<div class="product-swatches">${p.colors.map((c) => `<span class="swatch" style="background:${c}" title="Colour"></span>`).join("")}</div>` : ""}
          <div class="product-price-row">
            <span class="product-price ${p.oldPrice ? "sale" : ""}">${formatMoney(p.price)}</span>
            ${p.oldPrice ? `<span class="product-price old">${formatMoney(p.oldPrice)}</span>` : ""}
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  /* ---------- Filters / sort / search ---------- */
  function setFilter(filter) {
    activeFilter = filter;
    $$(".filter-tab").forEach((b) =>
      b.classList.toggle("active", b.dataset.filter === filter)
    );
    renderProducts();
  }

  $("#filterTabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".filter-tab");
    if (tab) setFilter(tab.dataset.filter);
  });

  $("#sortSelect").addEventListener("change", (e) => {
    sortBy = e.target.value;
    renderProducts();
  });

  let searchDebounce;
  $("#searchInput").addEventListener("input", (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      searchTerm = e.target.value.trim().toLowerCase();
      renderProducts();
    }, 200);
  });

  $("#searchToggle").addEventListener("click", () => {
    const bar = $("#searchBar");
    bar.classList.toggle("open");
    if (bar.classList.contains("open")) $("#searchInput").focus();
  });

  // Category shortcuts (home + footer)
  $$("[data-cat]").forEach((el) =>
    el.addEventListener("click", () => setFilter(el.dataset.cat))
  );
  $$("[data-col]").forEach((el) =>
    el.addEventListener("click", () => setFilter(el.dataset.col))
  );

  /* ---------- Cart operations ---------- */
  function addToCart(id) {
    const product = PRODUCTS.find((p) => p.id === Number(id));
    if (!product) return;

    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: product.id, qty: 1 });
    }
    saveCart();
    showToast(`${product.name} added to your bag`);
  }

  function changeQty(id, delta) {
    const item = cart.find((i) => i.id === Number(id));
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.id !== Number(id));
    }
    saveCart();
  }

  function removeFromCart(id) {
    cart = cart.filter((i) => i.id !== Number(id));
    saveCart();
  }

  /* ---------- Cart UI ---------- */
  function updateCartUI() {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    cartCount.textContent = totalQty;
    cartCount.classList.toggle("show", totalQty > 0);
    cartHeaderCount.textContent = `(${totalQty})`;

    renderCartItems();
    renderCartSummary();
  }

  function renderCartItems() {
    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty.</p>
          <a href="#shop" class="btn btn-outline">Start Shopping</a>
        </div>`;
      cartSummary.hidden = true;
      return;
    }

    cartSummary.hidden = false;
    cartItems.innerHTML = cart
      .map((item) => {
        const p = PRODUCTS.find((x) => x.id === item.id);
        if (!p) return "";
        return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-media" style="${productBg(p)}"></div>
          <div class="cart-item-info">
            <h4>${p.name}</h4>
            <div class="meta">${p.category} &middot; ${formatMoney(p.price)}</div>
            <div class="qty-control">
              <button data-dec="${p.id}" aria-label="Decrease quantity">&minus;</button>
              <span>${item.qty}</span>
              <button data-inc="${p.id}" aria-label="Increase quantity">&plus;</button>
            </div>
          </div>
          <div class="cart-item-side">
            <span class="cart-item-price">${formatMoney(p.price * item.qty)}</span>
            <button class="remove-btn" data-remove="${p.id}">Remove</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderCartSummary() {
    const subtotal = cart.reduce(
      (s, item) => s + item.qty * PRODUCTS.find((x) => x.id === item.id).price,
      0
    );
    $('[data-subtotal]').textContent = formatMoney(subtotal);
    $("[data-total]").textContent = formatMoney(subtotal);
  }

  /* ---------- Cart events ---------- */
  productsGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (btn) addToCart(btn.dataset.add);
  });

  cartItems.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rem = e.target.closest("[data-remove]");
    if (inc) changeQty(inc.dataset.inc, 1);
    else if (dec) changeQty(dec.dataset.dec, -1);
    else if (rem) removeFromCart(rem.dataset.remove);
  });

  /* ---------- Drawer / overlay ---------- */
  function openCart() {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  $("#cartToggle").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  /* ---------- Mobile nav ---------- */
  const nav = $("#nav");
  $("#navToggle").addEventListener("click", () => {
    nav.classList.toggle("open");
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );

  /* ---------- Checkout (demo) ---------- */
  const checkoutNote = $("#checkoutNote");
  $("#checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your bag is empty");
      return;
    }
    checkoutNote.textContent = "This is a demo — no payment is taken. Thank you for browsing Balinda!";
    checkoutNote.hidden = false;
    cart = [];
    saveCart();
    showToast("Order placed — demo complete!");
  });

  /* ---------- Newsletter (demo) ---------- */
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = $("#newsMsg");
    msg.hidden = false;
    e.target.reset();
    showToast("Welcome to the Balinda list!");
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---------- Helpers: close cart from body link ---------- */
  document.addEventListener("click", (e) => {
    if (e.target.matches(".cart-empty a, #cartContinue")) closeCart();
  });

  /* ---------- Scroll progress ---------- */
  const progressBar = $("#progressBar");
  function updateProgress() {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- Back to top ---------- */
  const toTop = $("#toTop");
  function updateToTop() {
    toTop.classList.toggle("show", window.scrollY > 560);
  }
  window.addEventListener("scroll", updateToTop, { passive: true });
  updateToTop();
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  /* ---------- Header elevation ---------- */
  const header = $(".header");
  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ---------- Scroll reveal ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  function observeReveals() {
    $$(".reveal:not(.visible)").forEach((el) => revealObserver.observe(el));
  }
  observeReveals();

  /* ---------- Init ---------- */
  renderProducts();
  updateCartUI();
})();