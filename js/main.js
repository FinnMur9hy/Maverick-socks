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

  // The Technology: annotated sock diagram.
  // Boxes sit either side of the photo on desktop and stack beneath it on mobile.
  // x/y are percentages of the photo, so the pins track it at any size.
  (function () {
    var radial = document.getElementById("radial");
    var pinLayer = document.getElementById("pinLayer");
    var wires = document.getElementById("radialWires");
    if (!radial || !pinLayer || !wires) return;

    var FEATURES = [
      { n: 1, t: "Durability",          d: "High quality materials used to increase the longevity of the sock’s performance, wash after wash.", x: 48, y: 30, side: "l", row: 1 },
      { n: 2, t: "Anatomy",             d: "A specialised sock shaped and marked for each individual foot — left and right specific.",            x: 17, y: 91, side: "l", row: 2 },
      { n: 3, t: "Blister protection",  d: "Thicker sole and reinforced toe to prevent blisters and increase comfort where you land.",                 x: 29, y: 89, side: "l", row: 3 },
      { n: 4, t: "Mesh air channels",   d: "Breathable mesh through the mid-foot reduces moisture and increases comfort for the full match.",           x: 55, y: 60, side: "r", row: 1 },
      { n: 5, t: "Grip inside and out", d: "Frequent grip contact points on both sides of the sock to increase traction — your foot locks to the sock, the sock locks to the boot.", x: 72, y: 79, side: "r", row: 2 },
      { n: 6, t: "High quality grips",  d: "Strong grips that provide better traction as you wear them in and your feet warm up.",                      x: 74, y: 70, side: "r", row: 3 }
    ];

    var NS = "http://www.w3.org/2000/svg";
    var STACKED = 980;
    var active = 0;

    FEATURES.forEach(function (f, i) {
      var slot = document.createElement("div");
      slot.className = f.side === "l" ? "r-left" : "r-right";
      slot.style.gridRow = String(f.row);

      var box = document.createElement("button");
      box.type = "button";
      box.className = "fbox";
      box.setAttribute("aria-expanded", i === 0 ? "true" : "false");
      box.innerHTML =
        '<span class="fbox-head"><span class="fbox-n">' + f.n + "</span>" +
        '<span class="fbox-t">' + f.t + "</span></span>" +
        '<span class="fbox-d">' + f.d + "</span>";
      box.addEventListener("click", function () { select(i); });
      slot.appendChild(box);
      radial.appendChild(slot);

      var pin = document.createElement("button");
      pin.type = "button";
      pin.className = "pin";
      pin.style.left = f.x + "%";
      pin.style.top = f.y + "%";
      pin.setAttribute("aria-expanded", i === 0 ? "true" : "false");
      pin.setAttribute("aria-label", f.t);
      pin.textContent = String(f.n);
      pin.addEventListener("click", function () {
        select(i);
        // Stacked, the box is a long way below the pin, so a tap would otherwise
        // look like nothing happened.
        if (window.innerWidth <= STACKED) bringIntoView(boxes()[i]);
      });
      pinLayer.appendChild(pin);
    });

    function boxes() { return radial.querySelectorAll(".fbox"); }

    function bringIntoView(el) {
      var header = document.getElementById("siteHeader");
      var offset = (header ? header.offsetHeight : 0) + 20;
      var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }

    function select(i) {
      active = i;
      var bs = boxes();
      for (var k = 0; k < bs.length; k++) {
        bs[k].setAttribute("aria-expanded", k === i ? "true" : "false");
        pinLayer.children[k].setAttribute("aria-expanded", k === i ? "true" : "false");
      }
      drawWires();
    }

    function drawWires() {
      wires.innerHTML = "";
      if (window.innerWidth <= STACKED) return;

      var base = radial.getBoundingClientRect();
      var bs = boxes();

      FEATURES.forEach(function (f, i) {
        var br = bs[i].getBoundingClientRect();
        var pr = pinLayer.children[i].getBoundingClientRect();

        var bx = (f.side === "l" ? br.right : br.left) - base.left;
        var by = br.top + br.height / 2 - base.top;
        var px = pr.left + pr.width / 2 - base.left;
        var py = pr.top + pr.height / 2 - base.top;
        var elbow = bx + (f.side === "l" ? 16 : -16);
        var on = i === active;

        var path = document.createElementNS(NS, "path");
        path.setAttribute("d", "M" + bx + "," + by + " L" + elbow + "," + by + " L" + px + "," + py);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", on ? "#12b5a5" : "#dcdcda");
        path.setAttribute("stroke-width", on ? "1.5" : "1");
        wires.appendChild(path);

        var dot = document.createElementNS(NS, "circle");
        dot.setAttribute("cx", bx);
        dot.setAttribute("cy", by);
        dot.setAttribute("r", on ? "3" : "2.5");
        dot.setAttribute("fill", on ? "#12b5a5" : "#dcdcda");
        wires.appendChild(dot);
      });
    }

    var raf;
    window.addEventListener("resize", function () {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(drawWires);
    });
    // The photo drives the pin and wire geometry, so wait for it to lay out.
    var photo = radial.querySelector(".radial-stage img");
    if (photo && !photo.complete) photo.addEventListener("load", drawWires);
    drawWires();
  })();

})();
