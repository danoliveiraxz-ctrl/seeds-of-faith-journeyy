import { createClient } from "npm:@supabase/supabase-js@2";

type PaymentMethod = "CREDIT_CARD" | "PIX" | "BOLETO" | "CRYPTO";
type TransactionStatus = "COMPLETED" | "FAILED" | "PENDING" | "REFUNDED" | "CHARGED_BACK";

interface OrderItem {
  id: string;
  price: number;
  product: { id: string; name: string; externalId: string };
}

interface PaidPayload {
  event: string;
  token: string;
  offerCode: string;
  client: { id: string };
  transaction: {
    id: string;
    status: TransactionStatus;
    paymentMethod: PaymentMethod;
    originalAmount: number;
    amount: number;
    originalCurrency: string;
    currency: string;
    installments: number;
    createdAt: string;
    payedAt: string;
    orderItems?: OrderItem[];
  };
  orderItems?: OrderItem[];
}

const validMethods = new Set<PaymentMethod>(["CREDIT_CARD", "PIX", "BOLETO", "CRYPTO"]);
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const isText = (value: unknown, max = 512): value is string => typeof value === "string" && value.length > 0 && value.length <= max;
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isIsoDate = (value: unknown): value is string => isText(value, 64) && Number.isFinite(Date.parse(value));

async function tokenMatches(received: unknown, expected: string): Promise<boolean> {
  if (!isText(received, 512)) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(received)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const a = new Uint8Array(left);
  const b = new Uint8Array(right);
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index];
  return difference === 0;
}

function getOrderItems(payload: Record<string, unknown>): OrderItem[] | null {
  const items = Array.isArray(payload.orderItems)
    ? payload.orderItems
    : isObject(payload.transaction) && Array.isArray(payload.transaction.orderItems)
    ? payload.transaction.orderItems
    : null;

  if (!items || items.length < 1 || items.length > 100) return null;
  const parsed: OrderItem[] = [];

  for (const item of items) {
    if (!isObject(item) || !isText(item.id) || !isNumber(item.price) ||
      !isObject(item.product) || !isText(item.product.id) ||
      !isText(item.product.name) || !isText(item.product.externalId)) return null;

    parsed.push({
      id: item.id,
      price: item.price,
      product: {
        id: item.product.id,
        name: item.product.name,
        externalId: item.product.externalId,
      },
    });
  }
  return parsed;
}

function parsePaidPayload(input: unknown): PaidPayload | null {
  if (!isObject(input) || !isText(input.event, 100) || !isText(input.token) ||
    !isText(input.offerCode) || !isObject(input.client) || !isObject(input.transaction)) return null;

  const client = input.client;
  const transaction = input.transaction;
  if (!isText(client.id)) return null;

  // "Transação paga" must carry a completed transaction and its payment time.
  if (!isText(transaction.id) || transaction.status !== "COMPLETED" ||
    !validMethods.has(transaction.paymentMethod as PaymentMethod) ||
    !isNumber(transaction.originalAmount) || !isNumber(transaction.amount) ||
    !isText(transaction.originalCurrency, 8) || !isText(transaction.currency, 8) ||
    !isNumber(transaction.installments) || !isIsoDate(transaction.createdAt) ||
    !isIsoDate(transaction.payedAt)) return null;

  const orderItems = getOrderItems(input);
  if (!orderItems) return null;

  return {
    event: input.event,
    token: input.token,
    offerCode: input.offerCode,
    client: { id: client.id },
    transaction: {
      id: transaction.id,
      status: "COMPLETED",
      paymentMethod: transaction.paymentMethod as PaymentMethod,
      originalAmount: transaction.originalAmount,
      amount: transaction.amount,
      originalCurrency: transaction.originalCurrency,
      currency: transaction.currency,
      installments: transaction.installments,
      createdAt: transaction.createdAt,
      payedAt: transaction.payedAt,
      orderItems,
    },
    orderItems,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const raw = await req.text();
    if (raw.length > 256000) return Response.json({ error: "Invalid payload" }, { status: 400 });

    let input: unknown;
    try { input = JSON.parse(raw); } catch { return Response.json({ error: "Invalid payload" }, { status: 400 }); }
    if (!isObject(input)) return Response.json({ error: "Invalid payload" }, { status: 400 });

    const expectedToken = Deno.env.get("GATEWAY_WEBHOOK_TOKEN");
    if (!expectedToken || !(await tokenMatches(input.token, expectedToken))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = parsePaidPayload(input);
    if (!payload) return Response.json({ error: "Payment is not a completed transaction" }, { status: 400 });

    const externalId = payload.orderItems![0].product.externalId;
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: order, error: orderError } = await db
      .from("checkout_orders")
      .select("id, gateway_offer_code, amount_cents")
      .eq("external_id", externalId)
      .maybeSingle();

    if (orderError) return Response.json({ error: "Unable to process event" }, { status: 503 });

    if (!order || order.gateway_offer_code !== payload.offerCode ||
      payload.transaction.currency !== "BRL" ||
      payload.transaction.amount !== order.amount_cents / 100) {
      return Response.json({ error: "Invalid transaction reference" }, { status: 400 });
    }

    const { error: transactionError } = await db.from("sigilopay_transactions").upsert({
      transaction_id: payload.transaction.id,
      order_id: order.id,
      offer_code: payload.offerCode,
      transaction_status: payload.transaction.status,
      payment_method: payload.transaction.paymentMethod,
      amount: payload.transaction.amount,
      currency: payload.transaction.currency,
      client_id: payload.client.id,
      created_at_provider: payload.transaction.createdAt,
    }, { onConflict: "transaction_id" });

    if (transactionError) return Response.json({ error: "Unable to process event" }, { status: 503 });

    const { error: paidOrderError } = await db.from("checkout_orders").update({
      status: "paid",
      updated_at: new Date().toISOString(),
    }).eq("id", order.id);

    if (paidOrderError) return Response.json({ error: "Unable to process event" }, { status: 503 });

    return Response.json({ accepted: true, paid: true }, { status: 200 });
  } catch {
    return Response.json({ error: "Unable to process event" }, { status: 503 });
  }
});
