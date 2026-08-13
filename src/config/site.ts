/**
 * Configuração central da landing page.
 * Altere CHECKOUT_URL em UM único lugar — todos os botões de compra usam esta variável.
 */

// [INSERIR LINK CAKTO]
export const CHECKOUT_URL = "[INSERIR LINK CAKTO]";

// [INSERIR URL DA VSL] — aceita link de embed (YouTube/Vimeo/Panda/VTurb)
export const VSL_URL = "[INSERIR URL DA VSL]";

// [INSERIR MOCKUP REAL] — imagem real do e-book (nenhuma página é inventada)
export const EBOOK_MOCKUP_URL = "";

// Tracking — nenhum ID inventado. Preencher com os IDs reais.
export const META_PIXEL_ID = "META_PIXEL_ID";
export const CAPI_TOKEN = "CAPI_TOKEN"; // usar apenas no servidor (Meta CAPI)

/** Depoimentos reais fornecidos pelo proprietário. Nunca preencher com histórias fictícias. */
export const TESTIMONIALS: { name: string; text: string }[] = [];

/** Data real de encerramento da promoção (ISO). null = sem contador. */
export const PROMO_END_AT: string | null = null;

export const isPlaceholder = (value: string) =>
  !value || value.trim().startsWith("[INSERIR") || value === "META_PIXEL_ID";
