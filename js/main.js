(function () {
  "use strict";

  // Current year in the footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Hero slideshow
  (function () {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = hero.querySelectorAll(".hero-bg");
    var dots = hero.querySelectorAll(".hero-dots button");
    if (slides.length < 2) return;
    var i = 0;
    var go = function (n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
    };
    dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); restart(); }); });
    var timer;
    var restart = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () { go(i + 1); }, 5500);
    };
    restart();
  })();

  // Product carousel: arrows + progress bar
  document.querySelectorAll("[data-carousel]").forEach(function (wrap) {
    var track = wrap.querySelector(".carousel-track");
    var section = wrap.closest("section") || document;
    var bar = section.querySelector("[data-carousel-bar]");
    var arrows = section.querySelectorAll(".c-arrow");
    if (!track) return;

    var step = function () {
      var first = track.firstElementChild;
      return first ? first.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
    };
    var update = function () {
      var max = track.scrollWidth - track.clientWidth;
      var overflow = max > 8;
      if (bar) bar.parentElement.hidden = !overflow;
      var ctrl = section.querySelector(".carousel-ctrl");
      if (ctrl) ctrl.hidden = !overflow;
      var ratio = max > 2 ? track.scrollLeft / max : 0;
      if (bar) {
        var vis = Math.max(0.12, track.clientWidth / track.scrollWidth);
        bar.style.width = vis * 100 + "%";
        bar.style.transform = "translateX(" + ratio * (100 / vis - 100) + "%)";
      }
      arrows.forEach(function (a) {
        var dir = Number(a.getAttribute("data-dir"));
        a.disabled = (dir < 0 && track.scrollLeft < 4) || (dir > 0 && track.scrollLeft >= max - 4);
      });
    };
    arrows.forEach(function (a) {
      a.addEventListener("click", function () {
        track.scrollBy({ left: Number(a.getAttribute("data-dir")) * step(), behavior: "smooth" });
      });
    });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

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

  // Guard: Snipcart's own loader snippet in index.html injects the cart. This only
  // stops "Add to cart" from silently doing nothing if no real key is configured.
  var key = (window.SnipcartSettings || {}).publicApiKey || "";
  var configured = key.indexOf("YOUR_") !== 0 && key.length > 20;

  if (!configured) {
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
