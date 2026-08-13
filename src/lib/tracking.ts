/**
 * Estrutura de tracking (Meta Pixel, UTMify, Cakto, Meta CAPI).
 *
 * Eventos: PageView, ViewContent, InitiateCheckout, Purchase.
 * IMPORTANTE: Purchase NUNCA é disparado no clique do botão — depende de
 * confirmação real da compra (postback/webhook da Cakto -> Meta CAPI).
 */
import { META_PIXEL_ID, isPlaceholder } from "@/config/site";

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    utmify?: (...args: unknown[]) => void;
  }
}

const pixelReady = () => typeof window !== "undefined" && !isPlaceholder(META_PIXEL_ID);

/** Carrega o Meta Pixel apenas quando um ID real for configurado. */
export function initTracking() {
  if (!pixelReady() || window.fbq) return;
  const n: any = (window.fbq = function (...args: unknown[]) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
  });
  n.queue = [];
  n.loaded = true;
  n.version = "2.0";
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  window.fbq?.("init", META_PIXEL_ID);
  track("PageView");
}

export function track(event: "PageView" | "ViewContent" | "InitiateCheckout", params?: Params) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", event, params);
  window.utmify?.("track", event, params);
}

/** Mantém os parâmetros de UTM/click id (UTMify + Cakto) ao ir para o checkout. */
export function buildCheckoutUrl(baseUrl: string) {
  if (typeof window === "undefined") return baseUrl;
  try {
    const target = new URL(baseUrl, window.location.origin);
    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (/^(utm_|src|sck|xcod|fbclid|gclid)/i.test(k)) target.searchParams.set(k, v);
    });
    return target.toString();
  } catch {
    return baseUrl;
  }
}
