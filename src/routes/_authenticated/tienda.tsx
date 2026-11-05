import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { AppShell, ErrorBox, Loading } from "@/components/AppShell";
import { kitsQuery } from "@/lib/data";
import { cn } from "@/lib/utils";
import { KitCard } from "./inicio";

const searchSchema = z.object({
  q: z.string().optional(),
  eco: z.string().optional(),
  endemica: z.boolean().optional(),
});

export const Route = createFileRoute("/_authenticated/tienda")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Tienda — WaraVita" }, { name: "description", content: "Kits de siembra de flora nativa colombiana." }] }),
  component: Tienda,
});

function Tienda() {
  const { q = "", eco, endemica } = Route.useSearch();
  const navigate = useNavigate({ from: "/tienda" });
  const kits = useQuery(kitsQuery);
  const ecos = Array.from(new Set((kits.data ?? []).map((k) => k.especie?.ecosistema).filter(Boolean))) as string[];
  const lista = (kits.data ?? []).filter((k) => {
    const txt = `${k.nombre} ${k.especie?.nombre_cientifico} ${k.especie?.ecosistema}`.toLowerCase();
    return (!q || txt.includes(q.toLowerCase())) && (!eco || k.especie?.ecosistema === eco) && (!endemica || k.especie?.endemica);
  });
  const chip = (on: boolean) => cn("shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "bg-background");

  return (
    <AppShell>
      <h1 className="mx-5 text-2xl font-extrabold">Tienda</h1>
      <div className="mx-5 mt-3 flex items-center gap-3 rounded-full bg-surface px-5 py-3">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => navigate({ search: (p) => ({ ...p, q: e.target.value || undefined }), replace: true })}
          placeholder="Buscar kits o especies..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
        <button className={chip(!eco && !endemica)} onClick={() => navigate({ search: (p) => ({ q: p.q }) })}>Todos</button>
        <button className={chip(!!endemica)} onClick={() => navigate({ search: (p) => ({ ...p, endemica: p.endemica ? undefined : true }) })}>Endémicas</button>
        {ecos.map((e) => (
          <button key={e} className={chip(eco === e)} onClick={() => navigate({ search: (p) => ({ ...p, eco: p.eco === e ? undefined : e }) })}>{e}</button>
        ))}
      </div>
      {kits.isLoading ? <Loading /> : kits.error ? <ErrorBox error={kits.error} /> : lista.length === 0 ? (
        <p className="mx-5 mt-10 text-center text-muted-foreground">No encontramos kits con esa búsqueda 🌾</p>
      ) : (
        <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
          {lista.map((k) => <KitCard key={k.id} kit={k} />)}
        </div>
      )}
    </AppShell>
  );
}
