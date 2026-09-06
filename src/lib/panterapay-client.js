// Public integration helper. Supply ONLY a Supabase public key and user access token.
// Never pass a PanteraPay or Supabase service-role secret into this module.
export async function createPix({supabaseUrl,publicKey,accessToken,productId,quantity,requestId}) {
 const url=new URL(supabaseUrl);
 if(url.protocol!=="https:")throw new Error("Supabase HTTPS URL required");
 const response=await fetch(new URL("/functions/v1/panterapay-create",url),{
  method:"POST",
  headers:{"Content-Type":"application/json",apikey:publicKey,Authorization:"Bearer "+accessToken},
  body:JSON.stringify({productId,quantity,requestId})
 });
 const data=await response.json();
 if(!response.ok)throw new Error(data.error || "Não foi possível criar o PIX.");
 return data;
}

export function renderPix(container,payment){
 container.replaceChildren();
 const text=document.createElement("p");
 if(payment.status!=="pending"){
  text.textContent="Pedido em processamento. Não gere outro pagamento; aguarde a conferência.";
  container.append(text);
  return ()=>{};
 }
 const expiry=Date.parse(payment.expiresAt);
 const qr=payment.qrCodeBase64;
 if(!Number.isFinite(expiry)||typeof qr!=="string"||!/^[A-Za-z0-9+/=\r\n]+$/.test(qr)||typeof payment.copyPaste!=="string")throw new Error("Dados PIX inválidos");
 const image=document.createElement("img");
 image.src="data:image/png;base64,"+qr;
 image.alt="QR Code para pagamento PIX";
 image.width=256;image.height=256;image.style.maxWidth="100%";image.style.objectFit="contain";
 const code=document.createElement("textarea");
 code.readOnly=true;code.value=payment.copyPaste;code.setAttribute("aria-label","Código PIX copia e cola");
 code.style.width="100%";
 const copy=document.createElement("button");
 copy.type="button";copy.textContent="Copiar código PIX";copy.style.minHeight="48px";
 const feedback=document.createElement("p");feedback.setAttribute("role","status");
 copy.addEventListener("click",async()=>{
  if(Date.now()>=expiry){refresh();return;}
  try{await navigator.clipboard.writeText(payment.copyPaste);feedback.textContent="Código copiado.";}
  catch{code.focus();code.select();feedback.textContent="Selecione e copie o código acima.";}
 });
 const status=document.createElement("p");
 status.textContent="Aguardando confirmação do pagamento.";
 function refresh(){
  const expired=Date.now()>=expiry;
  text.textContent=expired?"PIX expirado. Confira o status do pedido antes de tentar novamente.":"Válido até "+new Date(expiry).toLocaleString("pt-BR");
  image.hidden=expired;code.hidden=expired;copy.disabled=expired;
 }
 container.append(image,text,code,copy,feedback,status);refresh();
 const interval=setInterval(refresh,1000);
 return ()=>clearInterval(interval);
}
