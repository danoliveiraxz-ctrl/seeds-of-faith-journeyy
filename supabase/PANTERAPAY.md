# PanteraPay / Supabase

Prepared integration; not deployed, funded or enabled. No credentials committed.

## Setup
1. Link the existing Supabase project and apply this migration with `supabase db push`.
2. Add PANTERAPAY_API_KEY through Supabase Edge Function secrets. Never use a VITE_ variable.
3. Set CHECKOUT_ORIGIN to the exact production frontend origin. Leave PANTERAPAY_ENABLED=false until webhook verification, reconciliation and sandbox testing are complete.
4. Deploy panterapay-create and panterapay-webhook. Configure the provider callback as https://YOUR_PROJECT.supabase.co/functions/v1/panterapay-webhook.
5. Add verified events and products with prices in cents, sector and ticket type; activate only inventory approved for sale. No fictional stock or price mapping is seeded.

## Frontend contract (our API, not PanteraPay)
The existing landing remains a demonstration. Production wiring requires the Supabase project URL/public key and verified product IDs.
Use a Supabase anonymous session for guest checkout (no Google login). Enable anonymous Auth with CAPTCHA/rate limits before opening to the public.
Invoke panterapay-create with the user's Bearer session and body:
`{productId: UUID, quantity: integer 1..10, requestId: UUID}`.
Persist/reuse requestId for the same purchase attempt; generate a new ID only for an intentional new selection.
The backend reads the unit price from products and calculates the total in cents. Browser-supplied amounts are ignored.
Response includes orderId, status, amount, qrCodeBase64, copyPaste, expiresAt.
Render the QR as a base64 PNG/JPEG image (never HTML), copyPaste as text with a copy button and expiresAt as a local date/time. Stop offering payment after expiry.
Poll the authenticated orders table for this user's order status. Never mark paid from client input, QR display, countdown, or create response.
For creating/review, preserve the order and show processing/support; do not start a new charge automatically.

## Confirmed provider contract
Only POST https://panterapay-production.up.railway.app/transactions is called.
Headers: Authorization containing the raw secret; Content-Type application/json.
Body: amount integer in cents. Only supplied response fields are consumed.
No undocumented status lookup, refund, transfer, idempotency header or webhook field is invented.

## Webhook activation blocker
payment.approved is the known event, but the envelope, transaction ID field, signature header/algorithm, timestamp/replay rules and secret delivery are not supplied.
The webhook returns 503 to every POST and changes nothing. Do not enable live payments yet.
Once documented, verify the ORIGINAL request bytes and signature, validate event/transaction, then call the service-only approve_panterapay_payment RPC. Its transaction lock makes repeat approvals no-ops and updates payment/order timestamps atomically.
If a notification arrives before transaction persistence, return a retryable failure; confirm provider retry policy before activation.
Timeouts, process crashes or persistence failures require reconciliation in the provider dashboard until a documented lookup endpoint exists.

## Tickets
Schema prepared with unique IDs/codes and pending_delivery/valid/used/cancelled statuses. No QR issuance or entry validation is activated. Original-event ticket delivery remains a separate integration.

## Validation before activation
Run migration against a test Supabase project. Verify RLS blocks cross-customer reads and all client mutations; verify duplicate request IDs create one charge; test mixed-product request ID reuse, invalid quantities and tampered amount.
Use a documented provider sandbox to verify response field types/expiry format, wrong amounts, timeouts and duplicate authenticated webhooks. No sandbox endpoint has been assumed.
This integration creates charges; it does not initiate withdrawals or guarantee provider settlement.
