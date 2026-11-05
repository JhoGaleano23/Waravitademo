
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default 'Guardián',
  plan text not null default 'gratis' check (plan in ('gratis','premium')),
  analisis_mes int not null default 0,
  mes_analisis text not null default to_char(now(),'YYYY-MM'),
  created_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant update (nombre) on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "perfil propio select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "perfil propio update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre) values (new.id, coalesce(nullif(new.raw_user_meta_data->>'nombre',''),'Guardián'));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.especies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre_comun text not null,
  nombre_cientifico text not null,
  endemica boolean not null default false,
  ecosistema text not null,
  descripcion text not null default '',
  luz text not null, luz_nivel int not null default 3,
  riego text not null, riego_nivel int not null default 3,
  sustrato text not null, sustrato_nivel int not null default 3,
  orden int not null default 0
);
grant select on public.especies to anon, authenticated;
grant all on public.especies to service_role;
alter table public.especies enable row level security;
create policy "especies publicas" on public.especies for select to anon, authenticated using (true);

create table public.kits (
  id uuid primary key default gen_random_uuid(),
  especie_id uuid not null references public.especies(id) on delete cascade,
  nombre text not null,
  precio int not null,
  descripcion text not null default '',
  destacado boolean not null default false
);
grant select on public.kits to anon, authenticated;
grant all on public.kits to service_role;
alter table public.kits enable row level security;
create policy "kits publicos" on public.kits for select to anon, authenticated using (true);

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  total int not null,
  estado text not null default 'confirmado',
  created_at timestamptz not null default now()
);
grant select on public.pedidos to authenticated;
grant all on public.pedidos to service_role;
alter table public.pedidos enable row level security;
create policy "pedidos propios" on public.pedidos for select to authenticated using (auth.uid() = user_id);

create table public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  user_id uuid not null,
  kit_id uuid not null references public.kits(id),
  cantidad int not null default 1,
  precio int not null
);
grant select on public.pedido_items to authenticated;
grant all on public.pedido_items to service_role;
alter table public.pedido_items enable row level security;
create policy "items propios" on public.pedido_items for select to authenticated using (auth.uid() = user_id);

create table public.plantas_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  especie_id uuid not null references public.especies(id),
  nombre_personalizado text not null,
  fecha_siembra date not null default current_date,
  etapa text not null default 'germinacion' check (etapa in ('germinacion','plantula','floracion')),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.plantas_usuario to authenticated;
grant all on public.plantas_usuario to service_role;
alter table public.plantas_usuario enable row level security;
create policy "plantas propias" on public.plantas_usuario for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.registros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  planta_id uuid not null references public.plantas_usuario(id) on delete cascade,
  foto_path text,
  diagnostico jsonb,
  acciones text[] not null default '{}',
  nota text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.registros to authenticated;
grant all on public.registros to service_role;
alter table public.registros enable row level security;
create policy "registros propios" on public.registros for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.recordatorios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  planta_id uuid not null references public.plantas_usuario(id) on delete cascade,
  tipo text not null check (tipo in ('riego','abono','revision')),
  fecha date not null,
  completado boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.recordatorios to authenticated;
