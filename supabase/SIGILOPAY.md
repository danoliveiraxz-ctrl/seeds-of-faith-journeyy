# Sigilo Pay checkout

The backend uses the documented POST checkout endpoint and calculates R$ 1.000,00 per ticket in cents. It validates session and quantity, creates the order, then stores the product ID, offer code and checkout URL returned by Sigilo Pay.

Configuration:
1. Apply the migration and deploy the functions.
2. Set CHECKOUT_ORIGIN to the exact site origin.
3. Set SIGILOPAY_AUTHORIZATION to the complete Authorization header value supplied by Sigilo Pay. The provided API document does not state the authentication scheme, so it is not guessed in code.
4. Keep SIGILOPAY_ENABLED=false until testing is finished, then set it to true.
5. The frontend posts session and quantity to the create-checkout Edge Function and redirects to checkoutUrl.

The TRANSACTION_CREATED webhook is implemented. Set GATEWAY_WEBHOOK_TOKEN as a Supabase Edge Function secret and configure the same value in Sigilo Pay. The function validates the body and token before storing a minimal transaction record, and transaction ID makes delivery idempotent. It never logs or stores webhook tokens, CPF, CNPJ, address, checkout URL, PIX QR code or tracking data.

TRANSACTION_CREATED confirms that a transaction was created; it does not confirm payment. Keep ticket delivery disabled until Sigilo Pay provides and we implement a payment-status webhook with an authenticated signature or token.
