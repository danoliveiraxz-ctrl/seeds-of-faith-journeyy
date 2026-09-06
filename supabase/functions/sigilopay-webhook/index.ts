import { createClient } from "npm:@supabase/supabase-js@2";

type PaymentMethod = "CREDIT_CARD" | "PIX" | "BOLETO" | "CRYPTO";
type TransactionStatus = "COMPLETED" | "FAILED" | "PENDING" | "REFUNDED" | "CHARGED_BACK";
interface Address { country: string; zipCode: string; state: string; city: string; neighborhood: string; street: string; number: string; complement?: string | null; }
interface Client { id: string; name: string; email: string; phone: string; cpf: string | null; cnpj: string | null; address: Address | null; }
interface PixInformation { id: string; qrCode: string; endToEndId: string | null; }
interface BoletoInformation { transactionId: string; id: string; barcode: string; digitableLine: string; pdfUrl: string; instructions: string; createdAt: string; updatedAt: string; }
interface Subscription { id: string; identifier: string; cycle: number; startAt: string; intervalType: "DAYS" | "WEEKS" | "MONTHS" | "YEARS"; intervalCount: number; status: "ACTIVE" | "INACTIVE" | "CANCELED"; }
interface OrderItem { id: string; price: number; product: { id: string; name: string; externalId: string; }; }
interface Transaction { id: string; identifier?: string; status: TransactionStatus; paymentMethod: PaymentMethod; originalAmount: number; amount: number; commissionAmount?: number | null; originalCurrency: string; currency: string; exchangeRate: number | null; installments: number; createdAt: string; payedAt: string | null; pixInformation?: PixInformation | null; boletoInformation?: BoletoInformation | null; orderItems?: OrderItem[]; }
interface TrackProps { utm_id?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; utm_term?: string; fbc?: string; fbp?: string; ip?: string; country?: string; user_agent?: string; zip_code?: string; city?: string; state?: string; }
interface TransactionCreatedPayload { event: "TRANSACTION_CREATED"; token: string; offerCode: string; checkoutUrl: string; client: Client; transaction: Transaction; subscription: Subscription | null; orderItems?: OrderItem[]; trackProps: TrackProps; }

const validStatuses = new Set<TransactionStatus>(["COMPLETED", "FAILED", "PENDING", "REFUNDED", "CHARGED_BACK"]);
const validMethods = new Set<PaymentMethod>(["CREDIT_CARD", "PIX", "BOLETO", "CRYPTO"]);
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 512): v is string => typeof v === "string" && v.length > 0 && v.length <= max;
const number = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isoDate = (v: unknown): v is string => text(v, 64) && Number.isFinite(Date.parse(v));

async function tokenMatches(value: unknown, expected: string): Promise<boolean> {
  if (!text(value, 512)) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(value)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const a = new Uint8Array(left), b = new Uint8Array(right);
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index];
  return difference === 0;
}

function itemsFrom(payload: Record<string, unknown>): OrderItem[] | null {
  const fromRoot = Array.isArray(payload.orderItems) ? payload.orderItems : object(payload.transaction) && Array.isArray(payload.transaction.orderItems) ? payload.transaction.orderItems : null;
  if (!fromRoot || fromRoot.length < 1 || fromRoot.length > 100) return null;
  const items: OrderItem[] = [];
  for (const item of fromRoot) {
    if (!object(item) || !text(item.id) || !number(item.price) || !object(item.product) || !text(item.product.id) || !text(item.product.name) || !text(item.product.externalId)) return null;
    items.push({ id: item.id, price: item.price, product: { id: item.product.id, name: item.product.name, externalId: item.product.externalId } });
  }
  return items;
}

function parse(payload: unknown): TransactionCreatedPayload | null {
  if (!object(payload) || payload.event !== "TRANSACTION_CREATED" || !text(payload.token) || !text(payload.offerCode) || typeof payload.checkoutUrl !== "string" || !object(payload.client) || !object(payload.transaction) || !object(payload.trackProps)) return null;
  const c = payload.client, t = payload.transaction;
  if (!text(c.id) || !text(c.name) || !text(c.email) || !text(c.phone) || !(typeof c.cpf === "string" || c.cpf === null) || !(typeof c.cnpj === "string" || c.cnpj === null) || !(object(c.address) || c.address === null)) return null;
  if (!text(t.id) || !validStatuses.has(t.status as TransactionStatus) || !validMethods.has(t.paymentMethod as PaymentMethod) || !number(t.originalAmount) || !number(t.amount) || !text(t.originalCurrency, 8) || !text(t.currency, 8) || !number(t.installments) || !isoDate(t.createdAt) || !(isoDate(t.payedAt) || t.payedAt === null)) return null;
  const items = itemsFrom(payload);
  if (!items) return null;
  return { event: "TRANSACTION_CREATED", token: payload.token, offerCode: payload.offerCode, checkoutUrl: payload.checkoutUrl, client: c as Client, transaction: { ...(t as Transaction), orderItems: items }, subscription: payload.subscription as Subscription | null, orderItems: items, trackProps: payload.trackProps as TrackProps };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const raw = await req.text();
    if (raw.length > 256000) return Response.json({ error: "Invalid payload" }, { status: 400 });
    let input: unknown;
    try { input = JSON.parse(raw); } catch { return Response.json({ error: "Invalid payload" }, { status: 400 }); }
    if (!object(input) || input.event !== "TRANSACTION_CREATED") return Response.json({ error: "Invalid event" }, { status: 400 });
    const expected = Deno.env.get("GATEWAY_WEBHOOK_TOKEN");
    if (!expected || !(await tokenMatches(input.token, expected))) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const payload = parse(input);
    if (!payload) return Response.json({ error: "Invalid payload" }, { status: 400 });
    const externalId = payload.orderItems![0].product.externalId;
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: order, error: orderError } = await db
      .from("checkout_orders")
      .select("id, gateway_offer_code, amount_cents")
      .eq("external_id", externalId)
      .maybeSingle();
    if (orderError) return Response.json({ error: "Unable to process event" }, { status: 503 });

    // A valid webhook must match the checkout we created. TRANSACTION_CREATED is
    // recorded only; it never marks an order paid or issues a ticket.
    if (!order || order.gateway_offer_code !== payload.offerCode ||
      payload.transaction.currency !== "BRL" ||
      payload.transaction.amount !== order.amount_cents / 100) {
      return Response.json({ error: "Invalid transaction reference" }, { status: 400 });
    }

    const { error: insertError } = await db.from("sigilopay_transactions").upsert({
      transaction_id: payload.transaction.id,
      order_id: order?.id ?? null,
      offer_code: payload.offerCode,
      transaction_status: payload.transaction.status,
      payment_method: payload.transaction.paymentMethod,
      amount: payload.transaction.amount,
      currency: payload.transaction.currency,
      client_id: payload.client.id,
      created_at_provider: payload.transaction.createdAt,
    }, { onConflict: "transaction_id", ignoreDuplicates: true });
    if (insertError) return Response.json({ error: "Unable to process event" }, { status: 503 });
    return Response.json({ accepted: true }, { status: 200 });
  } catch {
    return Response.json({ error: "Unable to process event" }, { status: 503 });
  }
});
