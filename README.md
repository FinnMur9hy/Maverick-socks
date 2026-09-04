# Maverick Socks

Storefront for **Maverick Socks** — sports performance grip socks.

Static site (HTML / CSS / vanilla JS) with a [Snipcart](https://snipcart.com) cart
and checkout. No build step, no framework.

```
.
├── index.html          # the whole storefront (one page, products included)
├── css/styles.css
├── js/main.js          # nav, hero, carousel, cart guard, toast
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
5. Snipcart validates every order by fetching `data-item-url` (`/`) and scanning
   the returned HTML for an element with the `snipcart-add-item` class and a
   matching `data-item-id`. The product cards are therefore **plain static
   markup** in `index.html` — if you ever move them into JavaScript, Snipcart
   will see an empty page and reject checkouts.

Product IDs, names and prices live in the `.snipcart-add-item` buttons in
[`index.html`](index.html). When you change a price, change it in **both** the
button's `data-item-price` (what Snipcart charges and validates against) and the
visible `.product-price` next to it (what the customer reads) — nothing keeps
them in sync for you.

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
