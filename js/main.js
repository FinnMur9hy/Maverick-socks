(function () {
  "use strict";

  // Current year in the footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Solidify header on scroll
  var header = document.getElementById("siteHeader");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile navigation
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (toggle && mobileNav) {
    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      mobileNav.hidden = !open;
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", function () {
      setNav(mobileNav.hidden);
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setNav(false);
    });
  }

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Guard: if Snipcart has not been configured with a real API key,
  // stop the add-to-cart buttons from silently doing nothing.
  var mount = document.getElementById("snipcart");
  var key = mount ? mount.getAttribute("data-api-key") : "";
  var configured = key && key.indexOf("YOUR_") !== 0 && key.length > 20;

  if (configured) {
    var SNIPCART_VERSION = "3.7.1";
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdn.snipcart.com/themes/v" + SNIPCART_VERSION + "/default/snipcart.css";
    document.head.appendChild(css);

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://cdn.snipcart.com/themes/v" + SNIPCART_VERSION + "/default/snipcart.js";
    document.body.appendChild(script);
  } else {
    var note = document.getElementById("storeNote");
    if (note) note.hidden = false;

    document.addEventListener(
      "click",
      function (e) {
        var btn = e.target.closest(".snipcart-add-item, .snipcart-checkout");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        showToast("Checkout isn’t connected yet — add your Snipcart API key (see README).");
      },
      true
    );
  }

  var toastEl;
  var toastTimer;
  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 3200);
  }
})();
