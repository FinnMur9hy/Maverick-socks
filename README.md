# Maverick Socks

Storefront for **Maverick Socks** — sports performance grip socks.

Static site (HTML / CSS / vanilla JS) with a [Snipcart](https://snipcart.com) cart
and checkout. No build step, no framework.

```
.
├── index.html          # the whole storefront (one page)
├── css/styles.css
├── js/
│   ├── products.js     # product catalogue + card rendering
│   └── main.js         # nav, scroll header, cart guard, toast
└── assets/             # logos + product photography
```

## Run it locally

Open `index.html` in a browser to see the layout, or serve the folder so the
cart scripts run against a real origin:

```bash
# any static server works, e.g. one of:
npx serve .
python -m http.server 8000
```

Then visit the printed URL.

## Connect checkout (Snipcart)

The cart is wired up but **inactive until you add an API key**. Until then the
"Add to cart" buttons show a reminder toast instead of doing nothing.

1. Create a free account at <https://app.snipcart.com>.
2. In **Account → API keys**, copy the **Public API key**.
3. In `index.html`, replace `YOUR_SNIPCART_PUBLIC_API_KEY` in the
   `<div id="snipcart" ...>` near the bottom of the file.
4. In the Snipcart dashboard:
   - set your store **currency** to GBP (or change `data-currency` in `index.html`),
   - add your deployed domain (and `localhost`) under **Domains & URLs**,
   - connect a payment gateway (Stripe, etc.),
   - configure shipping and tax.
5. Snipcart validates each product by crawling `data-item-url` (`/`). Keep the
   product markup on the homepage, or set validation to a dedicated URL.

Product IDs, names and prices live in [`js/products.js`](js/products.js) — edit
there, then make sure they match anything you define in the Snipcart dashboard.

> Prices and product photos in this repo are placeholders. Swap the numbers in
> `products.js` for your live catalogue.

## Images

All photography lives in `assets/`. To change one, replace the file keeping the
same name (or update the path in `index.html` / `products.js`):

| File | Where it shows |
|---|---|
| `hero.jpg` | full-bleed homepage hero (swap for the pitch/lifestyle shot) |
| `product-white.jpg` / `product-black.jpg` / `product-3pack.jpg` | shop cards |
| `story.jpg` | Our Story section |
| `logo-mark-black.png` / `logo-mark-white.png` | header / footer logo |
| `favicon.png` | browser tab icon |

Keep hero/section images ~2000px wide and under ~300 KB.

## Contact form

The **Contact Us** form posts to a placeholder Formspree endpoint
(`action="https://formspree.io/f/your-form-id"` in `index.html`). Create a form
at <https://formspree.io> (or your provider of choice) and drop in the real URL,
or remove the `<section id="contact">` block. Also update the
`hello@mavericksocks.com` address in `index.html` (contact section + footer).

## Deploy

Any static host works — drop the folder into Netlify, Vercel, Cloudflare Pages
or GitHub Pages. No environment variables needed; Snipcart runs client-side.

## Licence

Code is MIT (see `LICENSE`). The Maverick Socks name, logo and product
photography are not covered by that licence.
