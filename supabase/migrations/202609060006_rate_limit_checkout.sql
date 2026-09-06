-- Limits public checkout creation without storing the visitor IP itself.
create table if not exists public.checkout_rate_limits (
  actor_hash text primary key check (actor_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1 check (attempts >= 1),
  updated_at timestamptz not null default now()
);

alter table public.checkout_rate_limits enable row level security;
revoke all on public.checkout_rate_limits from anon, authenticated;
grant all on public.checkout_rate_limits to service_role;

create or replace function public.consume_checkout_rate_limit(p_actor_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_attempts integer;
begin
  if p_actor_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;

  insert into public.checkout_rate_limits(actor_hash, window_started_at, attempts, updated_at)
  values (p_actor_hash, now(), 1, now())
  on conflict (actor_hash) do update
    set attempts = case
          when public.checkout_rate_limits.window_started_at < now() - interval '10 minutes' then 1
          else public.checkout_rate_limits.attempts + 1
        end,
        window_started_at = case
          when public.checkout_rate_limits.window_started_at < now() - interval '10 minutes' then now()
          else public.checkout_rate_limits.window_started_at
        end,
        updated_at = now()
  returning attempts into current_attempts;

  return current_attempts <= 5;
end;
$$;

revoke all on function public.consume_checkout_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_checkout_rate_limit(text) to service_role;
