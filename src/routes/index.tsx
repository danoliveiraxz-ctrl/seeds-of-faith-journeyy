import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type PointerEvent } from "react";
import { ArrowRight, BadgeCheck, Car, Check, ChevronLeft, ChevronRight, Gauge, Menu, MoveHorizontal, ShieldCheck, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drive Motors | Seu próximo carro está aqui" },
      { name: "description", content: "Seminovos selecionados, financiamento facilitado e atendimento transparente." },
    ],
  }),
  component: LandingPage,
});

const WHATSAPP = "5585999999999";

const civicFrames = [
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=85",
];

const corollaFrames = [
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1605559424843-9e7a4f424b4a?auto=format&fit=crop&w=1200&q=85",
];

const compassFrames = [
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=85",
];

const cars = [
  { name: "Honda Civic Touring", year: "2022", km: "41.000 km", price: "R$ 149.900", tag: "Oferta especial", frames: civicFrames },
  { name: "Toyota Corolla XEi", year: "2023", km: "28.500 km", price: "R$ 139.900", tag: "Baixa quilometragem", frames: corollaFrames },
  { name: "Jeep Compass Limited", year: "2022", km: "35.800 km", price: "R$ 142.900", tag: "SUV completo", frames: compassFrames },
];

type Vehicle = (typeof cars)[number];

