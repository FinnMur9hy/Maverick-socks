/* Creates a Stripe Checkout Session and hands the browser a URL to redirect to.
 *
 * Security note, and the reason this file exists at all: the browser sends only
 * product IDs and quantities. Prices come from products.json on the server. If we
 * trusted prices from the client, anyone could edit them in devtools and buy a
 * 3-pack for 1p.
 *
 * No npm dependencies — this talks to Stripe's REST API with fetch, so the repo
 * stays build-free.
 *
 * Required environment variable (set in Netlify, never in this repo):
 *   STRIPE_SECRET_KEY   sk_test_... while testing, sk_live_... when live
 */

import catalogue from "../../products.json" with { type: "json" };

const STRIPE_API = "https://api.stripe.com/v1/checkout/sessions";

/* Stripe wants form-encoded bodies with bracket notation:
   line_items[0][price_data][currency]=gbp
   This flattens a nested object/array into exactly that. */
function formEncode(value, prefix, out) {
  out = out || [];
  if (value === null || value === undefined) return out;

  if (Array.isArray(value)) {
    value.forEach(function (v, i) { formEncode(v, prefix + "[" + i + "]", out); });
  } else if (typeof value === "object") {
    Object.keys(value).forEach(function (k) {
      formEncode(value[k], prefix ? prefix + "[" + k + "]" : k, out);
    });
  } else {
    out.push(encodeURIComponent(prefix) + "=" + encodeURIComponent(String(value)));
  }
  return out;
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "Content-Type": "application/json" }
  });
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    console.error("STRIPE_SECRET_KEY is not set");
    return json({ error: "Checkout is not configured yet." }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ error: "Invalid request body." }, 400);
  }

  const requested = Array.isArray(payload && payload.items) ? payload.items : [];
  if (!requested.length) {
    return json({ error: "Your cart is empty." }, 400);
  }

  /* Build line items from OUR prices, not theirs. */
  const maxQty = catalogue.maxQuantityPerItem || 10;
  const lineItems = [];
  let subtotal = 0;

  for (const entry of requested) {
    const product = catalogue.products[entry && entry.id];
    if (!product) {
      return json({ error: "Unknown product: " + (entry && entry.id) }, 400);
    }

    const qty = Math.floor(Number(entry.qty));
    if (!Number.isFinite(qty) || qty < 1) {
      return json({ error: "Invalid quantity for " + product.name }, 400);
    }
    const quantity = Math.min(qty, maxQty);

    subtotal += product.price * quantity;
    lineItems.push({
      quantity: quantity,
      price_data: {
        currency: catalogue.currency,
        unit_amount: product.price,
        product_data: { name: product.name, images: [product.image] }
      }
    });
  }

  /* Free delivery over the threshold, otherwise the standard rate. */
  const ship = catalogue.shipping;
  const shippingFree = subtotal >= ship.freeOverPence;
  const shippingRate = {
    shipping_rate_data: {
      type: "fixed_amount",
      display_name: shippingFree ? ship.freeLabel : ship.standardLabel,
      fixed_amount: {
        amount: shippingFree ? 0 : ship.standardPence,
        currency: catalogue.currency
      }
    }
  };

  const origin = new URL(request.url).origin;

  const params = {
    mode: "payment",
    line_items: lineItems,
    shipping_options: [shippingRate],
    shipping_address_collection: { allowed_countries: ["GB"] },
    billing_address_collection: "auto",
    phone_number_collection: { enabled: false },
    success_url: origin + "/success.html?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: origin + "/#range"
    /* payment_method_types is deliberately omitted so Stripe uses the methods
       enabled in the dashboard — that is what lets PayPal, Apple Pay and Google
       Pay appear without a code change here. */
  };

  const body = formEncode(params, "").join("&");

  let stripeRes, data;
  try {
    stripeRes = await fetch(STRIPE_API, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secret,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body
    });
    data = await stripeRes.json();
  } catch (e) {
    console.error("Stripe request failed:", e);
    return json({ error: "Could not reach the payment provider." }, 502);
  }

  if (!stripeRes.ok) {
    console.error("Stripe error:", stripeRes.status, data);
    return json({ error: (data && data.error && data.error.message) || "Payment provider rejected the request." }, 502);
  }

  return json({ url: data.url });
}

export const config = { path: "/api/create-checkout-session" };
