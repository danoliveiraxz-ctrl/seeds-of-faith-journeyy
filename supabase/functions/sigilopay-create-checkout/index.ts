import { createClient } from "npm:@supabase/supabase-js@2";

const endpoint = "https://app.sigilopay.com.br/api/v1/gateway/checkout";
const dates: Record<string, string> = { "28": "2026-10-28", "30": "2026-10-30", "31": "2026-10-31" };

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
  if (Deno.env.get("SIGILOPAY_ENABLED") !== "true" || !publicKey || !secretKey) {
    return send({ error: "Checkout is not enabled" }, 503);
  }
  try {
    const raw = await req.text();
    if (raw.length > 512) return send({ error: "Request too large" }, 413);
    const body = JSON.parse(raw);
    const eventDate = dates[body?.session];
    const quantity = body?.quantity;
    if (!eventDate || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return send({ error: "Invalid selection" }, 400);
    }
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: order, error: orderError } = await db.rpc("create_sigilopay_order", {
      p_date: eventDate, p_quantity: quantity,
    }).single();
    if (orderError || !order) return send({ error: "Unable to create order" }, 503);

    const checkoutBody = {
      product: {
        externalId: order.external_id,
        name: "BTS World Tour Arirang - " + quantity + " ingresso" + (quantity === 1 ? "" : "s"),
        offer: {
          name: "Sessão " + body.session + " de outubro de 2026",
          price: order.amount_cents,
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
    if (!gateway.ok) throw new Error("Gateway rejected checkout");
    const result = await gateway.json();
    if (!result || typeof result.productId !== "string" || typeof result.offerCode !== "string" || typeof result.checkoutUrl !== "string") throw new Error("Invalid gateway response");
    const checkoutUrl = new URL(result.checkoutUrl);
    if (checkoutUrl.protocol !== "https:") throw new Error("Invalid checkout URL");
    const { error: updateError } = await db.from("checkout_orders").update({
      gateway_product_id: result.productId, gateway_offer_code: result.offerCode, checkout_url: checkoutUrl.toString(),
    }).eq("id", order.id);
    if (updateError) throw new Error("Could not persist checkout");
    return send({ checkoutUrl: checkoutUrl.toString() });
  } catch {
    return send({ error: "Unable to create checkout. Please try again later." }, 503);
  }
});
