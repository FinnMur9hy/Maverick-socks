/* Product catalogue for Maverick Socks.
 * Prices are in GBP. Update these, then set the matching values in your
 * Snipcart dashboard (or let Snipcart crawl this page — data-item-url below).
 */
window.MAVERICK_PRODUCTS = [
  {
    id: "mav-grip-white",
    name: "Maverick Grip Socks — White",
    price: 12.99,
    image: "assets/product-white.jpg?v=2",
    alt: "White Maverick grip socks with packaging and the grip sole",
    blurb: "The original. White with the black wing motif and a full-contact grip sole.",
    badge: "Bestseller"
  },
  {
    id: "mav-grip-black",
    name: "Maverick Grip Socks — Black",
    price: 12.99,
    image: "assets/product-black.jpg?v=2",
    alt: "Black Maverick grip socks with packaging and the grip sole",
    blurb: "Same grip, blacked out. Woven logo cuff and silicone grips inside and out.",
    badge: ""
  },
  {
    id: "mav-grip-3pack",
    name: "Maverick Grip Socks — 3-Pack",
    price: 34.99,
    image: "assets/product-3pack.jpg?v=2",
    alt: "Three pairs of Maverick grip socks with packaging",
    blurb: "Three pairs of your choosing so there's always a clean set in the kit bag. Save £3.98.",
    badge: "Best value"
  }
];

(function renderProducts() {
  var track = document.getElementById("productTrack");
  if (!track) return;
  var money = function (n) { return "£" + n.toFixed(2); };

  window.MAVERICK_PRODUCTS.forEach(function (p) {
    var card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML =
      '<div class="product-media">' +
      (p.badge ? '<span class="product-badge">' + p.badge + "</span>" : "") +
      '<img src="' + p.image + '" alt="' + p.alt + '" loading="lazy" width="600" height="600" />' +
      "</div>" +
      '<div class="product-body">' +
      "<h3>" + p.name + "</h3>" +
      '<p class="product-blurb">' + p.blurb + "</p>" +
      '<div class="product-foot">' +
      '<span class="product-price">' + money(p.price) + "</span>" +
      '<button type="button" class="btn btn--dark buy-btn snipcart-add-item"' +
      ' data-item-id="' + p.id + '"' +
      ' data-item-name="' + p.name + '"' +
      ' data-item-price="' + p.price.toFixed(2) + '"' +
      ' data-item-url="/"' +
      ' data-item-description="' + p.blurb + '"' +
      ' data-item-image="' + p.image + '"' +
      ' data-item-max-quantity="10"' +
      ">Add to cart</button>" +
      "</div></div>";
    track.appendChild(card);
  });
})();
