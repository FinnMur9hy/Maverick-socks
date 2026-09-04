# Maverick Socks

Storefront for **Maverick Socks** — sports performance grip socks.

Static site (HTML / CSS / vanilla JS) with a self-contained cart. No build step,
no framework, no dependencies.

```
.
├── index.html          # the whole storefront (one page, products included)
├── products.json       # server-side price list (what customers are charged)
├── success.html        # post-payment confirmation
├── netlify/functions/  # Stripe Checkout session creator
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

The basket is our own code — [`js/cart.js`](js/cart.js). State lives in
`localStorage`, the drawer is rendered here, and products are read from the
`data-item-*` attributes on the `[data-add-to-cart]` buttons in `index.html`.

Checkout goes through **Stripe Checkout**, via a Netlify function at
[`netlify/functions/create-checkout-session.mjs`](netlify/functions/create-checkout-session.mjs).
No npm dependencies — it calls Stripe's REST API with `fetch`.

### How prices are protected

The browser sends **only product IDs and quantities**. The function looks up prices
in [`products.json`](products.json) and builds the Stripe line items from those. If
it trusted prices from the page, anyone could edit them in devtools and buy a
3-pack for a penny.

The trade-off is that a price lives in **three** places, and nothing syncs them:

| Where | What it does |
|---|---|
| `products.json` (pence) | what the customer is actually charged |
| `data-item-price` in `index.html` | what the cart drawer totals up |
| `.product-price` in `index.html` | what the customer reads |

Change all three together.

### Switching it on

1. Create a Stripe account and complete business verification.
2. In Netlify: **Site configuration → Environment variables**, add
   `STRIPE_SECRET_KEY` (`sk_test_…` to trial it, `sk_live_…` for real money).
   It belongs there and **never in this repo**.
3. In `js/cart.js`, set `CHECKOUT_ENABLED = true`. That one switch turns on the
   real checkout and hides the "checkout isn't connected" note on the page.
4. Test with card `4242 4242 4242 4242`, any future expiry, any CVC.

Card payments work as soon as the key is set. **PayPal, Apple Pay and Google Pay**
are then just toggles in **Stripe Dashboard → Settings → Payment methods** — the
function deliberately omits `payment_method_types`, so whatever is enabled there
shows up at checkout with no code change.

Shipping rates live in `products.json` under `shipping` (free over £30, otherwise
£3.95 — change `standardPence` if that is wrong). After paying, customers land on
`success.html`, which clears their basket.

> A previous version used Snipcart. It was dropped after its `/api/cart` endpoint
> returned persistent HTTP 500s for this store. It is recoverable from git history.

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
