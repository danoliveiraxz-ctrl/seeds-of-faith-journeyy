import { createClient } from "npm:@supabase/supabase-js@2";

const endpoint = "https://app.sigilopay.com.br/api/v1/gateway/checkout";
const productImageUrl = "https://mknjyqsgxricieugaftg.supabase.co/storage/v1/object/public/assets/kpop-product.png";
const dates: Record<string, string> = { "28": "2026-10-28", "31": "2026-10-31" };

async function requestActorHash(req: Request): Promise<string> {
  // Hash only the request source used for throttling; do not persist or log its raw value.
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const source = forwarded || "missing-ip";
  const bytes = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  const origin = Deno.env.get("CHECKOUT_ORIGIN");
  const headers: Record<string, string> = { "Cache-Control": "no-store", "Vary": "Origin" };
  if (origin && req.headers.get("Origin") === origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "content-type";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  }
  const send = (body: unknown, status = 200) => Response.json(body, { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return send({ error: "Method not allowed" }, 405);
  if (!origin || req.headers.get("Origin") !== origin) return send({ error: "Origin not allowed" }, 403);

  // Sigilo Pay requires both API credentials and they must never reach the browser.
  const publicKey = Deno.env.get("SIGILOPAY_PUBLIC_KEY");
  const secretKey = Deno.env.get("SIGILOPAY_SECRET_KEY");
  const enabled = Deno.env.get("SIGILOPAY_ENABLED") === "true";
  if (!enabled || !publicKey || !secretKey) {
    // Keep the operational cause server-side; it reveals configuration state.
    console.error("Sigilo Pay checkout is not configured");
    return send({ error: "Checkout temporarily unavailable. Please try again later." }, 503);
  }
  try {
    const raw = await req.text();
    if (raw.length > 512) return send({ error: "Request too large" }, 413);
    const body = JSON.parse(raw);
    const eventDate = dates[body?.session];
    const quantity = body?.quantity;
    const sector = body?.sector ?? "Pista";
    const ticketType = body?.ticketType ?? "inteira";
    if (!eventDate || !Number.isInteger(quantity) || quantity < 1 || quantity > 1 ||
      !["Pista", "Arquibancada"].includes(sector) ||
      !["inteira", "meia"].includes(ticketType)) {
      return send({ error: "Invalid selection" }, 400);
    }
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const actorHash = await requestActorHash(req);
    const { data: allowed, error: rateLimitError } = await db.rpc("consume_checkout_rate_limit", {
      p_actor_hash: actorHash,
    });
    if (rateLimitError) return send({ error: "Checkout temporarily unavailable. Please try again later." }, 503);
    if (!allowed) return send({ error: "Too many checkout attempts. Please wait 10 minutes and try again." }, 429);

    const { data: order, error: orderError } = await db.rpc("create_sigilopay_order", {
      p_date: eventDate, p_quantity: quantity, p_sector: sector, p_ticket_type: ticketType,
    }).single();
    if (orderError || !order) return send({ error: "Unable to create order in database" }, 503);

    const checkoutBody = {
      product: {
        externalId: order.external_id,
        photos: [productImageUrl],
        name: "BTS World Tour Arirang - " + sector + " - " + (ticketType === "meia" ? "Meia-entrada" : "Inteira"),
        offer: {
          name: "Sessão " + body.session + " de outubro de 2026 · " + sector + " · " + (ticketType === "meia" ? "Meia-entrada" : "Inteira"),
          // Sigilo Pay validates this field in BRL; the order remains stored in cents.
          price: order.amount_cents / 100,
          offerType: "NATIONAL",
          currency: "BRL",
          lang: "pt-BR",
          type: "ticket",
          category: "events",
        },
      },
      settings: {
        paymentMethods: ["PIX", "CREDIT_CARD", "BOLETO"],
        acceptedDocs: ["CPF"],
        thankYouPage: origin + "/?order=" + encodeURIComponent(order.id),
        askForAddress: false,
        colors: {
          primaryColor: "#f5093d", text: "#FFFFFF", background: "#080808",
          purchaseButtonBackground: "#f5093d", purchaseButtonText: "#FFFFFF",
          widgets: "#111111", inputBackground: "#242424", inputText: "#FFFFFF",
        },
      },
      trackProps: { external_id: order.external_id, order_id: order.id },
    };
    const gateway = await fetch(endpoint, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { "x-public-key": publicKey, "x-secret-key": secretKey, "Content-Type": "application/json" },
      body: JSON.stringify(checkoutBody),
    });
    if (!gateway.ok) {
      // Do not send provider response details to the browser: they can expose
      // internal validation rules or request identifiers.
      console.error("Sigilo Pay checkout rejected", { status: gateway.status });
      return send({ error: "Sigilo Pay rejected the checkout (HTTP " + gateway.status + ")" }, 502);
    }
    const result = await gateway.json();
    if (!result || typeof result.productId !== "string" || typeof result.offerCode !== "string" || typeof result.checkoutUrl !== "string") return send({ error: "Sigilo Pay returned an invalid checkout response" }, 502);
    const checkoutUrl = new URL(result.checkoutUrl);
    if (checkoutUrl.protocol !== "https:") throw new Error("Invalid checkout URL");
    const { error: updateError } = await db.from("checkout_orders").update({
      gateway_product_id: result.productId, gateway_offer_code: result.offerCode, checkout_url: checkoutUrl.toString(),
    }).eq("id", order.id);
    if (updateError) return send({ error: "Unable to save checkout in database" }, 503);
    return send({ checkoutUrl: checkoutUrl.toString() });
  } catch {
    return send({ error: "Unable to create checkout. Please try again later." }, 503);
  }
});
