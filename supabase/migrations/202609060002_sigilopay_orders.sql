create table public.checkout_orders (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  event_date date not null check (event_date in ('2026-10-28','2026-10-30','2026-10-31')),
  quantity integer not null check (quantity between 1 and 10),
  unit_price_cents integer not null default 100000 check (unit_price_cents = 100000),
  amount_cents integer not null check (amount_cents = quantity * unit_price_cents),
  status text not null default 'checkout_created' check (status in ('checkout_created','paid','cancelled','review')),
  gateway_product_id text,
  gateway_offer_code text,
  checkout_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index checkout_orders_external_id_idx on public.checkout_orders(external_id);
alter table public.checkout_orders enable row level security;
revoke all on public.checkout_orders from anon, authenticated;
grant all on public.checkout_orders to service_role;
create function public.create_sigilopay_order(p_date date, p_quantity integer)
returns table(id uuid, external_id text, amount_cents integer)
language plpgsql security definer set search_path = public as $$
declare created_order checkout_orders;
begin
  if p_date not in ('2026-10-28','2026-10-30','2026-10-31') then raise exception 'Invalid event date'; end if;
  if p_quantity is null or p_quantity < 1 or p_quantity > 10 then raise exception 'Invalid quantity'; end if;
  insert into checkout_orders(external_id,event_date,quantity,amount_cents)
  values ('KPT-' || gen_random_uuid()::text, p_date, p_quantity, p_quantity * 100000)
  returning * into created_order;
  return query select created_order.id, created_order.external_id, created_order.amount_cents;
end;
$$;
revoke all on function public.create_sigilopay_order(date,integer) from public, anon, authenticated;
grant execute on function public.create_sigilopay_order(date,integer) to service_role;
