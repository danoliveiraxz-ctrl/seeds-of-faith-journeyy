import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckoutButton } from "@/components/landing/CheckoutButton";
import { VslPlayer } from "@/components/landing/VslPlayer";
import { StickyCta } from "@/components/landing/StickyCta";
import { EBOOK_MOCKUP_URL, PROMO_END_AT, TESTIMONIALS } from "@/config/site";
import { initTracking, track } from "@/lib/tracking";
import provaSocialAsset from "@/assets/prova-social.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sementes de Fé | 5 minutos por dia para falar de Deus em família" },
      {
        name: "description",
        content:
          "Material cristão infantil digital com 40 conversas de ~5 minutos para famílias com crianças de 6 a 10 anos. Acesso imediato, vitalício e garantia de 7 dias.",
      },
      { property: "og:title", content: "Sementes de Fé — conversas de fé para crianças" },
      {
        property: "og:description",
        content:
          "40 conversas de ~5 minutos sobre Deus, Jesus, oração e valores, pensadas para a rotina real das famílias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const JOURNEYS = [
  {
    n: "01",
    title: "Deus e eu",
    desc: "Histórias sobre a criação e o cuidado de Deus, em linguagem próxima da criança.",
    icon: SeedIcon,
  },
  {
    n: "02",
    title: "Quem é Jesus pra mim?",
    desc: "Jesus apresentado de forma acessível, para a criança entender quem Ele é.",
    icon: LeafIcon,
  },
  {
    n: "03",
    title: "Como conversar com Deus",
    desc: "A oração apresentada como conversa, com situações reais da infância.",
    icon: SunIcon,
  },
  {
    n: "04",
    title: "Vivendo o que se aprende",
    desc: "Perdão, honestidade, coragem e amor ao próximo no dia a dia.",
    icon: BookIcon,
  },
];

const FAQ: [string, string][] = [
  ["Como vou receber o e-book?", "Após a confirmação da compra, o acesso é enviado por e-mail."],
  ["Para qual idade é indicado?", "Foi pensado principalmente para crianças de 6 a 10 anos."],
  [
    "Preciso entender muito de Bíblia?",
    "Não. As conversas já são estruturadas para facilitar o momento com a criança.",
  ],
  [
    "É católico ou evangélico?",
    "É um material cristão focado no essencial: Deus, Jesus, oração e valores.",
  ],
  ["Quanto tempo leva?", "Aproximadamente 5 minutos por conversa."],
  ["Posso acessar pelo celular?", "Sim. Celular, tablet ou computador."],
  ["Posso imprimir?", "Sim, o material digital pode ser impresso."],
  ["E se eu não gostar?", "Existe garantia de 7 dias."],
];

