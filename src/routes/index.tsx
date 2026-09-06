import { createFileRoute } from "@tanstack/react-router";
import demo from "../bts-demo.html?raw";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Kpop Tickets · BTS World Tour Arirang" }, { name: "description", content: "Sessões, valores e atendimento da Kpop Tickets para BTS World Tour Arirang." }] }),
  component: () => <iframe title="Kpop Tickets: BTS World Tour Arirang" srcDoc={demo} sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation" style={{position:"fixed",inset:0,width:"100%",height:"100dvh",border:0,background:"#f5f5f6",zIndex:50}} />,
});