function whatsapp(message: string) {
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

function Vehicle360({ car }: { car: Vehicle }) {
  const [frame, setFrame] = useState(0);
  const pointerX = useRef<number | null>(null);
  const dragDistance = useRef(0);

  const changeFrame = (direction: number) => {
    setFrame((current) => (current + direction + car.frames.length) % car.frames.length);
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    pointerX.current = event.clientX;
    dragDistance.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerX.current === null) return;
    const movement = event.clientX - pointerX.current;
    pointerX.current = event.clientX;
    dragDistance.current += movement;

    if (Math.abs(dragDistance.current) >= 28) {
      changeFrame(dragDistance.current > 0 ? -1 : 1);
      dragDistance.current = 0;
    }
  };

  const endDrag = () => {
    pointerX.current = null;
    dragDistance.current = 0;
  };

  return (
    <div
      className="car-photo car-spin"
      role="group"
      aria-label={`Visualização 360 graus do ${car.name}`}
      onPointerDown={startDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") changeFrame(-1);
        if (event.key === "ArrowRight") changeFrame(1);
      }}
      tabIndex={0}
    >
      <img src={car.frames[frame]} alt={`${car.name}, ângulo ${frame + 1} de ${car.frames.length}`} loading="lazy" draggable={false} />
      <span>{car.tag}</span>
      <div className="spin-hint"><MoveHorizontal size={15} /> Arraste para girar</div>
      <div className="spin-controls">
        <button type="button" aria-label={`Ver ângulo anterior do ${car.name}`} onClick={(event) => { event.stopPropagation(); changeFrame(-1); }}><ChevronLeft size={18} /></button>
        <output aria-label={`Ângulo ${frame + 1} de ${car.frames.length}`}>{frame + 1}/{car.frames.length}</output>
        <button type="button" aria-label={`Ver próximo ângulo do ${car.name}`} onClick={(event) => { event.stopPropagation(); changeFrame(1); }}><ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState("Ainda estou escolhendo");
  const [name, setName] = useState("");

  function chooseCar(car: string) {
    setSelected(car);
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="automotive-site">
      <header className="site-header">
        <div className="auto-shell nav-inner">
          <a className="brand" href="#inicio" aria-label="Drive Motors, início">DRIVE<span>MOTORS</span></a>
          <nav className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="Navegação principal">
            <a href="#estoque" onClick={() => setMenuOpen(false)}>Estoque</a>
            <a href="#vantagens" onClick={() => setMenuOpen(false)}>Vantagens</a>
            <a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a>
            <a className="header-cta" href="#contato" onClick={() => setMenuOpen(false)}>Falar com consultor</a>
          </nav>
          <button className="menu-button" onClick={() => setMenuOpen((v) => !v)} aria-label="Abrir menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="auto-hero" id="inicio">
        <div className="hero-shade" />
        <div className="auto-shell hero-copy">
          <p className="auto-eyebrow">Seu novo caminho começa aqui</p>
          <h1>O carro certo para a sua <em>próxima fase.</em></h1>
          <p className="hero-sub">Seminovos selecionados, condições facilitadas e atendimento transparente para você comprar com segurança.</p>
          <div className="hero-actions">
            <a className="btn btn-red" href="#estoque">Ver veículos <ArrowRight size={18} /></a>
            <a className="btn btn-outline" href="#contato">Simular financiamento</a>
          </div>
          <div className="trust-list">
            <span><Check size={16} /> Veículos vistoriados</span>
            <span><Check size={16} /> Financiamento facilitado</span>
            <span><Check size={16} /> Aceitamos seu usado</span>
          </div>
        </div>
      </section>

      <section className="auto-section" id="estoque">
        <div className="auto-shell">
          <div className="section-heading">
            <div><p className="auto-kicker">Destaques do estoque</p><h2>Escolha seu próximo carro</h2></div>
            <p>Arraste a foto de cada veículo para testar a visualização em 360°.</p>
          </div>
          <div className="car-grid">
            {cars.map((car) => (
              <article className="car-card" key={car.name}>
                <Vehicle360 car={car} />
                <div className="car-body">
                  <h3>{car.name}</h3>
                  <div className="car-meta"><span>{car.year}</span><span>{car.km}</span><span>Automático</span></div>
                  <div className="car-price"><small>A partir de</small><strong>{car.price}</strong></div>
                  <button onClick={() => chooseCar(car.name)}>Tenho interesse <ChevronRight size={17} /></button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="auto-section benefits-section" id="vantagens">
        <div className="auto-shell benefits-grid">
          <div>
            <p className="auto-kicker">Compra sem complicação</p>
            <h2>Confiança em cada detalhe</h2>
            <p className="muted-copy">Da escolha do modelo à entrega das chaves, você conta com atendimento próximo e informações claras.</p>
            <div className="stats-grid">
              <div><strong>100%</strong><span>Veículos vistoriados</span></div><div><strong>48x</strong><span>Opções de financiamento</span></div>
              <div><strong>+500</strong><span>Clientes atendidos</span></div><div><strong>5★</strong><span>Atendimento personalizado</span></div>
            </div>
          </div>
          <div className="benefit-cards">
            <article><ShieldCheck /><div><h3>Procedência garantida</h3><p>Histórico verificado e documentação em dia.</p></div></article>
            <article><Car /><div><h3>Seu usado na troca</h3><p>Avaliação justa para facilitar o seu negócio.</p></div></article>
            <article><Gauge /><div><h3>Crédito facilitado</h3><p>Simulação rápida com condições competitivas.</p></div></article>
            <article><BadgeCheck /><div><h3>Pós-venda de verdade</h3><p>Suporte mesmo depois da entrega das chaves.</p></div></article>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contato">
        <div className="auto-shell contact-grid">
          <div><p className="auto-eyebrow">Vamos encontrar o seu?</p><h2>Receba uma proposta personalizada</h2><p>Preencha os dados e fale agora com um consultor pelo WhatsApp.</p></div>
          <form onSubmit={(e) => { e.preventDefault(); whatsapp(`Olá! Meu nome é ${name}. Tenho interesse em ${selected} e gostaria de receber uma proposta.`); }}>
            <label>Seu nome<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" /></label>
            <label>WhatsApp<input required inputMode="tel" placeholder="(85) 99999-9999" /></label>
            <label className="full-field">Veículo de interesse<select value={selected} onChange={(e) => setSelected(e.target.value)}><option>Ainda estou escolhendo</option>{cars.map((car) => <option key={car.name}>{car.name}</option>)}</select></label>
            <button className="full-field" type="submit">Quero falar com um consultor <ArrowRight size={18} /></button>
            <small className="full-field">Seus dados serão usados apenas para este atendimento.</small>
          </form>
        </div>
      </section>

      <footer className="auto-footer"><div className="auto-shell"><a className="brand" href="#inicio">DRIVE<span>MOTORS</span></a><p>© {new Date().getFullYear()} Drive Motors. Todos os direitos reservados.</p><p>Seg–Sáb · 08h às 18h</p></div></footer>
      <button className="whatsapp-float" onClick={() => whatsapp("Olá! Gostaria de conhecer os veículos disponíveis.")} aria-label="Falar pelo WhatsApp">✆</button>
    </main>
  );
}
