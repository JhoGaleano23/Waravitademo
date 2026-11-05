import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cart, useCart } from "@/lib/cart";
import { mensajeError } from "@/lib/data";
import { especieImg } from "@/lib/especies-img";
import { formatoCOP, totalCarrito } from "@/lib/reglas";

export const Route = createFileRoute("/_authenticated/carrito")({
  head: () => ({ meta: [{ title: "Carrito — WaraVita" }, { name: "description", content: "Resumen de tu compra." }] }),
  component: Carrito,
});

function Carrito() {
  const items = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const total = totalCarrito(items);

  async function confirmar() {
    setLoading(true);
    try {
      const ids = items.flatMap((i) => Array(i.cantidad).fill(i.kitId));
      const { error } = await supabase.rpc("confirmar_pedido", { _kit_ids: ids });
      if (error) throw error;
      cart.clear();
      await qc.invalidateQueries({ queryKey: ["plantas"] });
      toast.success("¡Pedido confirmado! Nuevas especies desbloqueadas 🌱");
      navigate({ to: "/jardin", search: { nuevo: ids.length } });
    } catch (e) {
      toast.error(mensajeError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <h1 className="mx-5 text-2xl font-extrabold">Tu carrito</h1>
      {items.length === 0 ? (
        <div className="mx-5 mt-10 flex flex-col items-center gap-3 text-center">
          <ShoppingBag className="h-12 w-12 text-primary" />
          <p className="font-bold">Tu carrito está vacío</p>
          <Link to="/tienda"><Button className="rounded-full font-bold">Ver kits</Button></Link>
        </div>
      ) : (
        <>
          <ul className="mx-5 mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.kitId} className="flex items-center gap-3 rounded-2xl border p-3">
                <img src={especieImg(i.slug)} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{i.nombre}</p>
                  <p className="text-sm text-muted-foreground">{formatoCOP(i.precio)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button aria-label="Quitar uno" onClick={() => cart.setCantidad(i.kitId, i.cantidad - 1)} className="grid h-8 w-8 place-items-center rounded-full bg-surface"><Minus className="h-4 w-4" /></button>
                  <span className="w-5 text-center font-bold">{i.cantidad}</span>
                  <button aria-label="Agregar uno" onClick={() => cart.setCantidad(i.kitId, i.cantidad + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-surface"><Plus className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mx-5 mt-5 rounded-3xl bg-surface p-5">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatoCOP(total)}</span></div>
            <div className="mt-1 flex justify-between text-sm"><span>Envío</span><span>Gratis</span></div>
            <div className="mt-3 flex justify-between text-lg font-extrabold"><span>Total</span><span>{formatoCOP(total)}</span></div>
            <p className="mt-3 rounded-xl bg-warning p-2 text-xs text-warning-foreground">Pago simulado para la demo: no se realizará ningún cobro.</p>
          </div>
          <div className="mx-5 mt-5">
            <Button onClick={confirmar} disabled={loading} className="h-14 w-full rounded-full text-base font-bold">
              {loading ? "Confirmando…" : "Confirmar pedido"}
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
