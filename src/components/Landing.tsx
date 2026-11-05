import { Link } from "@tanstack/react-router";
import { Camera, Leaf, Sprout, TrendingDown } from "lucide-react";
import logo from "@/assets/waravita-logo.png.asset.json";
import salvia from "@/assets/especies/salvia-bogotana.jpg";
import { Button } from "@/components/ui/button";

const equipo = [
  { nombre: "Diego Martínez", rol: "Dirección de proyecto" },
  { nombre: "Karol Torres", rol: "Diseño y experiencia" },
  { nombre: "Jhoan Galeano", rol: "Desarrollo y tecnología" },
  { nombre: "Juan Duarte", rol: "Botánica y comercial" },
];

export function Landing({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="mx-auto max-w-md px-5 pb-16">
      <header className="flex items-center justify-between py-5">
        <img src={logo.url} alt="WaraVita" className="h-14 w-auto" />
        <Link to={signedIn ? "/inicio" : "/auth"}>
          <Button variant="outline" className="rounded-full font-bold">{signedIn ? "Ir a la app" : "Ingresar"}</Button>
        </Link>
      </header>

      <section className="bg-hero animate-rise overflow-hidden rounded-3xl p-6">
        <p className="text-sm font-bold text-primary">Flora nativa colombiana + IA</p>
        <h1 className="mt-2 text-3xl leading-tight font-extrabold">Conoce tus plantas y cuídalas como un experto</h1>
        <p className="mt-3 text-sm text-accent-foreground">
          Identifica especies, recibe diagnósticos con inteligencia artificial y colecciona la flora nativa de Colombia.
        </p>
        <Link to={signedIn ? "/inicio" : "/auth"} className="mt-5 inline-block">
          <Button className="rounded-full px-6 font-bold">Empezar gratis</Button>
        </Link>
        <img src={salvia} alt="Salvia bogotana" className="mx-auto mt-4 h-48 w-auto mix-blend-multiply" width={816} height={816} />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold">El problema</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border p-4">
            <TrendingDown className="h-6 w-6 text-primary" />
            <p className="mt-2 text-3xl font-extrabold text-primary">50%</p>
            <p className="text-sm text-muted-foreground">de las plantas domésticas muere por no saber qué son ni cómo cuidarlas.</p>
          </div>
          <div className="rounded-3xl border p-4">
            <Leaf className="h-6 w-6 text-primary" />
            <p className="mt-2 text-xl font-extrabold text-primary">COP 200.000 – 400.000</p>
            <p className="text-sm text-muted-foreground">en pérdidas por semestre para cada hogar.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-extrabold">Cómo te ayudamos</h2>
        {[
          { icon: Camera, t: "Diagnóstico con IA", d: "Toma una foto y conoce la salud de tu planta al instante." },
          { icon: Sprout, t: "Kits de flora nativa", d: "Siembra especies colombianas y desbloquéalas en tu jardín." },
          { icon: Leaf, t: "Recordatorios y bitácora", d: "Lleva el registro de riegos, abonos y la evolución de cada planta." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="flex gap-4 rounded-3xl bg-surface p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-soft text-primary"><Icon className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="font-bold">{t}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold">Nuestro equipo</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {equipo.map((p) => (
            <div key={p.nombre} className="rounded-3xl border p-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-soft text-xl font-extrabold text-primary">
                {p.nombre.split(" ").map((n) => n[0]).join("")}
              </div>
              <p className="mt-3 font-bold">{p.nombre}</p>
              <p className="text-xs text-muted-foreground">{p.rol}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
