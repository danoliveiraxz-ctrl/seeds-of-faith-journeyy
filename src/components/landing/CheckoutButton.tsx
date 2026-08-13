import { CHECKOUT_URL, isPlaceholder } from "@/config/site";
import { buildCheckoutUrl, track } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  size?: "md" | "lg";
  variant?: "primary" | "gold";
  location: string;
};

export function CheckoutButton({
  children,
  className,
  size = "lg",
  variant = "gold",
  location,
}: Props) {
  const pending = isPlaceholder(CHECKOUT_URL);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track("InitiateCheckout", { content_name: "Sementes de Fé", value: 27.9, currency: "BRL" });
    if (pending) {
      e.preventDefault();
      return;
    }
    e.currentTarget.href = buildCheckoutUrl(CHECKOUT_URL);
  };

  return (
    <a
      href={pending ? "#oferta" : CHECKOUT_URL}
      onClick={handleClick}
      data-checkout-location={location}
      aria-disabled={pending}
      className={cn(
        "inline-flex w-full max-w-md items-center justify-center rounded-full text-center font-extrabold tracking-tight shadow-[var(--shadow-lift)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0",
        size === "lg" ? "px-7 py-4 text-base sm:text-lg" : "px-6 py-3 text-sm sm:text-base",
        variant === "gold"
          ? "bg-terracotta text-terracotta-foreground hover:bg-terracotta/92"
          : "bg-primary text-primary-foreground hover:bg-primary/92",
        className,
      )}
    >
      {children}
    </a>
  );
}
