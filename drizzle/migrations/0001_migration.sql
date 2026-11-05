
drop policy "recordatorios propios" on public.recordatorios;
create policy "recordatorios select" on public.recordatorios for select to authenticated using (auth.uid() = user_id);
create policy "recordatorios update" on public.recordatorios for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recordatorios delete" on public.recordatorios for delete to authenticated using (auth.uid() = user_id);
create policy "recordatorios insert premium" on public.recordatorios for insert to authenticated
  with check (auth.uid() = user_id and exists (select 1 from public.profiles p where p.id = auth.uid() and p.plan = 'premium')
    and exists (select 1 from public.plantas_usuario pl where pl.id = planta_id and pl.user_id = auth.uid()));
drop policy "registros propios" on public.registros;
create policy "registros select" on public.registros for select to authenticated using (auth.uid() = user_id);
create policy "registros delete" on public.registros for delete to authenticated using (auth.uid() = user_id);
create policy "registros insert" on public.registros for insert to authenticated
  with check (auth.uid() = user_id and exists (select 1 from public.plantas_usuario pl where pl.id = planta_id and pl.user_id = auth.uid()));
