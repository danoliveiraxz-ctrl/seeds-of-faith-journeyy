import { createFileRoute } from "@tanstack/react-router";
import demo from "../bts-demo.html?raw";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Violet Tickets · BTS | Demonstração" }, { name: "description", content: "Demonstração interativa de ingressos BTS. Sem venda, emissão ou autenticação real." }] }),
  component: () => <iframe title="Violet Tickets: demonstração de ingressos BTS" srcDoc={demo} sandbox="allow-scripts" style={{position:"fixed",inset:0,width:"100%",height:"100dvh",border:0,background:"#09060e",zIndex:50}} />,
});
