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

  // The Technology: interactive feature map
  (function () {
    var fig = document.getElementById("techFigure");
    var detail = document.getElementById("techDetail");
    if (!fig || !detail) return;

    var data = [
      { t: "Woven-in branding", d: "“Maverick” and the wing mark are knitted into the yarn, not printed on top — so they never crack, peel or wash out." },
      { t: "Signature wing motif", d: "The repeating wing runs down the leg and scales up the sock — instantly recognisable on the pitch." },
      { t: "Breathable mid-foot knit", d: "Open mesh channels through the arch move sweat out and drop the temperature, so feet stay dry and blister-free." },
      { t: "Grip pads, inside & out", d: "Double-stitched silicone ‘M’ pads on both faces of the sock — your foot locks to the sock, the sock locks to the boot." },
      { t: "Cushioned thick heel", d: "A denser, padded heel soaks up impact and stops the sock slipping down through 90 minutes and extra time." },
      { t: "Reinforced toe & left/right fit", d: "Extra-dense knit at the toe takes the abuse, and each sock is shaped and marked L or R for a true anatomical fit." }
    ];
    var targets = fig.querySelectorAll("[data-i]");

    var select = function (i) {
      var f = data[i];
      if (!f) return;
      detail.innerHTML =
        '<span class="d-tag">' + (Number(i) + 1) + " / " + data.length + "</span>" +
        "<h3>" + f.t + "</h3><p>" + f.d + "</p>";
      targets.forEach(function (el) {
        el.classList.toggle("is-active", el.getAttribute("data-i") === String(i));
      });
    };

    targets.forEach(function (el) {
      var i = el.getAttribute("data-i");
      el.addEventListener("click", function () { select(i); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i); }
      });
    });
    select(0);
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
