import { Link, useLocation } from "@tanstack/react-router";
import { Home, ShoppingCart, Sprout, Store, User } from "lucide-react";
import type { ReactNode } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/inicio", label: "Inicio", icon: Home },
  { to: "/tienda", label: "Tienda", icon: Store },
  { to: "/jardin", label: "Mi jardín", icon: Sprout },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function AppHeader() {
  const items = useCart();
  const count = items.reduce((s, i) => s + i.cantidad, 0);
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-5 pb-3">
      <Link to="/perfil" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-soft text-lg" aria-label="Perfil">
        🌿
      </Link>
      <p className="truncate text-center text-lg font-extrabold">Hola, Guardián 🌱</p>
      <Link to="/carrito" className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full" aria-label="Carrito">
        <ShoppingCart className="h-6 w-6" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </Link>
    </header>
  );
}

export function BottomNav() {
  const { pathname } = useLocation();
  const active = (to: string) =>
    pathname.startsWith(to) ||
    (to === "/jardin" && (pathname.startsWith("/planta") || pathname.startsWith("/diagnostico") || pathname.startsWith("/recordatorios"))) ||
    (to === "/tienda" && pathname.startsWith("/carrito"));
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ to, label, icon: Icon }) => {
          const on = active(to);
          return (
            <li key={to}>
              <Link to={to} className="flex flex-col items-center gap-1 text-xs font-bold">
                <span className={cn("grid h-8 w-14 place-items-center rounded-full transition-colors", on ? "bg-soft text-primary" : "text-foreground")}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className={on ? "text-primary" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children, header = true }: { children: ReactNode; header?: boolean }) {
  return (
    <div className="mx-auto min-h-screen max-w-md pb-28">
      {header && <AppHeader />}
      <main className="animate-rise">{children}</main>
      <BottomNav />
    </div>
  );
}

export function LevelBar({ nivel }: { nivel: number }) {
  return (
    <div className="h-2 w-20 shrink-0 overflow-hidden rounded-full bg-background">
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(5, Math.max(1, nivel)) * 20}%` }} />
    </div>
  );
}

export function Loading({ text = "Cargando…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <Sprout className="h-8 w-8 animate-bounce text-primary" />
      <p className="text-sm font-semibold">{text}</p>
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : "Algo salió mal.";
  return (
    <div className="mx-5 rounded-2xl bg-warning p-4 text-sm font-semibold text-warning-foreground">
      No pudimos cargar la información. {/fetch|network/i.test(msg) ? "Revisa tu conexión a internet." : msg}
    </div>
  );
}
