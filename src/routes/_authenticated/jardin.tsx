import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Leaf, Lock, Star } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell, ErrorBox, LevelBar, Loading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { especiesQuery, perfilQuery, plantasQuery } from "@/lib/data";
import { especieImg } from "@/lib/especies-img";
import { etapaLabel, mesesDesde } from "@/lib/reglas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/jardin")({
  validateSearch: z.object({ tab: z.enum(["nuevas", "herbario"]).optional(), nuevo: z.number().optional() }),
  head: () => ({ meta: [{ title: "Mi jardín — WaraVita" }, { name: "description", content: "Tu colección de flora nativa." }] }),
  component: Jardin,
});

function Jardin() {
  const { tab = "nuevas", nuevo = 0 } = Route.useSearch();
  const navigate = useNavigate({ from: "/jardin" });
  const plantas = useQuery(plantasQuery);
  const especies = useQuery(especiesQuery);
  const perfil = useQuery(perfilQuery);
  const [detalle, setDetalle] = useState<string | null>(null);

  if (plantas.isLoading || especies.isLoading) return <AppShell><Loading /></AppShell>;
  if (plantas.error || especies.error) return <AppShell><ErrorBox error={plantas.error || especies.error} /></AppShell>;

  const misEspecies = new Set(plantas.data!.map((p) => p.especie_id));
  const total = especies.data!.length;
  const pct = total ? Math.round((misEspecies.size / total) * 100) : 0;
  const bloqueadas = especies.data!.filter((e) => !misEspecies.has(e.id));
  const premium = perfil.data?.plan === "premium";
  const esp = especies.data!.find((e) => e.id === detalle);

  const tabBtn = (on: boolean) => cn("flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold", on ? "border-primary bg-primary text-primary-foreground" : "");

  return (
    <AppShell>
      <section className="mx-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-bold"><Star className="h-5 w-5 text-primary" /> Progreso de Colección</p>
          <span className="font-extrabold text-primary">{pct}%</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{misEspecies.size} de {total} especies desbloqueadas</p>
        <Progress value={pct} className="mt-2 h-2 bg-surface" />
      </section>

      <div className="mx-5 mt-5 flex gap-3">
        <button className={tabBtn(tab === "nuevas")} onClick={() => navigate({ search: { tab: "nuevas" } })}><Leaf className="h-4 w-4" /> Mis Plantas nuevas</button>
        <button className={tabBtn(tab === "herbario")} onClick={() => navigate({ search: { tab: "herbario" } })}><BookOpen className="h-4 w-4" /> Herbario Total</button>
      </div>

      {tab === "nuevas" ? (
        <>
          <h2 className="mx-5 mt-6 text-xl font-extrabold">Mis Coleccionables</h2>
          {plantas.data!.length === 0 && (
            <div className="mx-5 mt-3 rounded-3xl bg-soft p-5 text-center">
              <p className="font-bold">Aún no tienes plantas, ¡adquiere tu primer kit! 🌱</p>
              <Link to="/tienda"><Button className="mt-3 rounded-full font-bold">Ir a la tienda</Button></Link>
            </div>
          )}
          <div className="mx-5 mt-3 grid grid-cols-2 gap-3">
            {plantas.data!.map((p, i) => (
              <Link key={p.id} to="/planta/$id" params={{ id: p.id }} className={cn("overflow-hidden rounded-2xl border bg-card", i < nuevo && "animate-unlock")} style={{ animationDelay: `${i * 120}ms` }}>
                <img src={especieImg(p.especie?.slug)} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                <div className="p-3">
                  <p className="truncate font-extrabold">{p.nombre_personalizado}</p>
                  <p className="truncate text-xs italic text-muted-foreground">{p.especie?.nombre_comun}</p>
                  <span className="mt-2 inline-block rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold">
                    {etapaLabel(p.etapa)} (Mes {mesesDesde(p.fecha_siembra) + 1})
                  </span>
                </div>
              </Link>
            ))}
            {bloqueadas.slice(0, Math.max(2, 4 - plantas.data!.length)).map((e) => <Bloqueada key={e.id} />)}
          </div>
        </>
      ) : (
        <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
          {especies.data!.map((e) => {
            const own = misEspecies.has(e.id);
            return own ? (
              <button key={e.id} onClick={() => setDetalle(e.id)} className="overflow-hidden rounded-2xl border text-left">
                <img src={especieImg(e.slug)} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                <div className="p-3">
                  <p className="truncate font-extrabold">{e.nombre_comun}</p>
                  <p className="truncate text-xs italic text-muted-foreground">{e.nombre_cientifico}</p>
                </div>
              </button>
            ) : <Bloqueada key={e.id} />;
          })}
        </div>
      )}

      <Dialog open={!!esp} onOpenChange={(o) => !o && setDetalle(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          {esp && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold">{esp.nombre_comun}</DialogTitle>
                <p className="text-sm italic text-muted-foreground">{esp.nombre_cientifico}</p>
              </DialogHeader>
              <img src={especieImg(esp.slug)} alt="" className="h-40 w-full rounded-2xl object-cover" />
              <div className="space-y-2 rounded-2xl bg-surface p-4 text-sm">
                {[["☀️", esp.luz, esp.luz_nivel], ["💧", esp.riego, esp.riego_nivel], ["🪴", esp.sustrato, esp.sustrato_nivel]].map(([i, t, n]) => (
                  <div key={String(t)} className="flex items-center justify-between gap-3"><span>{i} {t}</span><LevelBar nivel={Number(n)} /></div>
                ))}
              </div>
              {premium ? (
                <p className="text-sm">{esp.descripcion} <span className="font-bold">Ecosistema: {esp.ecosistema}.</span> {esp.endemica && "Especie endémica de Colombia."}</p>
              ) : (
                <p className="rounded-2xl bg-warning p-3 text-xs text-warning-foreground">Enciclopedia completa disponible con WaraVita Premium.</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Bloqueada() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-surface">
      <div className="grid aspect-square place-items-center bg-disabled/60">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-background/70"><Lock className="h-6 w-6 text-muted-foreground" /></span>
      </div>
      <div className="p-3">
        <p className="font-extrabold text-muted-foreground">Especie oculta</p>
        <p className="text-xs text-muted-foreground">Adquiere el kit</p>
        <Link to="/tienda" className="mt-2 block rounded-full bg-disabled py-1 text-center text-xs font-bold text-muted-foreground">Bloqueado</Link>
      </div>
    </div>
  );
}
