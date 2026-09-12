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
  let wishlistOnly = false;

  /* ---------- Elements ---------- */
  const productsGrid = $("#productsGrid");
  const emptyState = $("#emptyState");
  const cartDrawer = $("#cartDrawer");
  const overlay = $("#overlay");
  const cartItems = $("#cartItems");
  const cartSummary = $("#cartSummary");
  const cartCount = $("#cartCount");
  const cartHeaderCount = $("#cartHeaderCount");
  const wishCount = $("#wishCount");
  const toast = $("#toast");

  /* ---------- Cart persistence ---------- */
  const CART_KEY = "balinda-cart";
  const CART_VERSION = 2;

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY));
      const items = raw && raw.items ? raw.items : raw;
      if (!Array.isArray(items)) return [];
      const legacy = items.filter((i) => i && i.id);
      // migrate legacy lines (no uid) by assigning new identifiers
      return legacy.map((item, idx) =>
        item.uid ? item : { uid: `legacy-${Date.now()}-${idx}`, ...item, size: item.size || null }
      );
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify({ version: CART_VERSION, items: cart })
      );
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
      const matchesWish = !wishlistOnly || wishlist.includes(p.id);
      return matchesCat && matchesSearch && matchesWish;
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

  let executedInitialRender = false;

  function renderProducts() {
    if (!executedInitialRender) {
      executedInitialRender = true;
      productsGrid.innerHTML = Array.from({ length: 8 })
        .map(
          () => `
        <div class="skeleton-card">
          <div class="sk-media"></div>
          <div class="sk-line"></div>
          <div class="sk-line short"></div>
        </div>`
        )
        .join("");
      setTimeout(renderProducts, 500);
      return;
    }

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
          <button class="product-heart ${wishlist.includes(p.id) ? "active" : ""}" data-wish="${p.id}" aria-label="Add to wishlist">${EMPTY_HEART}</button>
          <button class="product-quick" data-add="${p.id}" ${p.stock === 0 ? "disabled" : ""}>${p.stock === 0 ? "Sold Out" : `Add to Bag — ${formatMoney(p.price)}`}</button>
        </div>
        <div class="product-info">
          <span class="product-cat">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          ${stockNote(p)}
          ${p.colors.length ? `<div class="product-swatches">${p.colors.map((c) => `<span class="swatch" style="background:${c}" title="Colour"></span>`).join("")}</div>` : ""}
          <div class="rating"><span class="stars" aria-hidden="true">${"★".repeat(Math.round(p.rating))}</span><span>${p.rating.toFixed(1)}</span></div>
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

  $("#wishToggle").addEventListener("click", () => {
    if (wishlist.length === 0) {
      showToast("Tap the ♥ on any piece to save it");
      return;
    }
    wishlistOnly = !wishlistOnly;
    setFilter("all");
    updateWishlistUI();
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    showToast(wishlistOnly ? "Showing wishlist" : "Showing all products");
  });

  // Category shortcuts (home + footer)
  $$("[data-cat]").forEach((el) =>
    el.addEventListener("click", () => setFilter(el.dataset.cat))
  );
  $$("[data-col]").forEach((el) =>
    el.addEventListener("click", () => setFilter(el.dataset.col))
  );

  // Product counts on category cards
  $$(".cat-card").forEach((card) => {
    const label = card.querySelector(".cat-label span");
    if (!label) return;
    const count = PRODUCTS.filter((p) => p.category === card.dataset.cat).length;
    const existing = label.querySelector(".cat-count");
    if (!existing) {
      label.insertAdjacentHTML("beforeend", `<span class="cat-count">${count}</span>`);
    }
  });

  /* ---------- Recently viewed ---------- */
  const recentStrip = $("#recentStrip");
  const recentRow = $("#recentRow");

  function getRecent() {
    try {
      const list = JSON.parse(localStorage.getItem("balinda-recent")) || [];
      return list.map(Number).filter((n) => Number.isInteger(n));
    } catch {
      return [];
    }
  }
  function recordRecent(id) {
    const list = getRecent();
    const next = [Number(id), ...list.filter((x) => x !== Number(id))].slice(0, 6);
    try {
      localStorage.setItem("balinda-recent", JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }
  function renderRecent() {
    const list = getRecent().filter((id) => PRODUCTS.some((p) => p.id === id));
    if (!list.length) {
      recentStrip.hidden = true;
      return;
    }
    recentStrip.hidden = false;
    recentRow.innerHTML = list
      .map((id) => {
        const p = PRODUCTS.find((x) => x.id === id);
        return `
          <div class="recent-item" data-view="${p.id}">
            <div class="thumb" style="background-image:${productBg(p).replace("background-image:", "").replace(/;$/, "")}"></div>
            <div class="thumb-note">${p.name}</div>
            <div class="thumb-price">${formatMoney(p.price)}</div>
          </div>`;
      })
      .join("");
  }
  recentRow.addEventListener("click", (e) => {
    const item = e.target.closest("[data-view]");
    if (item) openQuickView(item.dataset.view);
  });

  /* ---------- Quick view ---------- */
  const quickOverlay = $("#quickOverlay");
  const quickMedia = $("#quickMedia");
  const quickBody = $("#quickBody");
  let quickProduct = null;
  let quickSize = "XS";

  const SIZES = ["XS", "S", "M", "L", "XL"];

  function openQuickView(id) {
    const p = PRODUCTS.find((x) => x.id === Number(id));
    if (!p) return;
    quickProduct = p;
    quickSize = "XS";
    recordRecent(p.id);

    quickMedia.style.backgroundImage = productBg(p)
      .replace("background-image:", "")
      .replace(/;$/, "");

    quickBody.innerHTML = `
      <p class="hero-eyebrow">${p.category}</p>
      <h2 id="quickTitle">${p.name}</h2>
      <div class="quick-price-row">
        <span class="product-price ${p.oldPrice ? "sale" : ""}">${formatMoney(p.price)}</span>
        ${p.oldPrice ? `<span class="product-price old">${formatMoney(p.oldPrice)}</span>` : ""}
      </div>
      <div class="rating" style="margin-top:0.4rem"><span class="stars">${"★".repeat(Math.round(p.rating))}</span><span>${p.rating.toFixed(1)} &middot; ${stockLabel(p)}</span></div>
      <p class="quick-desc">${p.description}</p>
      <span class="size-label">Select size</span>
      <div class="size-row">
        ${SIZES.map((s) => `<button class="size-chip ${s === "XS" ? "selected" : ""}" data-size="${s}">${s}</button>`).join("")}
      </div>
      <div class="quick-actions">
        <button class="btn btn-dark" id="quickAdd" ${p.stock === 0 ? "disabled" : ""}>${p.stock === 0 ? "Sold Out" : "Add to Bag"}</button>
        <button class="btn btn-outline quick-cart-toggle">View Bag</button>
      </div>`;

    quickBody.querySelectorAll(".size-chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        quickBody.querySelectorAll(".size-chip").forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
        quickSize = chip.dataset.size;
      })
    );

    $("#quickAdd").addEventListener("click", () =>
      addToCart(quickProduct.id, quickSize)
    );
    quickBody.querySelector(".quick-cart-toggle").addEventListener("click", () => {
      closeQuickView();
      openCart();
    });

    quickOverlay.classList.add("show");
    quickOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeQuickView() {
    quickOverlay.classList.remove("show");
    quickOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function stockLabel(p) {
    if (p.stock === 0) return "Sold out";
    if (p.stock <= 5) return `Only ${p.stock} left`;
    return "In stock";
  }

  $("#quickClose").addEventListener("click", closeQuickView);
  quickOverlay.addEventListener("click", (e) => {
    if (e.target === quickOverlay) closeQuickView();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeQuickView();
  });

  /* ---------- Cart operations ---------- */
  function addToCart(id, size) {
    const product = PRODUCTS.find((p) => p.id === Number(id));
    if (!product) return;

    if (product.stock === 0) {
      showToast("Sorry, this piece is sold out");
      return;
    }

    const existing = cart.find(
      (i) => i.id === product.id && i.size === (size || null)
    );
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, MAX_QTY);
    } else {
      cart.push({ uid: Date.now().toString(36), id: product.id, qty: 1, size: size || null });
    }
    saveCart();
    showToast(`${product.name} added to your bag`);
  }

  const MAX_QTY = 10;

  function changeQty(uid, delta) {
    const item = cart.find((i) => i.uid === uid);
    if (!item) return;
    const next = item.qty + delta;
    if (next > MAX_QTY) {
      showToast(`Quantity is capped at ${MAX_QTY} per piece`);
      return;
    }
    item.qty = next;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.uid !== uid);
    }
    saveCart();
  }

  function removeFromCart(uid) {
    cart = cart.filter((i) => i.uid !== uid);
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
        const sizeLabel = item.size ? ` · Size ${item.size}` : "";
        return `
        <div class="cart-item" data-uid="${item.uid}">
          <div class="cart-item-media" style="${productBg(p)}"></div>
          <div class="cart-item-info">
            <h4>${p.name}</h4>
            <div class="meta">${p.category}${sizeLabel} · ${formatMoney(p.price)}</div>
            <div class="qty-control">
              <button data-dec="${item.uid}" aria-label="Decrease quantity">&minus;</button>
              <span>${item.qty}</span>
              <button data-inc="${item.uid}" aria-label="Increase quantity">&plus;</button>
            </div>
          </div>
          <div class="cart-item-side">
            <span class="cart-item-price">${formatMoney(p.price * item.qty)}</span>
            <button class="remove-btn" data-remove="${item.uid}">Remove</button>
          </div>
        </div>`;
      })
      .join("");
  }

  const PROMOS = {
    BALINDA10: 0.1,
    NEWSEASON: 0.15,
    FREESHIP: 0
  };
  let promo = null;

  function renderCartSummary() {
    const rawSubtotal = cart.reduce(
      (s, item) => s + item.qty * PRODUCTS.find((x) => x.id === item.id).price,
      0
    );
    const discount = promo ? rawSubtotal * promo.rate : 0;
    const subtotal = rawSubtotal - discount;

    $('[data-subtotal]').textContent = formatMoney(rawSubtotal);
    $("[data-total]").textContent = formatMoney(subtotal);
    $("#discountRow").hidden = !promo || discount <= 0;
    $("[data-discount]").textContent = `-${formatMoney(discount)}`;

    const FREE_SHIP = 100;
    const remaining = FREE_SHIP - subtotal;
    const fill = Math.min(100, (subtotal / FREE_SHIP) * 100);
    $("#shipFill").style.width = `${fill}%`;
    const shipMsg = $("#shipMsg");
    if (remaining <= 0) {
      shipMsg.textContent = "You've unlocked free shipping!";
      shipMsg.classList.add("free");
    } else {
      shipMsg.textContent = `Add ${formatMoney(remaining)} more for free shipping`;
      shipMsg.classList.remove("free");
    }
  }

  $("#promoApply").addEventListener("click", () => {
    const code = $("#promoInput").value.trim().toUpperCase();
    const status = $("#promoStatus");
    if (!code) {
      status.textContent = "Enter a code to apply.";
      status.className = "promo-status err";
      status.hidden = false;
      return;
    }
    if (PROMOS[code] !== undefined) {
      promo = { code, rate: PROMOS[code] };
      status.textContent = `Promo ${code} applied${PROMOS[code] ? ` — ${Math.round(PROMOS[code] * 100)}% off` : " — free shipping!"}`;
      status.className = "promo-status ok";
      status.hidden = false;
      renderCartSummary();
    } else {
      status.textContent = "That code isn't valid. Try BALINDA10.";
      status.className = "promo-status err";
      status.hidden = false;
    }
  });

  /* ---------- Cart events ---------- */
  productsGrid.addEventListener("click", (e) => {
    const wish = e.target.closest("[data-wish]");
    if (wish) {
      e.stopPropagation();
      toggleWishlist(wish.dataset.wish);
      return;
    }
    const btn = e.target.closest("[data-add]");
    if (btn) {
      addToCart(btn.dataset.add);
      return;
    }
    const card = e.target.closest(".product-card");
    if (card) openQuickView(card.dataset.id);
  });

  cartItems.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rem = e.target.closest("[data-remove]");
    if (inc) changeQty(inc.dataset.inc, 1);
    else if (dec) changeQty(dec.dataset.dec, -1);
    else if (rem) removeFromCart(rem.dataset.remove);
  });

  /* ---------- Checkout flow (demo) ---------- */
  const checkoutNote = $("#checkoutNote");
  const checkoutOverlay = $("#checkoutOverlay");
  const checkoutBody = $("#checkoutBody");
  const checkoutStepsEl = $("#checkoutSteps");
  const checkoutStepEls = () => $$("#checkoutSteps .step");
  let checkoutStep = 1;
  const checkoutData = {};
  const SHIP_COST = 8;

  function cartSubtotalRaw() {
    return cart.reduce(
      (s, item) => s + item.qty * PRODUCTS.find((x) => x.id === item.id).price,
      0
    );
  }
  function cartTotal() {
    const raw = cartSubtotalRaw();
    const discount = promo ? raw * promo.rate : 0;
    return raw - discount;
  }

  function renderCheckout() {
    checkoutBody.innerHTML = buildStep(checkoutStep);
    checkoutStepEls().forEach((el, i) =>
      el.classList.toggle("active", i + 1 === checkoutStep)
    );

    const next = $("#coNext");
    const back = $("#coBack");
    const submit = $("#coSubmit");
    if (next) next.addEventListener("click", (e) => {
      e.preventDefault();
      if (validateStep(checkoutStep)) checkoutStep += 1;
      renderCheckout();
    });
    if (back) back.addEventListener("click", () => {
      checkoutStep -= 1;
      renderCheckout();
    });
    if (submit) {
      submit.addEventListener("click", (e) => {
        e.preventDefault();
        if (!validateStep(checkoutStep)) return;
        checkoutStep = 3;
        renderCheckout();
      });
      const done = $("#coDone");
      if (done) done.addEventListener("click", finishCheckout);
    }
  }

  function buildStep(step) {
    if (step === 1) {
      return `
        <form novalidate>
          <div class="form-row">
            <div class="field full"><label for="coEmail">Email</label><input id="coEmail" type="email" placeholder="you@example.com" value="${checkoutData.email || ""}" /><span class="hint"></span></div>
            <div class="field"><label for="coName">Full name</label><input id="coName" placeholder="Jane Doe" value="${checkoutData.name || ""}" /><span class="hint"></span></div>
            <div class="field"><label for="coPhone">Phone</label><input id="coPhone" type="tel" placeholder="+1 555 000 0000" value="${checkoutData.phone || ""}" /><span class="hint"></span></div>
          </div>
          <div class="checkout-actions"><button class="btn btn-dark" id="coNext">Continue to Shipping</button></div>
        </form>`;
    }
    if (step === 2) {
      return `
        <form novalidate>
          <div class="form-row">
            <div class="field full"><label for="coAddr">Street address</label><input id="coAddr" placeholder="12 Fashion Avenue" value="${checkoutData.addr || ""}" /><span class="hint"></span></div>
            <div class="field"><label for="coCity">City</label><input id="coCity" placeholder="New York" value="${checkoutData.city || ""}" /><span class="hint"></span></div>
            <div class="field"><label for="coZip">Postcode</label><input id="coZip" placeholder="10001" value="${checkoutData.zip || ""}" /><span class="hint"></span></div>
          </div>
          <div class="checkout-actions">
            <button class="btn btn-outline" id="coBack">Back</button>
            <button class="btn btn-dark" id="coNext">Review Order</button>
          </div>
        </form>`;
    }
    return `
      <p class="hero-eyebrow">Almost there</p>
      <h2 style="font-family:var(--font-serif);font-size:1.6rem;line-height:1.2">Review your order</h2>
      <div class="review-list">
        ${cart.map((item) => {
          const p = PRODUCTS.find((x) => x.id === item.id);
          const sizeLabel = item.size ? ` (${item.size})` : "";
          return `<div class="review-line"><span>${p.name}${sizeLabel} × ${item.qty}</span><strong>${formatMoney(p.price * item.qty)}</strong></div>`;
        }).join("")}
        <div class="review-line"><span>Shipping</span><strong>${promo && promo.code === "FREESHIP" ? "Free" : formatMoney(SHIP_COST)}</strong></div>
        ${promo && promo.rate ? `<div class="review-line"><span>${promo.code} discount</span><strong>-${formatMoney((cartSubtotalRaw() * promo.rate))}</strong></div>` : ""}
        <div class="review-line" style="margin-top:0.5rem;padding-top:0.6rem;border-top:1px solid var(--line)"><span style="font-weight:700;color:var(--ink)">Total</span><strong>${formatMoney(cartTotal() + (promo && promo.code === "FREESHIP" ? 0 : SHIP_COST))}</strong></div>
      </div>
      <p style="margin-top:1rem;font-size:0.85rem;color:var(--muted)">Delivering to ${checkoutData.name || "your address"} — ${checkoutData.addr || "street address"}, ${checkoutData.city || "city"} ${checkoutData.zip || "postcode"}</p>
      <div class="checkout-actions">
        <button class="btn btn-outline" id="coBack">Back</button>
        <button class="btn btn-dark" id="coDone">Place Order — It's a Demo</button>
      </div>`;
  }

  function validateStep(step) {
    const required = {
      1: ["coEmail", "coName"],
      2: ["coAddr", "coCity", "coZip"]
    }[step] || [];
    let ok = true;
    required.forEach((id) => {
      const input = $(`#${id}`);
      const hint = input.parentElement.querySelector(".hint");
      const value = (input.value || "").trim();
      input.classList.remove("invalid");
      if (!value) {
        input.classList.add("invalid");
        hint.textContent = "This field is required.";
        ok = false;
      } else if (id === "coEmail" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        input.classList.add("invalid");
        hint.textContent = "Enter a valid email address.";
        ok = false;
      } else {
        hint.textContent = "";
      }
      checkoutData[{ coEmail: "email", coName: "name", coPhone: "phone", coAddr: "addr", coCity: "city", coZip: "zip" }[id]] = value;
    });
    return ok;
  }

  function openCheckout() {
    checkoutStep = 1;
    renderCheckout();
    checkoutOverlay.classList.add("show");
    checkoutOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeCheckout() {
    checkoutOverlay.classList.remove("show");
    checkoutOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function finishCheckout() {
    checkoutNote.textContent = "Demo order placed — thank you for shopping Balinda!";
    checkoutNote.hidden = false;
    cart = [];
    promo = null;
    saveCart();
    closeCheckout();
    closeCart();
    showToast("Order placed — demo complete!");
  }

  $("#checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your bag is empty");
      return;
    }
    openCheckout();
  });
  $("#checkoutClose").addEventListener("click", closeCheckout);
  checkoutOverlay.addEventListener("click", (e) => {
    if (e.target === checkoutOverlay) closeCheckout();
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

  const EMPTY_HEART =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21C7 16.5 3 13.2 3 9.3 3 6.4 5.2 4 8 4c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.8 0 5 2.4 5 5.3 0 3.9-4 7.2-9 11.7z"/></svg>';

  /* ---------- Wishlist ---------- */
  let wishlist = loadWishlist();
  function loadWishlist() {
    try {
      return JSON.parse(localStorage.getItem("balinda-wishlist")) || [];
    } catch {
      return [];
    }
  }
  function saveWishlist() {
    try {
      localStorage.setItem("balinda-wishlist", JSON.stringify(wishlist));
    } catch {
      /* storage unavailable */
    }
    updateWishlistUI();
  }
  function updateWishlistUI() {
    wishCount.textContent = wishlist.length;
    wishCount.classList.toggle("show", wishlist.length > 0);
  }
  function toggleWishlist(id) {
    const product = PRODUCTS.find((p) => p.id === Number(id));
    if (!product) return;
    const idx = wishlist.indexOf(Number(id));
    if (idx > -1) {
      wishlist.splice(idx, 1);
      showToast(`${product.name} removed from wishlist`);
    } else {
      wishlist.push(Number(id));
      showToast(`${product.name} added to wishlist ♥`);
    }
    saveWishlist();
    renderProducts();
  }

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

  /* ---------- Sale countdown ---------- */
  const SALE_KEY = "balinda-sale-end";
  function saleEnd() {
    try {
      const stored = Number(localStorage.getItem(SALE_KEY));
      if (stored && stored > Date.now()) return stored;
    } catch { /* storage unavailable */ }
    const end = Date.now() + 3 * 24 * 60 * 60 * 1000;
    try {
      localStorage.setItem(SALE_KEY, String(end));
    } catch { /* storage unavailable */ }
    return end;
  }
  const countdownEl = $("#countdown");
  function tickCountdown() {
    const diff = saleEnd() - Date.now();
    if (diff <= 0) {
      countdownEl.textContent = "00:00:00";
      return;
    }
    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    countdownEl.textContent = `${h}:${m}:${s}`;
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- Init ---------- */
  renderProducts();
  updateCartUI();
  updateWishlistUI();
  renderRecent();
})();