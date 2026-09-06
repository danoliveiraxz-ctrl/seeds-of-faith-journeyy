-- Prevent new checkout orders for the cancelled October 30 session.
-- Existing historical rows are kept intact.
create or replace function public.create_sigilopay_order(
  p_date date,
  p_quantity integer,
  p_sector text,
  p_ticket_type text
)
returns table(id uuid, external_id text, amount_cents integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  created_order public.checkout_orders;
  ticket_price integer;
begin
  if p_date not in ('2026-10-28', '2026-10-31') then
    raise exception 'Invalid event date';
  end if;

  if p_quantity is null or p_quantity <> 1 then
    raise exception 'Invalid quantity';
  end if;

  if p_sector not in ('Pista', 'Arquibancada') then
    raise exception 'Invalid sector';
  end if;

  if p_ticket_type not in ('inteira', 'meia') then
    raise exception 'Invalid ticket type';
  end if;

  ticket_price := case when p_ticket_type = 'meia' then 59900 else 99900 end;

  insert into public.checkout_orders(
    external_id,
    event_date,
    quantity,
    unit_price_cents,
    amount_cents,
    sector,
    ticket_type
  )
  values (
    'KPT-' || gen_random_uuid()::text,
    p_date,
    p_quantity,
    ticket_price,
    p_quantity * ticket_price,
    p_sector,
    p_ticket_type
  )
  returning * into created_order;

  return query
  select created_order.id, created_order.external_id, created_order.amount_cents;
end;
$$;

revoke all on function public.create_sigilopay_order(date, integer, text, text)
from public, anon, authenticated;
grant execute on function public.create_sigilopay_order(date, integer, text, text)
to service_role;
