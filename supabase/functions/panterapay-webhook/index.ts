// No signature header, payload path, or verification endpoint has been supplied.
// Reject ALL notifications until the provider's documented verifier is implemented.
// Never trust a body field such as status/event without authentication.
Deno.serve((req: Request) => {
 if (req.method !== "POST") return new Response("Method not allowed", {status:405});
 return Response.json({error:"Webhook verification is not configured"}, {status:503});
});
