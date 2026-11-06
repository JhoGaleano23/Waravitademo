import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, Check, Droplets, Flower2, Pencil, Sprout, Sun, CircleSlash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, ErrorBox, LevelBar, Loading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { mensajeError, plantaQuery, registrosQuery } from "@/lib/data";
import { especieImg } from "@/lib/especies-img";
import { ETAPAS, fechaLarga, mesesDesde } from "@/lib/reglas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/planta/$id")({
  head: () => ({ meta: [{ title: "Ficha de planta — WaraVita" }, { name: "description", content: "Cuidados y evolución de tu planta." }] }),
  component: Ficha,
});

function Ficha() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const planta = useQuery(plantaQuery(id));
  const registros = useQuery(registrosQuery(id));
  const [edit, setEdit] = useState(false);
  const [nombre, setNombre] = useState("");
  const [etapa, setEtapa] = useState("germinacion");

  if (planta.isLoading) return <AppShell header={false}><Loading /></AppShell>;
  if (planta.error) return <AppShell header={false}><ErrorBox error={planta.error} /></AppShell>;
  const p = planta.data;
  if (!p) return <AppShell><p className="mx-5 mt-10 text-center">Esta planta no existe.</p></AppShell>;
  const e = p.especie!;
  const meses = mesesDesde(p.fecha_siembra);
  const idx = ETAPAS.findIndex((x) => x.id === p.etapa);

  async function guardar() {
    const { error } = await supabase.from("plantas_usuario").update({ nombre_personalizado: nombre.trim() || p!.nombre_personalizado, etapa: etapa as never }).eq("id", id);
    if (error) return toast.error(mensajeError(error));
    qc.invalidateQueries({ queryKey: ["planta", id] });
    qc.invalidateQueries({ queryKey: ["plantas"] });
    setEdit(false);
    toast.success("Planta actualizada");
  }

  const reqs = [
    { icon: Sun, t: e.luz, n: e.luz_nivel },
    { icon: Droplets, t: e.riego, n: e.riego_nivel },
    { icon: CircleSlash, t: e.sustrato, n: e.sustrato_nivel },
  ];
  const iconos = [Check, Sprout, Flower2];

  return (
    <AppShell header={false}>
      <header className="flex items-center justify-between px-5 pt-5">
        <Link to="/jardin" aria-label="Volver"><ArrowLeft className="h-6 w-6" /></Link>
        <button aria-label="Editar" onClick={() => { setNombre(p.nombre_personalizado); setEtapa(p.etapa); setEdit(true); }}><Pencil className="h-5 w-5" /></button>
      </header>
      <section className="px-5 pt-2">
        <h1 className="text-3xl font-extrabold">{p.nombre_personalizado}</h1>
        <p className="mt-1 font-bold text-primary">{e.nombre_comun} <span className="text-muted-foreground">·</span> <span className="italic font-normal text-muted-foreground">{e.nombre_cientifico}</span></p>
        <p className="text-xs text-muted-foreground">Sembrada el {fechaLarga(p.fecha_siembra)} · {meses === 0 ? "este mes" : `${meses} ${meses === 1 ? "mes" : "meses"}`} contigo</p>
      </section>

      <div className="relative mt-2">
        <img src={especieImg(e.slug)} alt={e.nombre_comun} className="mx-auto h-64 w-full object-contain" />
        <div className="absolute top-4 right-5 flex flex-col items-end gap-1">
          {e.endemica && <span className="rounded-full border bg-background px-3 py-0.5 text-xs font-bold">Endémica</span>}
          <span className="rounded-full border bg-background px-3 py-0.5 text-xs font-bold">{e.ecosistema}</span>
        </div>
      </div>

      <section className="mx-5 -mt-4 rounded-3xl bg-surface p-5">
        <p className="text-xs font-extrabold tracking-wider text-muted-foreground uppercase">Requerimientos de cultivo</p>
        <ul className="mt-3 space-y-3">
          {reqs.map(({ icon: I, t, n }) => (
            <li key={t} className="flex items-center gap-3 text-sm">
              <I className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">{t}</span>
              <LevelBar nivel={n} />
            </li>
          ))}
        </ul>
      </section>

      <h2 className="mx-5 mt-6 font-extrabold">Evolución del espécimen</h2>
      <div className="mx-5 mt-4 flex items-start">
        {ETAPAS.map((s, i) => {
          const I = iconos[i];
          const done = i < idx, cur = i === idx;
          return (
            <div key={s.id} className="flex flex-1 items-start">
              <div className="flex w-20 flex-col items-center gap-1">
                <span className={cn("grid h-11 w-11 place-items-center rounded-full", done || cur ? "bg-primary text-primary-foreground" : "border bg-surface text-disabled", cur && "ring-4 ring-soft")}>
                  <I className="h-5 w-5" />
                </span>
                <span className={cn("text-xs", cur ? "font-extrabold" : done ? "text-primary" : "text-disabled")}>{s.label}</span>
              </div>
              {i < 2 && <div className={cn("mt-5 h-0.5 flex-1", i < idx ? "bg-primary" : "border-t-2 border-dashed border-disabled")} />}
            </div>
          );
        })}
      </div>

      <h2 className="mx-5 mt-6 font-extrabold">Registro fotográfico</h2>
      {registros.isLoading ? <Loading /> : (registros.data ?? []).length === 0 ? (
        <p className="mx-5 mt-2 text-sm text-muted-foreground">Aún no hay fotos. Registra tu primer cuidado 📸</p>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
          {registros.data!.map((r) => {
            const d = r.diagnostico as { vigor?: number; estado?: string } | null;
            return (
              <div key={r.id} className="w-28 shrink-0">
                {r.url ? <img src={r.url} alt="" className="h-28 w-28 rounded-2xl object-cover" /> : <div className="h-28 w-28 rounded-2xl bg-surface" />}
                <p className="mt-1 text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}{d?.vigor != null && ` · ${Math.round(d.vigor)}%`}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mx-5 mt-6 space-y-3">
        <Link to="/diagnostico/$id" params={{ id }}><Button className="h-14 w-full rounded-full text-base font-bold">Registrar cuidado</Button></Link>
        <Link to="/recordatorios"><Button variant="outline" className="h-12 w-full rounded-full font-bold"><Bell className="h-4 w-4" /> Recordatorios</Button></Link>
      </div>

      <Dialog open={edit} onOpenChange={setEdit}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader><DialogTitle>Editar planta</DialogTitle></DialogHeader>
          <Input value={nombre} onChange={(ev) => setNombre(ev.target.value)} placeholder="Nombre personalizado" className="h-12 rounded-2xl" />
          <div className="grid grid-cols-3 gap-2">
            {ETAPAS.map((s) => (
              <button key={s.id} onClick={() => setEtapa(s.id)} className={cn("rounded-xl border py-2 text-xs font-bold", etapa === s.id && "border-primary bg-soft text-primary")}>{s.label}</button>
            ))}
          </div>
          <Button onClick={guardar} className="rounded-full font-bold">Guardar</Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
