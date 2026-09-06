# Sigilo Pay checkout

The backend uses the documented POST checkout endpoint and calculates R$ 1.000,00 per ticket in cents. It validates session and quantity, creates the order, then stores the product ID, offer code and checkout URL returned by Sigilo Pay.

Configuration:
1. Apply the migration and deploy the functions.
2. Set CHECKOUT_ORIGIN to the exact site origin.
3. Set SIGILOPAY_AUTHORIZATION to the complete Authorization header value supplied by Sigilo Pay. The provided API document does not state the authentication scheme, so it is not guessed in code.
4. Keep SIGILOPAY_ENABLED=false until testing is finished, then set it to true.
5. The frontend posts session and quantity to the create-checkout Edge Function and redirects to checkoutUrl.

The supplied documentation contains no payment confirmation or webhook authentication format. The webhook rejects all requests until Sigilo Pay provides event body, transaction reference, signature and secret details.
