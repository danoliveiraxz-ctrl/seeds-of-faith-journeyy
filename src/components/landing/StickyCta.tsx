import { useEffect, useState } from "react";
import { CheckoutButton } from "./CheckoutButton";

/** CTA sticky discreto no mobile, exibido após a primeira seção. */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-gold/40 bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <CheckoutButton location="sticky_mobile" size="md" className="max-w-none">
        Quero conhecer o Sementes de Fé
      </CheckoutButton>
      <p className="mt-1.5 text-center text-[0.68rem] text-muted-foreground">
        R$ 19,99 · pagamento seguro · garantia de 7 dias
      </p>
    </div>
  );
}
