# Maverick Socks

Storefront for **Maverick Socks** — sports performance grip socks.

Static site (HTML / CSS / vanilla JS) with a self-contained cart. No build step,
no framework, no dependencies.

```
.
├── index.html          # the whole storefront (one page, products included)
├── css/styles.css
├── js/
│   ├── cart.js         # basket state + drawer UI
│   └── main.js         # nav, hero, carousel, smooth scroll
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

## Cart & checkout

The basket is our own code — [`js/cart.js`](js/cart.js). It holds state in
`localStorage`, renders the slide-in drawer, and reads every product straight off
the `data-item-*` attributes on the `[data-add-to-cart]` buttons in `index.html`.
No third-party cart service is involved, so nothing external can take the cart
down.

**Payments are not connected yet.** `CHECKOUT_ENABLED` at the top of `cart.js` is
`false`, and the Checkout button explains that instead of pretending to charge.
To go live you need a payment provider — wire it into the `handoff()` function in
the same file and flip the flag.

Editing the catalogue: product IDs, names and prices live on the buttons in
[`index.html`](index.html). When you change a price, change it in **both** the
button's `data-item-price` (what the cart charges) and the visible
`.product-price` next to it (what the customer reads) — nothing keeps them in
sync for you.

The cards are deliberately **plain static markup** rather than JavaScript-injected.
Hosted checkouts validate orders by fetching the product URL and scanning the
returned HTML, so keeping them static leaves that door open.

> A previous version of this site used Snipcart. It was removed after its
> `/api/cart` endpoint returned persistent HTTP 500s for this store. The
> integration is recoverable from git history if you ever want it back.

## Images

All photography lives in `assets/`. To change one, replace the file keeping the
same name (or update the path in `index.html`):

| File | Where it shows |
|---|---|
| `hero-1.jpg` / `hero-2.jpg` | homepage hero slideshow (crossfades every ~5.5s) |
| `product-white.jpg` / `product-black.jpg` / `product-3pack.jpg` | catalogue cards (square, 1200×1200) |
| `story.jpg` | Our Story / Explore sections |
| `logo-black.png` / `logo-white.png` | header / footer logo (black lockup live) |
| `favicon.png` | browser tab icon |

Keep hero/section images ~2000px wide and under ~300 KB.

## Forms (Netlify Forms)

The **Contact** and **newsletter** forms use [Netlify Forms](https://docs.netlify.com/forms/setup/).
Nothing to configure in the code — once the site is deployed on Netlify, Netlify
detects the two forms (`name="contact"` and `name="newsletter"`) at build time and
captures every submission. On success the visitor lands on `thanks.html`.

In the Netlify dashboard: **Forms** → pick a form → **Settings & notifications**
→ add an email notification so submissions reach your inbox. Each form has a
hidden honeypot (`bot-field`) for basic spam protection; enable reCAPTCHA there
too if you get spam.

If you host somewhere other than Netlify, these forms won't work — swap the
`action`/attributes for a service like Formspree, or remove the blocks.

Also update the `hello@mavericksocks.com` address in `index.html` (contact
section + footer).

## Deploy

**Netlify (recommended — free form handling):**
1. Sign up at <https://netlify.com>, **Add new site → Import an existing project → GitHub**, pick `maverick-socks`.
2. Build command: *(none)* · Publish directory: `.` — click **Deploy**. `netlify.toml` already sets this.
3. Every push to `main` redeploys automatically.
4. **Domain settings → Add a custom domain**, then follow the DNS steps at your registrar.

Also works on GitHub Pages, Vercel or Cloudflare Pages (static, no build, no env
vars) — but the forms above are Netlify-specific.

## Licence

Code is MIT (see `LICENSE`). The Maverick Socks name, logo and product
photography are not covered by that licence.
