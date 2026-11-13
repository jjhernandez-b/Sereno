-- Sereno · esquema de Supabase
-- Ejecuta este archivo en el SQL Editor del proyecto:
-- Supabase Dashboard → SQL Editor → New query → Run.
--
-- La API usa la service role key desde el servidor. Esa clave omite RLS y
-- nunca debe exponerse en el navegador ni en variables con prefijo VITE_.

create table if not exists public.contact_requests (
  reference text primary key,
  created_at timestamptz not null default now(),
  professional_slug text not null,
  professional_name text not null,
  full_name text not null,
  email text not null,
  phone text not null default '',
  age_range text not null,
  country text not null default '',
  reason text not null,
  message text not null,
  preferred_time text not null,
  modality text not null,
  status text not null default 'new',
  source text not null default 'web'
);

comment on table public.contact_requests is
  'Solicitudes de primera conversación recibidas desde la web. Contiene datos personales y de salud.';

comment on column public.contact_requests.reference is
  'Referencia pública mostrada a la persona (formato SR-XXXXXX).';
comment on column public.contact_requests.status is
  'Estado de gestión: new, contacted, closed, etc.';
comment on column public.contact_requests.source is
  'Canal de origen de la solicitud: web, app, etc.';

create index if not exists contact_requests_created_at_idx
  on public.contact_requests (created_at desc);

create index if not exists contact_requests_status_idx
  on public.contact_requests (status);

alter table public.contact_requests enable row level security;

-- Sin políticas para anon/authenticated: solo el backend con service_role
-- puede acceder a las solicitudes.
revoke all on table public.contact_requests from anon, authenticated;
grant select, insert, update, delete on table public.contact_requests to service_role;

-- Retención: elimina solicitudes anteriores al periodo indicado (180 días
-- por defecto). Devuelve cuántas filas se borraron.
create or replace function public.delete_expired_contact_requests(retention_days integer default 180)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.contact_requests
  where created_at < now() - make_interval(days => greatest(retention_days, 1));

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.delete_expired_contact_requests(integer)
  from public, anon, authenticated;
grant execute on function public.delete_expired_contact_requests(integer) to service_role;

-- Limpieza automática diaria (opcional; requiere la extensión pg_cron,
-- disponible en Supabase):
-- select cron.schedule(
--   'sereno-cleanup',
--   '0 3 * * *',
--   $$select public.delete_expired_contact_requests(180)$$
-- );
