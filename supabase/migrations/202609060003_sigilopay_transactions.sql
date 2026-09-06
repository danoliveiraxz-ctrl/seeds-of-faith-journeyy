create table public.sigilopay_transactions (
  transaction_id text primary key,
  order_id uuid references public.checkout_orders(id),
  offer_code text not null,
  transaction_status text not null check (transaction_status in ('COMPLETED','FAILED','PENDING','REFUNDED','CHARGED_BACK')),
  payment_method text not null check (payment_method in ('CREDIT_CARD','PIX','BOLETO','CRYPTO')),
  amount numeric not null,
  currency text not null,
  client_id text not null,
  created_at_provider timestamptz not null,
  received_at timestamptz not null default now()
);
create index sigilopay_transactions_order_idx on public.sigilopay_transactions(order_id);
alter table public.sigilopay_transactions enable row level security;
revoke all on public.sigilopay_transactions from anon, authenticated;
grant all on public.sigilopay_transactions to service_role;
