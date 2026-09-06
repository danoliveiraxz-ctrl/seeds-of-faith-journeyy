import { createClient } from "npm:@supabase/supabase-js@2";

const endpoint = "https://panterapay-production.up.railway.app/transactions";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
Deno.serve(async (req: Request) => {
 const origin=Deno.env.get("CHECKOUT_ORIGIN");
 const headers: Record<string,string> = {"Cache-Control":"no-store","Vary":"Origin"};
 if(origin && req.headers.get("Origin")===origin){
  headers["Access-Control-Allow-Origin"]=origin;
  headers["Access-Control-Allow-Headers"]="authorization, apikey, content-type, x-client-info";
  headers["Access-Control-Allow-Methods"]="POST, OPTIONS";
 }
 const reply=(body:unknown,status=200)=>Response.json(body,{status,headers});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 if(!origin || (req.headers.get("Origin") && req.headers.get("Origin")!==origin))return reply({error:"Origin not allowed"},403);
 const key=Deno.env.get("PANTERAPAY_API_KEY");
 if(Deno.env.get("PANTERAPAY_ENABLED")!=="true" || !key)return reply({error:"Payments are not enabled"},503);
 try {
  const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
  const token=req.headers.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];
  if(!token)return reply({error:"Session required"},401);
  const {data:auth,error:authError}=await db.auth.getUser(token);
  if(authError || !auth.user)return reply({error:"Invalid session"},401);
  const raw=await req.text();
  if(raw.length>2048)return reply({error:"Request too large"},413);
  let body;
  try{body=JSON.parse(raw);}catch{return reply({error:"Invalid JSON"},400);}
  if(!body || !uuid.test(body.productId) || !uuid.test(body.requestId) || !Number.isInteger(body.quantity) || body.quantity<1 || body.quantity>10)return reply({error:"Invalid selection"},400);
  const {data:order,error}=await db.rpc("prepare_panterapay_order",{p_user:auth.user.id,p_request:body.requestId,p_product:body.productId,p_quantity:body.quantity});
  if(error || !order)return reply({error:"Unable to prepare order. Check selection or wait before retrying."},409);
  const present=(p:Record<string,unknown>)=>({orderId:order.id,status:p.status,amount:p.amount_cents,qrCodeBase64:p.qr_code_base64,copyPaste:p.copy_paste,expiresAt:p.expires_at});
  if(!order.created){
   const {data:p,error:readError}=await db.from("payments").select("status,amount_cents,qr_code_base64,copy_paste,expires_at").eq("order_id",order.id).single();
   if(readError || !p)return reply({error:"Unable to read payment"},503);
   return reply(present(p),p.status==="creating"||p.status==="review"?202:200);
  }
  // No provider idempotency header is documented. Never retry this POST automatically.
  // A timeout may mean the provider created the charge: preserve order for reconciliation.
  try {
   const res=await fetch(endpoint,{method:"POST",redirect:"error",headers:{Authorization:key,"Content-Type":"application/json"},body:JSON.stringify({amount:order.amount}),signal:AbortSignal.timeout(15000)});
   if(!res.ok)throw new Error("Provider request failed");
   const p=await res.json();
   if(!p || !["string","number"].includes(typeof p.id) || !String(p.id).length || p.amount!==order.amount || typeof p.qrCodeBase64!=="string" || typeof p.copyPaste!=="string" || !p.copyPaste.length || typeof p.expiresAt!=="string" || !Number.isFinite(Date.parse(p.expiresAt)))throw new Error("Unrecognized provider response");
   const qr=p.qrCodeBase64.replace(/^data:image\/(png|jpeg);base64,/,"");
   if(!qr.length || qr.length>2000000 || !/^[A-Za-z0-9+/=\r\n]+$/.test(qr))throw new Error("Invalid QR image");
   const {error:saveError}=await db.from("payments").update({transaction_id:String(p.id),status:"pending",qr_code_base64:qr,copy_paste:p.copyPaste,expires_at:p.expiresAt,fee:p.fee??null,store_id:p.storeId==null?null:String(p.storeId),provider_status:p.status==null?null:String(p.status)}).eq("order_id",order.id).eq("status","creating");
   if(saveError)throw new Error("Payment save failed");
   return reply({orderId:order.id,status:"pending",amount:order.amount,qrCodeBase64:qr,copyPaste:p.copyPaste,expiresAt:p.expiresAt});
  }catch{
   await db.from("payments").update({status:"review"}).eq("order_id",order.id).eq("status","creating");
   return reply({orderId:order.id,status:"review",error:"Payment needs reconciliation. Do not create another charge."},202);
  }
 }catch{return reply({error:"Service temporarily unavailable"},503);}
});