grant all on public.recordatorios to service_role;
alter table public.recordatorios enable row level security;
create policy "recordatorios propios" on public.recordatorios for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "fotos propias select" on storage.objects for select to authenticated using (bucket_id='fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos propias insert" on storage.objects for insert to authenticated with check (bucket_id='fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos propias delete" on storage.objects for delete to authenticated using (bucket_id='fotos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Compra simulada: crea pedido, items y plantas desbloqueadas
create or replace function public.confirmar_pedido(_kit_ids uuid[]) returns uuid
language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _pid uuid; _total int; k record;
begin
  if _uid is null then raise exception 'No autenticado'; end if;
  if coalesce(array_length(_kit_ids,1),0) = 0 then raise exception 'Carrito vacío'; end if;
  select coalesce(sum(precio),0) into _total from kits, unnest(_kit_ids) as x(id) where kits.id = x.id;
  insert into pedidos(user_id,total) values (_uid,_total) returning id into _pid;
  for k in select kits.id, kits.precio, kits.especie_id, e.nombre_comun from unnest(_kit_ids) as x(id) join kits on kits.id = x.id join especies e on e.id = kits.especie_id loop
    insert into pedido_items(pedido_id,user_id,kit_id,precio) values (_pid,_uid,k.id,k.precio);
    insert into plantas_usuario(user_id,especie_id,nombre_personalizado) values (_uid,k.especie_id,'Mi '||k.nombre_comun);
  end loop;
  return _pid;
end; $$;
revoke all on function public.confirmar_pedido(uuid[]) from public, anon;
grant execute on function public.confirmar_pedido(uuid[]) to authenticated;

create or replace function public.activar_premium() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'No autenticado'; end if;
  update profiles set plan = 'premium' where id = auth.uid();
end; $$;
revoke all on function public.activar_premium() from public, anon;
grant execute on function public.activar_premium() to authenticated;

-- Consume un análisis; devuelve false si el plan gratis llegó a 5 en el mes
create or replace function public.consumir_analisis() returns boolean
language plpgsql security definer set search_path = public as $$
declare p profiles; _mes text := to_char(now(),'YYYY-MM');
begin
  select * into p from profiles where id = auth.uid() for update;
  if p.id is null then raise exception 'No autenticado'; end if;
  if p.mes_analisis <> _mes then
    update profiles set analisis_mes = 0, mes_analisis = _mes where id = p.id;
    p.analisis_mes := 0;
  end if;
  if p.plan = 'gratis' and p.analisis_mes >= 5 then return false; end if;
  update profiles set analisis_mes = analisis_mes + 1 where id = p.id;
  return true;
end; $$;
revoke all on function public.consumir_analisis() from public, anon;
grant execute on function public.consumir_analisis() to authenticated;

insert into public.especies (slug,nombre_comun,nombre_cientifico,endemica,ecosistema,descripcion,luz,luz_nivel,riego,riego_nivel,sustrato,sustrato_nivel,orden) values
('salvia-bogotana','Salvia bogotana','Salvia bogotensis',true,'Bosque Andino','Arbusto de flores azul violeta que atrae colibríes. Endémica de la sabana de Bogotá.','Sol directo o semisombra',4,'Riego moderado (2-3 veces/sem)',3,'Sustrato con buen drenaje',4,1),
('peperomia','Peperomia','Peperomia bogotensis',true,'Bosque Andino','Pequeña planta de hojas carnosas, ideal para interiores luminosos.','Luz indirecta brillante',3,'Riego bajo (1 vez/sem)',2,'Sustrato aireado con corteza',4,2),
('palma-de-cera','Palma de cera','Ceroxylon quindiuense',true,'Bosque Andino','Árbol nacional de Colombia, la palma más alta del mundo.','Sol directo',5,'Riego moderado',3,'Suelo profundo y fértil',3,3),
('frailejon','Frailejón','Espeletia grandiflora',true,'Páramo','Guardián del agua de los páramos, con hojas cubiertas de pelusa.','Sol pleno',5,'Riego bajo, alta humedad ambiental',2,'Suelo ácido y orgánico',3,4),
('mortino','Mortiño','Vaccinium meridionale',false,'Bosque Andino','Arbusto de frutos morados comestibles, muy rico en antioxidantes.','Sol o semisombra',4,'Riego moderado',3,'Suelo ácido',3,5),
('siete-cueros','Siete cueros','Tibouchina lepidota',false,'Bosque Andino','Árbol ornamental de flores moradas intensas.','Sol directo',4,'Riego frecuente',4,'Suelo fértil y húmedo',3,6),
('orquidea-cattleya','Flor de mayo','Cattleya trianae',true,'Bosque de niebla','Flor nacional de Colombia, orquídea epífita de gran belleza.','Luz indirecta brillante',3,'Riego bajo con alta humedad',2,'Corteza de pino',5,7),
('cucharo','Cucharo','Myrsine guianensis',false,'Bosque Andino','Árbol pionero ideal para restauración ecológica.','Sol directo',4,'Riego moderado',3,'Suelo común bien drenado',3,8);

insert into public.kits (especie_id,nombre,precio,descripcion,destacado)
select id, 'Kit siembra '||nombre_comun,
  case slug when 'salvia-bogotana' then 35000 when 'peperomia' then 25000 when 'palma-de-cera' then 55000 when 'frailejon' then 60000 when 'mortino' then 30000 when 'siete-cueros' then 40000 when 'orquidea-cattleya' then 48000 else 28000 end,
  'Incluye semillas o esqueje, sustrato, maceta biodegradable y guía de cuidado.',
  slug in ('salvia-bogotana','peperomia','orquidea-cattleya','frailejon')
from public.especies;
