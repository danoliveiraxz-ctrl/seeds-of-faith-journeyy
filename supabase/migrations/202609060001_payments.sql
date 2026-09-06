create table public.events (
 id uuid primary key default gen_random_uuid(), name text not null,
 event_date date not null, venue text not null
);
create table public.products (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events,
 sector text not null, ticket_type text not null,
 price_cents integer not null check(price_cents > 0), active boolean not null default false
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users,
 request_id uuid not null, status text not null default 'pending' check(status in ('pending','paid','cancelled')),
 amount_cents integer not null check(amount_cents > 0),
 created_at timestamptz not null default now(), paid_at timestamptz,
 unique(user_id,request_id)
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders,
 product_id uuid not null references public.products, quantity integer not null check(quantity between 1 and 10),
 unit_price_cents integer not null check(unit_price_cents > 0),
 sector text not null, ticket_type text not null, event_date date not null
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders,
 provider text not null default 'panterapay', transaction_id text unique,
 amount_cents integer not null check(amount_cents > 0),
 status text not null default 'creating' check(status in ('creating','pending','paid','review')),
 qr_code_base64 text, copy_paste text, expires_at timestamptz,
 fee jsonb, store_id text, provider_status text, approved_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.tickets (
 id uuid primary key default gen_random_uuid(), order_item_id uuid not null references public.order_items,
 ordinal integer not null check(ordinal > 0), code uuid not null unique default gen_random_uuid(),
 status text not null default 'pending_delivery' check(status in ('pending_delivery','valid','used','cancelled')),
 used_at timestamptz, unique(order_item_id,ordinal)
);
alter table public.events enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;
revoke all on public.events,public.products,public.orders,public.order_items,public.payments,public.tickets from anon,authenticated;
grant all on public.events,public.products,public.orders,public.order_items,public.payments,public.tickets to service_role;
grant select on public.events,public.products,public.orders,public.order_items to authenticated;
create policy events_read on public.events for select to authenticated using(true);
create policy products_read on public.products for select to authenticated using(active);
create policy orders_read on public.orders for select to authenticated using(user_id=auth.uid());
create policy items_read on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create index orders_user_idx on public.orders(user_id);
create index order_items_order_idx on public.order_items(order_id);
-- Single-product order; prices and ticket details are exclusively database-owned.
create function public.prepare_panterapay_order(p_user uuid,p_request uuid,p_product uuid,p_quantity integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o orders; p products; d date;
begin
 if p_quantity is null or p_quantity < 1 or p_quantity > 10 then raise exception 'Invalid quantity'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 select * into o from orders where user_id=p_user and request_id=p_request;
 if found then
   if not exists(select 1 from order_items where order_id=o.id and product_id=p_product and quantity=p_quantity) then raise exception 'Idempotency conflict'; end if;
   return jsonb_build_object('id',o.id,'amount',o.amount_cents,'created',false);
 end if;
 if exists(select 1 from orders where user_id=p_user and created_at>now()-interval '30 seconds') then raise exception 'Please wait before creating another order'; end if;
 select * into p from products where id=p_product and active for share;
 if not found then raise exception 'Product unavailable'; end if;
 select event_date into d from events where id=p.event_id;
 insert into orders(user_id,request_id,amount_cents) values(p_user,p_request,p.price_cents*p_quantity) returning * into o;
 insert into order_items(order_id,product_id,quantity,unit_price_cents,sector,ticket_type,event_date)
 values(o.id,p.id,p_quantity,p.price_cents,p.sector,p.ticket_type,d);
 insert into payments(order_id,amount_cents) values(o.id,o.amount_cents);
 return jsonb_build_object('id',o.id,'amount',o.amount_cents,'created',true);
end $$;
-- INTERNAL ONLY. Call only after a documented verifier authenticates payment.approved.
-- No ticket issuance: delivery of original event tickets is a separate integration.
create function public.approve_panterapay_payment(p_transaction text)
returns boolean language plpgsql security definer set search_path=public as $$
declare p payments; o orders;
begin
 select * into p from payments where transaction_id=p_transaction for update;
 if not found then raise exception 'Unknown transaction'; end if;
 if p.status='paid' then return false; end if;
 select * into o from orders where id=p.order_id for update;
 if p.status<>'pending' or o.status<>'pending' or o.amount_cents<>p.amount_cents then raise exception 'Payment requires review'; end if;
 update payments set status='paid',approved_at=now() where id=p.id;
 update orders set status='paid',paid_at=now() where id=o.id;
 return true;
end $$;
revoke all on function public.prepare_panterapay_order(uuid,uuid,uuid,integer) from public,anon,authenticated;
revoke all on function public.approve_panterapay_payment(text) from public,anon,authenticated;
grant execute on function public.prepare_panterapay_order(uuid,uuid,uuid,integer) to service_role;
grant execute on function public.approve_panterapay_payment(text) to service_role;