function LandingPage() {
  useEffect(() => {
    initTracking();
    track("ViewContent", { content_name: "Landing Sementes de Fé" });
  }, []);

  return (
    <main className="pb-24 md:pb-0">
      {/* 1-3. HERO + VSL + CTA */}
      <section className="relative overflow-hidden surface-deep">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="section-shell relative py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow inline-block rounded-full border border-gold/50 bg-gold/15 px-4 py-1.5 text-[0.65rem] text-primary-foreground sm:text-xs">
              Para famílias com crianças de 6 a 10 anos
            </span>
            <h1 className="mt-5 text-[2rem] leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-5xl">
              E se ensinar seu filho sobre Deus pudesse começar com apenas{" "}
              <span className="text-gold">5 minutos por dia</span>?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-90 sm:text-base lg:text-lg">
              Sementes de Fé é um material cristão infantil criado para ajudar pais e responsáveis a
              transformar pequenos momentos do dia em conversas simples e significativas sobre Deus,
              Jesus, oração e valores.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-3xl">
            <VslPlayer />
          </div>

          <div className="mt-7 flex flex-col items-center">
            <CheckoutButton location="hero">Quero conhecer o Sementes de Fé</CheckoutButton>
            <p className="mt-3 text-xs opacity-80 sm:text-sm">
              Pagamento seguro · acesso digital · garantia de 7 dias
            </p>
            {PROMO_END_AT === null && (
              <p className="mt-1 text-[0.7rem] tracking-wide text-gold uppercase">
                Preço promocional de lançamento
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 4-5. IDENTIFICAÇÃO + PROBLEMA */}
      <section className="surface-warm py-11 sm:py-20">
        <div className="section-shell grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-terracotta">Talvez você se reconheça aqui</p>
            <h2 className="mt-3 text-2xl leading-tight text-balance sm:text-3xl lg:text-4xl">
              Você quer ensinar valores para seu filho, mas nem sempre sabe como começar?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              O dia passa rápido. Entre trabalho, escola, casa e telas, aquele momento de conversa
              que você gostaria de ter com a criança acaba ficando para depois. Não é falta de amor —
              é falta de um caminho pronto para começar.
            </p>
            <div className="mt-6 rounded-2xl border border-gold/40 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <p className="font-display text-lg leading-snug sm:text-xl">
                Você não precisa ser especialista em Bíblia.
                <br />
                Você não precisa preparar uma aula.
                <br />
                <span className="text-primary">
                  Você só precisa de alguns minutos e disposição para estar presente.
                </span>
              </p>
            </div>
          </div>
          <ul className="grid gap-3">
            {[
              "A rotina é corrida e sobra pouco tempo em família.",
              "A criança se distrai fácil e o assunto se perde.",
              "É difícil transformar um ensinamento em conversa.",
              "Você não sabe por onde começar nem que palavras usar.",
              "Existe a vontade sincera de criar momentos melhores em casa.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm shadow-[var(--shadow-soft)] sm:text-base"
              >
                <span className="mt-1 size-2 shrink-0 rounded-full bg-terracotta" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. NOVA POSSIBILIDADE */}
      <section className="py-11 sm:py-20">
        <div className="section-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-terracotta">Nova possibilidade</p>
            <h2 className="mt-3 text-2xl text-balance sm:text-3xl lg:text-4xl">
              Talvez não precise parecer uma aula.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Cada conversa do Sementes de Fé foi pensada para ser curta, leve e possível dentro da
              rotina real — com um caminho simples do início ao fim.
            </p>
          </div>
          <ol className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["História", "Uma leitura curta que prende a atenção."],
              ["Pergunta", "Um convite para a criança falar."],
              ["Conversa", "O diálogo acontece sem roteiro rígido."],
              ["Oração", "Um momento simples, em palavras da criança."],
              ["Aplicação", "Algo pequeno para viver no dia seguinte."],
            ].map(([title, desc], i) => (
              <li
                key={title}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <span className="eyebrow text-gold-foreground/70">Passo {i + 1}</span>
                <h3 className="mt-1 text-lg">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-7 text-center text-sm font-bold text-primary sm:text-base">
            Aproximadamente 5 minutos por conversa.
          </p>
        </div>
      </section>

      {/* 7. APRESENTAÇÃO */}
      <section className="bg-secondary/60 py-11 sm:py-20">
        <div className="section-shell grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <p className="eyebrow text-terracotta">O material</p>
            <h2 className="mt-3 text-2xl text-balance sm:text-3xl lg:text-4xl">
              Conheça o Sementes de Fé
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Um material criado para ajudar famílias a conversar sobre fé de maneira simples,
              próxima e adequada à infância.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["4", "jornadas temáticas"],
                ["40", "conversas de ~5 min"],
                ["100%", "digital e imprimível"],
                ["Vitalício", "com atualizações"],
              ].map(([k, v]) => (
                <div key={v} className="rounded-xl border border-gold/40 bg-card px-4 py-3">
                  <dt className="font-display text-xl text-primary">{k}</dt>
                  <dd className="text-xs text-muted-foreground sm:text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="order-1 lg:order-2">
            {EBOOK_MOCKUP_URL ? (
              <img
                src={EBOOK_MOCKUP_URL}
                alt="Capa do e-book Sementes de Fé"
                width={1183}
                height={1345}
                loading="lazy"
                className="mx-auto w-full max-w-md rounded-3xl shadow-[var(--shadow-lift)]"
              />
            ) : (
              <div
                className="grid place-items-center rounded-3xl border-2 border-dashed border-gold/60 bg-card px-6 text-center"
                style={{ aspectRatio: "4 / 3" }}
              >
                <div>
                  <BookIcon className="mx-auto size-10 text-primary/70" />
                  <p className="mt-3 text-sm font-bold">[INSERIR MOCKUP REAL]</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Espaço reservado para a imagem real do e-book.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. AS 4 JORNADAS */}
      <section className="py-11 sm:py-20">
        <div className="section-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-terracotta">O que está dentro</p>
            <h2 className="mt-3 text-2xl text-balance sm:text-3xl lg:text-4xl">
              4 jornadas, 40 conversas
            </h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {JOURNEYS.map(({ n, title, desc, icon: Icon }) => (
              <article
                key={n}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="min-w-0">
                    <span className="font-display text-3xl text-gold">{n}</span>
                    <h3 className="mt-1 text-xl leading-tight">{title}</h3>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                    <Icon className="size-5" />
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">{desc}</p>
                <p className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    10 conversas
                  </span>
                  <span className="rounded-full bg-terracotta/10 px-3 py-1 text-terracotta">
                    ~5 minutos cada
                  </span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 9. COMO FUNCIONA */}
      <section className="surface-warm py-11 sm:py-20">
        <div className="section-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-terracotta">Como funciona</p>
            <h2 className="mt-3 text-2xl text-balance sm:text-3xl lg:text-4xl">
              Três passos, nenhum preparo
            </h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Escolha um momento tranquilo.", "Antes de dormir, depois do jantar ou em outro ponto calmo da rotina."],
              ["02", "Abra uma das conversas.", "Tudo já está pronto: história, pergunta, oração e aplicação."],
              ["03", "Converse com a criança por alguns minutos.", "Sem pressa e sem cobrança — o valor está na presença."],
            ].map(([n, title, desc]) => (
              <div key={n} className="rounded-2xl bg-card p-6 shadow-[var(--shadow-soft)]">
                <span className="font-display text-4xl text-primary/25">{n}</span>
                <h3 className="mt-2 text-lg leading-snug">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. DEMONSTRAÇÃO */}
      <section className="py-11 sm:py-20">
        <div className="section-shell max-w-3xl">
          <div className="text-center">
            <p className="eyebrow text-terracotta">Demonstração</p>
            <h2 className="mt-3 text-2xl text-balance sm:text-3xl lg:text-4xl">
              Como é uma conversa por dentro
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Esta é a estrutura que se repete nas 40 conversas.
            </p>
          </div>
          <div className="mt-8 rounded-3xl border border-gold/40 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <span className="eyebrow text-gold-foreground/70">Estrutura de cada conversa</span>
            <div className="mt-4 space-y-4">
              {[
                ["História curta", "Uma leitura de poucos minutos, escrita em linguagem infantil."],
                ["Pergunta para a criança", "Um convite simples para ela se expressar."],
                ["Momento de conversa", "Espaço para ouvir, sem respostas certas ou erradas."],
                ["Oração", "Uma oração breve, em palavras que a criança entende."],
                ["Aplicação no dia a dia", "Uma pequena atitude para praticar durante a semana."],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0">
                    <p className="font-bold">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 11. BÔNUS */}
      <section className="surface-deep py-11 sm:py-20">
        <div className="section-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold">Bônus incluídos</p>
            <h2 className="mt-3 text-2xl text-balance sm:text-3xl lg:text-4xl">
              E você ainda recebe 2 materiais para continuar essa experiência
            </h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              ["Bônus 1", "Caderno de Atividades", "40 páginas para a criança fixar o que conversou.", "R$ 47"],
              ["Bônus 2", "Plano de Leitura", "30 dias com um caminho pronto para seguir em família.", "R$ 37"],
              ["Incluído", "Acesso vitalício + atualizações", "Você recebe as próximas versões sem pagar de novo.", "Grátis"],
            ].map(([tag, title, desc, price]) => (
              <div
                key={title}
                className="rounded-2xl border border-gold/30 bg-primary-foreground/8 p-6 backdrop-blur"
              >
                <span className="eyebrow rounded-full bg-gold px-3 py-1 text-gold-foreground">
                  {tag}
                </span>
                <h3 className="mt-3 text-xl leading-tight">{title}</h3>
                <p className="mt-2 text-sm opacity-85">{desc}</p>
                <p className="mt-4 font-display text-2xl text-gold">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. AUTORIA */}
      <section className="py-11 sm:py-20">
        <div className="section-shell max-w-3xl text-center">
          <p className="eyebrow text-terracotta">Quem criou</p>
          <h2 className="mt-3 text-2xl text-balance sm:text-3xl lg:text-4xl">
            Criado pensando na rotina real das famílias.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            O Sementes de Fé nasceu de uma pergunta simples: como falar de Deus com uma criança de 6
            a 10 anos em poucos minutos, sem transformar isso em aula? Por isso o material é curto,
            direto e pensado para pais e responsáveis comuns — não para especialistas.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Nenhuma história de origem é apresentada aqui como fato sem confirmação. Informações de
            autoria adicionais podem ser incluídas quando verificadas.
          </p>
        </div>
      </section>

      {/* 13. PROVA SOCIAL REAL */}
      <section className="surface-warm py-11 sm:py-20">
        <div className="section-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-terracotta">Prova social</p>
            <h2 className="mt-3 text-2xl text-balance sm:text-3xl lg:text-4xl">
              O que famílias estão dizendo
            </h2>
          </div>
          {TESTIMONIALS.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {TESTIMONIALS.map((t) => (
                <blockquote
                  key={t.name}
                  className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
                >
                  <p className="text-sm sm:text-base">“{t.text}”</p>
                  <footer className="mt-3 text-sm font-bold text-primary">{t.name}</footer>
                </blockquote>
              ))}
            </div>
          ) : (
            <figure className="mx-auto mt-8 max-w-3xl">
              <img
                src={provaSocialAsset.url}
                alt="Depoimentos demonstrativos de leitores sobre o e-book Sementes de Fé"
                width={1536}
                height={1024}
                loading="lazy"
                className="w-full rounded-2xl border border-gold/40 shadow-[var(--shadow-soft)]"
              />
              <figcaption className="mt-3 text-center text-xs text-muted-foreground">
                Depoimentos demonstrativos de leitores.
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* 14. OFERTA */}
      <section id="oferta" className="py-11 sm:py-20">
        <div className="section-shell max-w-3xl">
          <div className="text-center">
            <p className="eyebrow text-terracotta">A oferta</p>
            <h2 className="mt-3 text-2xl text-balance sm:text-3xl lg:text-4xl">
              Tudo isso por menos do que você provavelmente gastaria em uma refeição simples.
            </h2>
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-gold/50 bg-card shadow-[var(--shadow-lift)]">
            <ul className="divide-y divide-border p-6 sm:p-8">
              {[
                ["E-book Sementes de Fé", "R$ 67"],
                ["Caderno de atividades", "R$ 47"],
                ["Plano de leitura de 30 dias", "R$ 37"],
              ].map(([item, price]) => (
                <li key={item} className="flex items-center justify-between gap-4 py-3 text-sm sm:text-base">
                  <span className="min-w-0">{item}</span>
                  <span className="shrink-0 font-bold text-muted-foreground">{price}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 py-3 text-sm sm:text-base">
                <span>Valor total</span>
                <span className="shrink-0 font-bold text-muted-foreground line-through">R$ 151</span>
              </li>
            </ul>
            <div className="bg-secondary/70 px-6 py-8 text-center sm:px-8">
              <p className="eyebrow text-terracotta">Hoje, preço promocional de lançamento</p>
              <p className="mt-2 font-display text-5xl text-primary sm:text-6xl">R$ 27,90</p>
              <p className="mt-1 text-sm text-muted-foreground">ou 3x de R$ 9,90 no cartão</p>
              <div className="mt-6 flex flex-col items-center">
                <CheckoutButton location="oferta">Quero começar agora</CheckoutButton>
                <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
                  Entrega imediata por e-mail · acesso vitalício
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15. GARANTIA */}
      <section className="pb-14 sm:pb-20">
        <div className="section-shell max-w-3xl">
          <div className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:p-8">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <span className="font-display text-lg leading-none">7d</span>
            </span>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl">
                Você tem 7 dias para conhecer o material com tranquilidade.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Se você perceber que o Sementes de Fé não faz sentido para sua família, solicite o
                reembolso dentro do prazo de garantia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 16. FAQ */}
      <section className="surface-warm py-11 sm:py-20">
        <div className="section-shell max-w-3xl">
          <div className="text-center">
            <p className="eyebrow text-terracotta">Dúvidas frequentes</p>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl">Perguntas comuns</h2>
          </div>
          <Accordion type="single" collapsible className="mt-7">
            {FAQ.map(([q, a]) => (
              <AccordionItem key={q} value={q} className="border-b border-border">
                <AccordionTrigger className="text-left text-base font-bold hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground sm:text-base">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 17. CTA FINAL */}
      <section className="surface-deep py-14 text-center sm:py-20">
        <div className="section-shell max-w-2xl">
          <h2 className="text-2xl text-balance sm:text-3xl lg:text-4xl">
            Comece hoje com apenas 5 minutos.
          </h2>
          <p className="mt-4 text-sm opacity-90 sm:text-base">
            40 conversas prontas sobre Deus, Jesus, oração e valores — mais o caderno de atividades e
            o plano de leitura de 30 dias.
          </p>
          <div className="mt-7 flex flex-col items-center">
            <CheckoutButton location="cta_final">Quero começar agora</CheckoutButton>
            <p className="mt-3 text-xs opacity-80 sm:text-sm">
              R$ 27,90 ou 3x de R$ 9,90 · entrega imediata · garantia de 7 dias
            </p>
          </div>
        </div>
      </section>

      {/* 18. FOOTER */}
      <footer className="border-t border-border bg-card py-8">
        <div className="section-shell flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <p className="font-display text-base text-primary">Sementes de Fé</p>
          <p>Material cristão infantil digital para famílias com crianças de 6 a 10 anos.</p>
          <p>
            Este material é um apoio às conversas em família e não substitui a educação dada pelos
            pais ou responsáveis.
          </p>
          <p>© {new Date().getFullYear()} Sementes de Fé. Todos os direitos reservados.</p>
        </div>
      </footer>

      <StickyCta />
    </main>
  );
}

/* Ícones inline (leves, sem biblioteca extra) */
function SeedIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props} aria-hidden="true">
      <path d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
      <path d="M12 12v6" />
    </svg>
  );
}
function LeafIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props} aria-hidden="true">
      <path d="M5 19c0-8 5-13 14-14 1 9-4 15-12 15H5Z" />
      <path d="M5 19c3-4 7-6 11-7" />
    </svg>
  );
}
function SunIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10L5.6 18.4" />
    </svg>
  );
}
function BookIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props} aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
      <path d="M19 18v3H6.5" />
    </svg>
  );
}
