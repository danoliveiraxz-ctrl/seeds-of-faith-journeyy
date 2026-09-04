import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Instagram,
  Menu,
  Phone,
  Ruler,
  ShieldCheck,
  Star,
  Truck,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casa Forma | Móveis que transformam ambientes" },
      {
        name: "description",
        content:
          "Móveis selecionados para sala, quarto e jantar. Design, conforto e entrega segura.",
      },
    ],
  }),
  component: LandingPage,
});

const WHATSAPP = "5585999999999";

const products = [
  {
    name: "Sofá Nuvem 3 Lugares",
    category: "Sala",
    price: "R$ 3.490",
    installment: "10x de R$ 349",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85",
    badge: "Mais vendido",
  },
  {
    name: "Poltrona Aura",
    category: "Sala",
    price: "R$ 1.290",
    installment: "10x de R$ 129",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85",
    badge: "Novo",
  },
  {
    name: "Mesa Íris 6 Lugares",
    category: "Jantar",
    price: "R$ 2.790",
    installment: "10x de R$ 279",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85",
    badge: "Pronta entrega",
  },
  {
    name: "Cama Serena Queen",
    category: "Quarto",
    price: "R$ 2.390",
    installment: "10x de R$ 239",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85",
    badge: "Conforto premium",
  },
  {
    name: "Aparador Linha",
    category: "Jantar",
    price: "R$ 1.190",
    installment: "10x de R$ 119",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85",
    badge: "Design autoral",
  },
  {
    name: "Mesa de Cabeceira Alba",
    category: "Quarto",
    price: "R$ 690",
    installment: "10x de R$ 69",
    image:
      "https://images.unsplash.com/photo-1532372320572-cda25653a694?auto=format&fit=crop&w=1000&q=85",
    badge: "Últimas unidades",
  },
];

const categories = ["Todos", "Sala", "Jantar", "Quarto"];

