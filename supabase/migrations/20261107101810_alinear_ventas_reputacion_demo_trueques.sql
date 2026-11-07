-- Alinea desarrollo con las reglas de ventas, publicaciones demo y reputacion de trueques.
-- Esta migracion fue aplicada y verificada en moreno-cerca-dev (njjyhzphylrpfwmkbjfi).
-- No ejecutar en produccion hasta completar las pruebas funcionales y aprobar el PR.

alter table public.publicaciones
  add column if not exists es_demo boolean not null default false;

alter table public.opiniones
  alter column contacto_id drop not null;

alter table public.opiniones
  add column if not exists propuesta_id uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid='public.opiniones'::regclass and conname='opiniones_propuesta_id_fkey') then
    alter table public.opiniones
      add constraint opiniones_propuesta_id_fkey
      foreign key (propuesta_id) references public.propuestas_trueque(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.opiniones'::regclass and conname='opiniones_no_autovaloracion') then
    alter table public.opiniones
      add constraint opiniones_no_autovaloracion check (autor_id <> vendedor_id);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.opiniones'::regclass and conname='opiniones_origen_check') then
    alter table public.opiniones
      add constraint opiniones_origen_check check (num_nonnulls(contacto_id, propuesta_id) = 1);
  end if;
end $$;

create unique index if not exists opiniones_una_por_autor_y_propuesta
  on public.opiniones (propuesta_id, autor_id)
  where propuesta_id is not null;

create or replace function privado.opinion_verificada()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  c public.contactos;
  p public.propuestas_trueque;
  v_uid uuid := (select auth.uid());
begin
  if new.propuesta_id is not null then
    select * into p from public.propuestas_trueque where id = new.propuesta_id;
    if p.id is null or p.estado <> 'confirmada' then
      raise exception 'Solo podés valorar un intercambio confirmado por ambas partes';
    end if;
    if v_uid is not null and v_uid not in (p.proponente, p.destinatario) then
      raise exception 'Solo las partes del intercambio pueden valorar';
    end if;
    new.autor_id := coalesce(v_uid, new.autor_id);
    if new.autor_id not in (p.proponente, p.destinatario) then
      raise exception 'Autor inválido';
    end if;
    new.vendedor_id := case when new.autor_id = p.proponente then p.destinatario else p.proponente end;
    new.contacto_id := null;
    return new;
  end if;

  select * into c from public.contactos where id = new.contacto_id;
  if c.id is null or c.estado <> 'confirmado' then
    raise exception 'Solo se puede opinar sobre operaciones confirmadas por el vendedor';
  end if;
  if v_uid is not null and c.comprador_id <> v_uid then
    raise exception 'Solo el comprador de la operación puede opinar';
  end if;
  new.autor_id := c.comprador_id;
  new.vendedor_id := c.vendedor_id;
  return new;
end
$function$;

create or replace function privado.opinion_aviso()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.propuesta_id is not null then
    perform privado.avisar(new.vendedor_id, 'valoracion_recibida', 'Un vecino valoró tu intercambio', new.propuesta_id);
  end if;
  return null;
end
$function$;

drop trigger if exists opiniones_aviso on public.opiniones;
create trigger opiniones_aviso
after insert on public.opiniones
for each row execute function privado.opinion_aviso();

create or replace function privado.proteger_es_demo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if coalesce(current_setting('app.bypass_guard', true), '') <> '1' then
    if tg_op = 'INSERT' then
      new.es_demo := false;
    else
      new.es_demo := old.es_demo;
    end if;
  end if;
  return new;
end
$function$;

drop trigger if exists publicaciones_proteger_demo on public.publicaciones;
create trigger publicaciones_proteger_demo
before insert or update on public.publicaciones
for each row execute function privado.proteger_es_demo();

create or replace function privado.propuesta_no_demo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if exists (
    select 1 from public.publicaciones
    where es_demo
      and id in (new.publicacion_destino, coalesce(new.publicacion_ofrecida, new.publicacion_destino))
  ) then
    raise exception 'Esta publicación es de demostración (BETA) y no admite propuestas';
  end if;
  return new;
end
$function$;

drop trigger if exists propuestas_no_demo on public.propuestas_trueque;
create trigger propuestas_no_demo
before insert on public.propuestas_trueque
for each row execute function privado.propuesta_no_demo();

create or replace function public.contactar_publicacion(p_publicacion uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_pub public.publicaciones;
  v_wa text;
  v_cid uuid;
begin
  if v_uid is null then raise exception 'Necesitás iniciar sesión para contactar al vendedor'; end if;
  select * into v_pub from public.publicaciones where id = p_publicacion and estado = 'publicada';
  if v_pub.id is null then raise exception 'La publicación no está disponible'; end if;
  if v_pub.es_demo then raise exception 'Esta publicación es de demostración (BETA) y no admite contacto'; end if;
  if v_pub.vendedor_id = v_uid then raise exception 'No podés contactarte con vos mismo'; end if;
  if privado.hay_bloqueo(v_uid, v_pub.vendedor_id) then raise exception 'No podés contactar a este vecino'; end if;
  if exists (select 1 from public.perfiles where id = v_uid and suspendido) then
    raise exception 'Tu cuenta está suspendida';
  end if;
  if (select count(*) from public.contactos where comprador_id = v_uid and creado_en > now() - interval '1 hour') >= 20 then
    raise exception 'Hiciste muchos contactos en poco tiempo. Probá más tarde';
  end if;
  select pc.whatsapp into v_wa from public.perfiles_contacto pc where pc.user_id = v_pub.vendedor_id;
  if v_wa is null then raise exception 'El vendedor todavía no cargó su WhatsApp'; end if;
  insert into public.contactos (publicacion_id, comprador_id, vendedor_id)
  values (v_pub.id, v_uid, v_pub.vendedor_id)
  on conflict (publicacion_id, comprador_id) do update set publicacion_id = excluded.publicacion_id
  returning id into v_cid;
  return jsonb_build_object('whatsapp', v_wa, 'contacto_id', v_cid);
end
$function$;

create or replace function privado.propuesta_antes_insertar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_pub public.publicaciones;
  v_orig public.propuestas_trueque;
  v_op uuid;
  v_np uuid;
begin
  if (select auth.uid()) is null then raise exception 'Necesitás iniciar sesión'; end if;
  new.proponente := (select auth.uid());
  new.estado := 'pendiente';
  new.confirmo_proponente := false;
  new.confirmo_destinatario := false;

  if exists (select 1 from public.perfiles where id = new.proponente and suspendido) then
    raise exception 'Tu cuenta está suspendida';
  end if;
  if (select count(*) from public.propuestas_trueque where proponente = new.proponente and creado_en > now() - interval '1 hour') >= 20 then
    raise exception 'Hiciste muchas propuestas en poco tiempo. Probá más tarde';
  end if;

  select * into v_pub from public.publicaciones where id = new.publicacion_destino and estado = 'publicada';
  if v_pub.id is null or v_pub.modalidad_trueque is null then
    raise exception 'Esta publicación no acepta trueques';
  end if;
  if new.modalidad = 'mano_a_mano' and v_pub.modalidad_trueque = 'con_efectivo' then
    raise exception 'Esta publicación solo acepta trueque con diferencia en efectivo';
  end if;
  if new.modalidad = 'con_efectivo' and v_pub.modalidad_trueque = 'solo_mano_a_mano' then
    raise exception 'Esta publicación solo acepta trueque mano a mano';
  end if;
  if new.publicacion_ofrecida is not null and not exists (
    select 1 from public.publicaciones
    where id = new.publicacion_ofrecida and vendedor_id = new.proponente and estado = 'publicada'
  ) then
    raise exception 'Solo podés ofrecer tus propias publicaciones activas';
  end if;

  if new.contrapropuesta_de is null then
    new.destinatario := v_pub.vendedor_id;
    if new.paga = 'destinatario' then
      raise exception 'Solo podés ofrecer efectivo de tu parte';
    end if;
  else
    select * into v_orig from public.propuestas_trueque where id = new.contrapropuesta_de;
    if v_orig.id is null or v_orig.destinatario <> new.proponente or v_orig.estado <> 'pendiente'
       or v_orig.publicacion_destino <> new.publicacion_destino then
      raise exception 'Contrapropuesta inválida';
    end if;
    new.destinatario := v_orig.proponente;
    v_op := case v_orig.paga when 'proponente' then v_orig.proponente when 'destinatario' then v_orig.destinatario end;
    v_np := case new.paga when 'proponente' then new.proponente when 'destinatario' then new.destinatario end;
    if v_op is not null and v_op <> new.proponente then
      if new.efectivo_monto is distinct from v_orig.efectivo_monto or v_np is distinct from v_op then
        raise exception 'El monto en efectivo solo lo puede modificar quien lo ofrece';
      end if;
    elsif v_np is not null and v_np <> new.proponente then
      raise exception 'Solo podés ofrecer efectivo de tu parte';
    end if;
    update public.propuestas_trueque set estado = 'contrapropuesta', actualizado_en = now() where id = v_orig.id;
  end if;

  if new.proponente = new.destinatario then raise exception 'No podés proponerte un trueque con vos mismo'; end if;
  return new;
end
$function$;
