import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Crown, Info, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, ErrorBox, Loading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { mensajeError, perfilQuery } from "@/lib/data";
import { analisisRestantes, formatoCOP, LIMITE_ANALISIS_GRATIS, mesActual, PRECIO_PREMIUM } from "@/lib/reglas";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Perfil — WaraVita" }, { name: "description", content: "Tu cuenta y plan WaraVita." }] }),
  component: Perfil,
});

function Perfil() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const perfil = useQuery(perfilQuery);
  const [activando, setActivando] = useState(false);
  if (perfil.isLoading) return <AppShell><Loading /></AppShell>;
  if (perfil.error) return <AppShell><ErrorBox error={perfil.error} /></AppShell>;
  const p = perfil.data!;
  const premium = p.plan === "premium";
  const rest = analisisRestantes(p.plan, p.analisis_mes, p.mes_analisis, mesActual());

  async function activar() {
    setActivando(true);
    const { error } = await supabase.rpc("activar_premium");
    setActivando(false);
    if (error) return toast.error(mensajeError(error));
    await qc.invalidateQueries({ queryKey: ["perfil"] });
    toast.success("¡Bienvenido a WaraVita Premium! 👑");
  }
  async function salir() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <AppShell>
      <section className="mx-5 flex items-center gap-4 rounded-3xl border p-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-soft text-2xl">🌿</div>
        <div className="min-w-0">
          <p className="truncate text-xl font-extrabold">{p.nombre}</p>
          <p className="truncate text-sm text-muted-foreground">{p.email}</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-accent-foreground">
            {premium && <Crown className="h-3 w-3" />} Plan {premium ? "Premium" : "Gratis"}
          </span>
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-3xl bg-soft p-5">
        <p className="text-sm font-bold">Análisis restantes este mes</p>
        <p className="text-3xl font-extrabold text-primary">{premium ? "Ilimitados" : `${rest} de ${LIMITE_ANALISIS_GRATIS}`}</p>
      </section>

      <section className="mx-5 mt-6 grid gap-3">
        <div className="rounded-3xl border p-5">
          <p className="font-extrabold">Plan Gratis</p>
          <p className="text-2xl font-extrabold">$0</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> {LIMITE_ANALISIS_GRATIS} análisis con IA al mes</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Enciclopedia básica</li>
          </ul>
        </div>
        <div className="rounded-3xl border-2 border-primary bg-hero p-5">
          <p className="flex items-center gap-2 font-extrabold"><Crown className="h-5 w-5 text-primary" /> WaraVita Premium</p>
          <p className="text-2xl font-extrabold">COP {formatoCOP(PRECIO_PREMIUM).slice(1)}<span className="text-sm font-bold">/mes</span></p>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Análisis y diagnósticos ilimitados</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Recordatorios de cuidado</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Enciclopedia completa</li>
          </ul>
          {premium ? (
            <p className="mt-4 rounded-full bg-background py-2.5 text-center text-sm font-bold text-primary">Plan activo ✓</p>
          ) : (
            <>
              <Button onClick={activar} disabled={activando} className="mt-4 h-12 w-full rounded-full font-bold">{activando ? "Activando…" : "Activar Premium"}</Button>
              <p className="mt-2 text-center text-xs text-accent-foreground">Pago simulado para la demo</p>
            </>
          )}
        </div>
      </section>

      <section className="mx-5 mt-6 divide-y rounded-3xl border">
        <Link to="/recordatorios" className="flex items-center gap-3 p-4 font-bold"><Bell className="h-5 w-5 text-primary" /> Recordatorios</Link>
        <Link to="/nosotros" className="flex items-center gap-3 p-4 font-bold"><Info className="h-5 w-5 text-primary" /> Sobre WaraVita</Link>
        <button onClick={salir} className="flex w-full items-center gap-3 p-4 font-bold text-destructive"><LogOut className="h-5 w-5" /> Cerrar sesión</button>
      </section>
    </AppShell>
  );
}