function openWhatsApp(message: string) {
  window.open(
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("Todos");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("Quero ajuda para escolher");

  const visibleProducts =
    category === "Todos"
      ? products
      : products.filter((product) => product.category === category);

  const chooseProduct = (productName: string) => {
    setInterest(productName);
    document.getElementById("orcamento")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="furniture-site">
      <header className="furniture-header">
        <div className="furniture-shell header-inner">
          <a className="furniture-brand" href="#inicio" aria-label="Casa Forma, início">
            CASA<span>FORMA</span>
          </a>

          <nav
            className={menuOpen ? "furniture-nav is-open" : "furniture-nav"}
            aria-label="Navegação principal"
          >
            <a href="#colecao" onClick={() => setMenuOpen(false)}>Coleção</a>
            <a href="#sobre" onClick={() => setMenuOpen(false)}>Nossa essência</a>
            <a href="#avaliacoes" onClick={() => setMenuOpen(false)}>Avaliações</a>
            <a className="nav-cta" href="#orcamento" onClick={() => setMenuOpen(false)}>
              Pedir orçamento
            </a>
          </nav>

          <button
            className="furniture-menu"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <section className="furniture-hero" id="inicio">
        <div className="furniture-shell hero-layout">
          <div className="furniture-hero-copy">
            <p className="furniture-kicker">Design para viver bem</p>
            <h1>Sua casa merece contar a sua história.</h1>
            <p>
              Móveis que unem beleza, conforto e funcionalidade para transformar
              cada ambiente em um lugar verdadeiramente seu.
            </p>
            <div className="furniture-actions">
              <a className="furniture-button primary" href="#colecao">
                Conhecer coleção <ArrowRight size={18} />
              </a>
              <button
                className="furniture-button secondary"
                type="button"
                onClick={() => openWhatsApp("Olá! Gostaria de ajuda para escolher meus móveis.")}
              >
                Falar com especialista
              </button>
            </div>
            <div className="hero-proof">
              <span><Check size={16} /> Entrega segura</span>
              <span><Check size={16} /> 12 meses de garantia</span>
              <span><Check size={16} /> Até 10x sem juros</span>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=90"
              alt="Sala contemporânea decorada com móveis em tons naturais"
            />
            <div className="hero-note">
              <strong>Feito para durar</strong>
              <span>Materiais selecionados e acabamento cuidadoso.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="furniture-section collection-section" id="colecao">
        <div className="furniture-shell">
          <div className="furniture-heading">
            <div>
              <p className="furniture-kicker">Escolhas para cada ambiente</p>
              <h2>Descubra a coleção</h2>
            </div>
            <p>
              Peças versáteis, com linhas atemporais e materiais que deixam a casa
              mais acolhedora.
            </p>
          </div>

          <div className="category-filter" aria-label="Filtrar produtos por ambiente">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.name}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  <span>{product.badge}</span>
                </div>
                <div className="product-info">
                  <p>{product.category}</p>
                  <h3>{product.name}</h3>
                  <div className="product-price">
                    <strong>{product.price}</strong>
                    <small>{product.installment} sem juros</small>
                  </div>
                  <button type="button" onClick={() => chooseProduct(product.name)}>
                    Quero este móvel <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="furniture-section essence-section" id="sobre">
        <div className="furniture-shell essence-grid">
          <div className="essence-image">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"
              alt="Ambiente elegante com móveis de madeira e tons neutros"
              loading="lazy"
            />
          </div>
          <div className="essence-copy">
            <p className="furniture-kicker">Nossa essência</p>
            <h2>Design bonito. Rotina mais leve.</h2>
            <p>
              Acreditamos que um bom móvel vai além da aparência. Ele organiza,
              acolhe e acompanha os momentos mais importantes da vida.
            </p>
            <div className="feature-list">
              <article><Ruler /><div><h3>Medidas que funcionam</h3><p>Orientação para escolher peças proporcionais ao seu espaço.</p></div></article>
              <article><ShieldCheck /><div><h3>Compra protegida</h3><p>Garantia e suporte antes, durante e depois da entrega.</p></div></article>
              <article><Truck /><div><h3>Entrega cuidadosa</h3><p>Acompanhamento do pedido até chegar à sua casa.</p></div></article>
            </div>
          </div>
        </div>
      </section>

      <section className="furniture-section reviews-section" id="avaliacoes">
        <div className="furniture-shell">
          <div className="furniture-heading centered">
            <div>
              <p className="furniture-kicker">Casas transformadas</p>
              <h2>Quem comprou, recomenda</h2>
            </div>
          </div>
          <div className="review-grid">
            {[
              ["O sofá mudou completamente a sala. É confortável, bonito e chegou antes do prazo.", "Mariana S."],
              ["Recebi orientação pelo WhatsApp e consegui escolher a mesa certa para meu apartamento.", "Felipe A."],
              ["Acabamento impecável e atendimento muito atencioso do pedido até a montagem.", "Carla M."],
            ].map(([text, author]) => (
              <article key={author}>
                <div className="stars" aria-label="5 estrelas">
                  {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={16} fill="currentColor" />)}
                </div>
                <p>“{text}”</p>
                <strong>{author}</strong>
                <span>Cliente Casa Forma</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="budget-section" id="orcamento">
        <div className="furniture-shell budget-grid">
          <div>
            <p className="furniture-kicker">Atendimento personalizado</p>
            <h2>Vamos transformar seu ambiente?</h2>
            <p>
              Conte o que você procura e receba opções, medidas e condições
              diretamente pelo WhatsApp.
            </p>
            <a href="tel:+5585999999999"><Phone size={18} /> (85) 99999-9999</a>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              openWhatsApp(
                `Olá! Meu nome é ${name}. Tenho interesse em: ${interest}. Gostaria de receber um orçamento.`,
              );
            }}
          >
            <label>
              Seu nome
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Como podemos te chamar?"
              />
            </label>
            <label>
              Seu WhatsApp
              <input required inputMode="tel" placeholder="(85) 99999-9999" />
            </label>
            <label className="wide-field">
              O que você procura?
              <select value={interest} onChange={(event) => setInterest(event.target.value)}>
                <option>Quero ajuda para escolher</option>
                {products.map((product) => <option key={product.name}>{product.name}</option>)}
              </select>
            </label>
            <button className="wide-field" type="submit">
              Receber orçamento no WhatsApp <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      <footer className="furniture-footer">
        <div className="furniture-shell footer-content">
          <div>
            <a className="furniture-brand" href="#inicio">CASA<span>FORMA</span></a>
            <p>Móveis para uma casa com mais beleza, conforto e significado.</p>
          </div>
          <div>
            <strong>Atendimento</strong>
            <p>Segunda a sábado · 8h às 18h</p>
            <p>Fortaleza, Ceará</p>
          </div>
          <a href="#" aria-label="Instagram da Casa Forma"><Instagram /> Instagram</a>
        </div>
        <div className="furniture-shell footer-bottom">
          © {new Date().getFullYear()} Casa Forma. Todos os direitos reservados.
        </div>
      </footer>

      <button
        className="furniture-whatsapp"
        type="button"
        onClick={() => openWhatsApp("Olá! Gostaria de conhecer os móveis disponíveis.")}
        aria-label="Falar com a Casa Forma pelo WhatsApp"
      >
        <Phone />
      </button>
    </main>
  );
}
