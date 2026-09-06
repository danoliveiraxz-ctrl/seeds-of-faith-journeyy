-- Accept half-price tickets while preserving existing historical orders.
begin;

alter table public.checkout_orders
  drop constraint if exists checkout_orders_unit_price_cents_check;

alter table public.checkout_orders
  add constraint checkout_orders_unit_price_cents_check
  check (unit_price_cents in (59900, 99900, 100000));

commit;
