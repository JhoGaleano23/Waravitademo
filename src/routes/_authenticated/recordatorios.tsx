import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, ErrorBox, Loading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { mensajeError, perfilQuery, plantasQuery, recordatoriosQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/recordatorios")({
  head: () => ({ meta: [{ title: "Recordatorios — WaraVita" }, { name: "description", content: "Riego, abono y revisión de tus plantas." }] }),
  component: Recordatorios,
});

const TIPOS = { riego: "💧 Riego", abono: "🌱 Abono", revision: "🔍 Revisión" } as const;
const hoyISO = () => new Date().toLocaleDateString("en-CA");

function Recordatorios() {
  const qc = useQueryClient();
  const perfil = useQuery(perfilQuery);
  const plantas = useQuery(plantasQuery);
  const recs = useQuery(recordatoriosQuery);
  const [plantaId, setPlantaId] = useState("");
  const [tipo, setTipo] = useState<keyof typeof TIPOS>("riego");
  const [fecha, setFecha] = useState(hoyISO());

  if (perfil.isLoading || recs.isLoading) return <AppShell><Loading /></AppShell>;
  if (recs.error) return <AppShell><ErrorBox error={recs.error} /></AppShell>;
  const premium = perfil.data?.plan === "premium";
  const hoy = hoyISO();
  const semana = new Date(Date.now() + 7 * 864e5).toLocaleDateString("en-CA");
  const lista = recs.data ?? [];
  const grupos = [
    { t: "Hoy", items: lista.filter((r) => !r.completado && r.fecha <= hoy) },
    { t: "Esta semana", items: lista.filter((r) => !r.completado && r.fecha > hoy && r.fecha <= semana) },
    { t: "Más adelante", items: lista.filter((r) => !r.completado && r.fecha > semana) },
    { t: "Completados", items: lista.filter((r) => r.completado) },
  ];

  async function crear() {
    const pid = plantaId || plantas.data?.[0]?.id;
    if (!pid) return toast.error("Primero adquiere una planta.");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("recordatorios").insert({ user_id: u.user!.id, planta_id: pid, tipo, fecha });
    if (error) return toast.error(mensajeError(error));
    qc.invalidateQueries({ queryKey: ["recordatorios"] });
    toast.success("Recordatorio creado ⏰");
  }
  async function toggle(id: string, completado: boolean) {
    const { error } = await supabase.from("recordatorios").update({ completado }).eq("id", id);
    if (error) return toast.error(mensajeError(error));
    qc.invalidateQueries({ queryKey: ["recordatorios"] });
  }
  async function borrar(id: string) {
    await supabase.from("recordatorios").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["recordatorios"] });
  }

  return (
    <AppShell>
      <h1 className="mx-5 text-2xl font-extrabold">Recordatorios</h1>
      {!premium ? (
        <div className="mx-5 mt-4 rounded-3xl bg-warning p-5 text-warning-foreground">
          <p className="font-extrabold">Los recordatorios son parte de WaraVita Premium</p>
          <p className="mt-1 text-sm">Recibe avisos de riego, abono y revisión para cada planta.</p>
          <Link to="/perfil"><Button className="mt-3 rounded-full font-bold">Activar Premium</Button></Link>
        </div>
      ) : (
        <div className="mx-5 mt-4 space-y-3 rounded-3xl bg-surface p-4">
          <select value={plantaId} onChange={(e) => setPlantaId(e.target.value)} className="h-11 w-full rounded-2xl border bg-background px-3 text-sm">
            {(plantas.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.nombre_personalizado}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TIPOS) as (keyof typeof TIPOS)[]).map((k) => (
              <button key={k} onClick={() => setTipo(k)} className={cn("rounded-xl border bg-background py-2 text-xs font-bold", tipo === k && "border-primary bg-soft text-primary")}>{TIPOS[k]}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="h-11 rounded-2xl bg-background" />
            <Button onClick={crear} className="h-11 shrink-0 rounded-full font-bold">Agregar</Button>
          </div>
        </div>
      )}
      {grupos.map((g) => (
        <section key={g.t} className="mx-5 mt-6">
          <h2 className="font-extrabold">{g.t}</h2>
          {g.items.length === 0 ? <p className="mt-1 text-sm text-muted-foreground">Nada por aquí.</p> : (
            <ul className="mt-2 space-y-2">
              {g.items.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-2xl border p-3">
                  <Checkbox checked={r.completado} onCheckedChange={(v) => toggle(r.id, !!v)} aria-label="Marcar como hecho" />
                  <div className={cn("min-w-0 flex-1", r.completado && "text-muted-foreground line-through")}>
                    <p className="text-sm font-bold">{TIPOS[r.tipo as keyof typeof TIPOS]} · {r.planta?.nombre_personalizado}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.fecha + "T00:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" })}</p>
                  </div>
                  <button aria-label="Eliminar" onClick={() => borrar(r.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </AppShell>
  );
}
