alter table public.checkout_orders
  drop constraint checkout_orders_unit_price_cents_check;

alter table public.checkout_orders
  alter column unit_price_cents set default 99900;

alter table public.checkout_orders
  add constraint checkout_orders_unit_price_cents_check
  check (unit_price_cents = 99900);

create or replace function public.create_sigilopay_order(p_date date, p_quantity integer)
returns table(id uuid, external_id text, amount_cents integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  created_order checkout_orders;
begin
  if p_date not in ('2026-10-28','2026-10-30','2026-10-31') then
    raise exception 'Invalid event date';
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 1 then
    raise exception 'Invalid quantity';
  end if;

  insert into checkout_orders (
    external_id,
    event_date,
    quantity,
    unit_price_cents,
    amount_cents
  )
  values (
    'KPT-' || gen_random_uuid()::text,
    p_date,
    p_quantity,
    99900,
    p_quantity * 99900
  )
  returning * into created_order;

  return query
  select created_order.id, created_order.external_id, created_order.amount_cents;
end;
$$;