import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Flower2, Package, Plus, Search, Sprout } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, ErrorBox, Loading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { kitsQuery, type fetchKits } from "@/lib/data";
import { cart } from "@/lib/cart";
import { especieImg } from "@/lib/especies-img";
import { formatoCOP } from "@/lib/reglas";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({ meta: [{ title: "Inicio — WaraVita" }, { name: "description", content: "Kits, especies y guías de flora nativa." }] }),
  component: Inicio,
});

function Inicio() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const kits = useQuery(kitsQuery);
  const accesos = [
    { label: "Kits", icon: Package, to: "/tienda" as const },
    { label: "Plantas", icon: Sprout, to: "/jardin" as const },
    { label: "Floradex", icon: Flower2, to: "/jardin" as const, search: { tab: "herbario" } },
    { label: "Guías", icon: BookOpen, to: "/nosotros" as const },
  ];
  return (
    <AppShell>
      <form
        className="mx-5 flex items-center gap-3 rounded-full bg-surface px-5 py-3"
        onSubmit={(e) => { e.preventDefault(); navigate({ to: "/tienda", search: { q } }); }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar kits, especies o guías..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        <button aria-label="Buscar"><Search className="h-5 w-5" /></button>
      </form>

      <section className="mx-5 mt-5 rounded-3xl bg-accent px-6 py-8 text-center">
        <p className="font-bold text-accent-foreground">Siembra flora nativa Colombiana</p>
        <Link to="/tienda"><Button className="mt-5 rounded-2xl px-6 py-5 font-bold">Explorar Kits</Button></Link>
      </section>

      <section className="mx-5 mt-6 grid grid-cols-4 gap-2">
        {accesos.map(({ label, icon: Icon, to, search }) => (
          <Link key={label} to={to} search={search as never} className="flex flex-col items-center gap-2 text-xs font-bold">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-soft text-primary"><Icon className="h-6 w-6" /></span>
            {label}
          </Link>
        ))}
      </section>

      <h2 className="mx-5 mt-8 text-lg font-extrabold">Catálogo Destacado</h2>
      {kits.isLoading ? <Loading /> : kits.error ? <ErrorBox error={kits.error} /> : (
        <div className="mx-5 mt-3 grid grid-cols-2 gap-3">
          {kits.data!.filter((k) => k.destacado).map((k) => <KitCard key={k.id} kit={k} />)}
        </div>
      )}
    </AppShell>
  );
}

type Kit = Awaited<ReturnType<typeof fetchKits>>[number];

export function KitCard({ kit }: { kit: Kit }) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <img src={especieImg(kit.especie?.slug)} alt={kit.nombre} loading="lazy" width={816} height={816} className="aspect-square w-full bg-muted object-cover" />
      <div className="border-t px-3 py-2 text-center">
        <p className="text-xs leading-tight font-bold">{kit.nombre}</p>
        <p className="text-xs italic text-muted-foreground">({kit.especie?.nombre_cientifico})</p>
      </div>
      <div className="flex items-center justify-between border-t px-3 py-2">
        <span className="font-extrabold">{formatoCOP(kit.precio)}</span>
        <button
          aria-label={`Agregar ${kit.nombre}`}
          onClick={() => { cart.add({ kitId: kit.id, nombre: kit.nombre, precio: kit.precio, slug: kit.especie?.slug ?? "" }); toast.success("Agregado al carrito 🛒"); }}
          className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
