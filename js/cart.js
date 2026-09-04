/* Maverick Socks cart.
 *
 * Self-contained basket: state in localStorage, drawer UI built here. Product data
 * is read straight off the [data-add-to-cart] buttons' data-item-* attributes, so
 * index.html stays the single source of truth for names, prices and images.
 *
 * Payments are not wired up yet — set CHECKOUT_ENABLED and point handoff() at a
 * provider once one is connected.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "maverick-cart-v1";
  var FREE_SHIPPING_OVER = 30;
  var CHECKOUT_ENABLED = false;

  /* ---------- state ---------- */

  var items = [];

  function valid(i) {
    return i && typeof i.id === "string" && typeof i.price === "number" && i.qty > 0;
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      items = Array.isArray(parsed) ? parsed.filter(valid) : [];
    } catch (e) {
      items = [];
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      /* private mode or storage disabled — the cart just won't persist */
    }
  }

  function find(id) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  function count() {
    return items.reduce(function (n, i) { return n + i.qty; }, 0);
  }

  function subtotal() {
    return items.reduce(function (n, i) { return n + i.price * i.qty; }, 0);
  }

  function add(product) {
    var existing = find(product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, existing.max || 10);
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        max: product.max || 10,
        qty: 1
      });
    }
    save();
    render();
  }

  function setQty(id, qty) {
    var item = find(id);
    if (!item) return;
    if (qty <= 0) { remove(id); return; }
    item.qty = Math.min(qty, item.max || 10);
    save();
    render();
  }

  function remove(id) {
    items = items.filter(function (i) { return i.id !== id; });
    save();
    render();
  }

  /* ---------- helpers ---------- */

  function money(n) {
    return "£" + n.toFixed(2);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- drawer ---------- */

  var overlay, drawer, bodyEl, footEl, lastFocus;

  function build() {
    overlay = document.createElement("div");
    overlay.className = "cart-overlay";
    overlay.hidden = true;
    overlay.setAttribute("data-cart-overlay", "");

    drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.hidden = true;
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Your cart");
    drawer.innerHTML =
      '<div class="cart-drawer__head">' +
      "<h2>Your cart</h2>" +
      '<button type="button" class="cart-drawer__close" data-cart-close aria-label="Close cart">&times;</button>' +
      "</div>" +
      '<div class="cart-drawer__body" data-cart-body></div>' +
      '<div class="cart-drawer__foot" data-cart-foot></div>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    bodyEl = drawer.querySelector("[data-cart-body]");
    footEl = drawer.querySelector("[data-cart-foot]");
  }

  function isOpen() {
    return drawer && !drawer.hidden;
  }

  function open() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    drawer.hidden = false;
    document.body.classList.add("cart-open");
    window.requestAnimationFrame(function () {
      overlay.classList.add("is-open");
      drawer.classList.add("is-open");
    });
    var closeBtn = drawer.querySelector("[data-cart-close]");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
    document.body.classList.remove("cart-open");
    window.setTimeout(function () {
      overlay.hidden = true;
      drawer.hidden = true;
    }, 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- render ---------- */

  function render() {
    var badges = document.querySelectorAll("[data-cart-count]");
    var n = count();
    for (var b = 0; b < badges.length; b++) badges[b].textContent = String(n);

    if (!bodyEl) return;

    if (!items.length) {
      bodyEl.innerHTML =
        '<div class="cart-empty">' +
        "<p>Your cart is empty.</p>" +
        '<button type="button" class="btn btn--dark" data-cart-close>Browse the range</button>' +
        "</div>";
      footEl.innerHTML = "";
      return;
    }

    bodyEl.innerHTML = items.map(function (i) {
      var atMax = i.qty >= (i.max || 10);
      return '<div class="cart-line">' +
        '<div class="cart-line__media"><img src="' + esc(i.image) + '" alt="" /></div>' +
        '<div class="cart-line__info">' +
        '<p class="cart-line__name">' + esc(i.name) + "</p>" +
        '<p class="cart-line__unit">' + money(i.price) + " each</p>" +
        '<div class="qty">' +
        '<button type="button" data-qty-dec="' + esc(i.id) + '" aria-label="Decrease quantity">&minus;</button>' +
        '<span class="qty__n">' + i.qty + "</span>" +
        '<button type="button" data-qty-inc="' + esc(i.id) + '" aria-label="Increase quantity"' +
        (atMax ? " disabled" : "") + ">+</button>" +
        '<button type="button" class="cart-line__remove" data-remove="' + esc(i.id) + '">Remove</button>' +
        "</div>" +
        "</div>" +
        '<div class="cart-line__total">' + money(i.price * i.qty) + "</div>" +
        "</div>";
    }).join("");

    var sub = subtotal();
    var shortfall = FREE_SHIPPING_OVER - sub;
    var shipMsg = shortfall > 0
      ? "You&rsquo;re " + money(shortfall) + " away from free UK delivery."
      : "Free UK delivery unlocked.";
    var pct = Math.max(0, Math.min(100, (sub / FREE_SHIPPING_OVER) * 100));

    footEl.innerHTML =
      '<div class="cart-ship">' +
      "<p>" + shipMsg + "</p>" +
      '<div class="cart-ship__bar"><span style="width:' + pct.toFixed(1) + '%"></span></div>' +
      "</div>" +
      '<div class="cart-sub"><span>Subtotal</span><strong>' + money(sub) + "</strong></div>" +
      '<button type="button" class="btn btn--dark cart-checkout" data-checkout>Checkout</button>' +
      '<p class="cart-note" data-checkout-note hidden></p>';
  }

  function handoff() {
    /* Point this at a payment provider (Stripe Checkout, Snipcart, ...). */
    var note = drawer.querySelector("[data-checkout-note]");
    if (!note) return;
    note.innerHTML =
      "<strong>Payments aren&rsquo;t connected yet.</strong> Your cart is saved &mdash; " +
      "checkout goes live as soon as a payment provider is set up.";
    note.hidden = false;
  }

  /* ---------- wiring ---------- */

  function productFrom(btn) {
    var price = parseFloat(btn.getAttribute("data-item-price"));
    if (!btn.getAttribute("data-item-id") || isNaN(price)) return null;
    return {
      id: btn.getAttribute("data-item-id"),
      name: btn.getAttribute("data-item-name") || "Item",
      price: price,
      image: btn.getAttribute("data-item-image") || "",
      max: parseInt(btn.getAttribute("data-item-max-quantity"), 10) || 10
    };
  }

  function init() {
    build();
    load();
    render();

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      var addBtn = t.closest("[data-add-to-cart]");
      if (addBtn) {
        e.preventDefault();
        var product = productFrom(addBtn);
        if (product) { add(product); open(); }
        return;
      }

      if (t.closest("[data-cart-open]")) { e.preventDefault(); open(); return; }
      if (t.closest("[data-cart-close]") || t.closest("[data-cart-overlay]")) { close(); return; }
      if (t.closest("[data-checkout]")) { handoff(); return; }

      var dec = t.closest("[data-qty-dec]");
      if (dec) {
        var di = find(dec.getAttribute("data-qty-dec"));
        if (di) setQty(di.id, di.qty - 1);
        return;
      }

      var inc = t.closest("[data-qty-inc]");
      if (inc) {
        var ii = find(inc.getAttribute("data-qty-inc"));
        if (ii) setQty(ii.id, ii.qty + 1);
        return;
      }

      var rm = t.closest("[data-remove]");
      if (rm) { remove(rm.getAttribute("data-remove")); }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    /* Small API for future payment wiring and debugging. */
    window.MaverickCart = {
      items: function () { return items.slice(); },
      count: count,
      subtotal: subtotal,
      add: add,
      remove: remove,
      setQty: setQty,
      clear: function () { items = []; save(); render(); },
      open: open,
      close: close,
      checkoutEnabled: CHECKOUT_ENABLED
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
