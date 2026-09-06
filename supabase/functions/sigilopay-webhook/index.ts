// Sigilo Pay checkout documentation does not define webhook authentication yet.
Deno.serve((req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  return Response.json({ error: "Webhook verification is not configured" }, { status: 503 });
});
