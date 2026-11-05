import { useSyncExternalStore } from "react";

export type CartItem = { kitId: string; nombre: string; precio: number; slug: string; cantidad: number };

const KEY = "waravita-carrito";
let items: CartItem[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    items = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    items = [];
  }
}
function emit() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

export const cart = {
  add(item: Omit<CartItem, "cantidad">) {
    load();
    const ex = items.find((i) => i.kitId === item.kitId);
    items = ex
      ? items.map((i) => (i.kitId === item.kitId ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...items, { ...item, cantidad: 1 }];
    emit();
  },
  setCantidad(kitId: string, cantidad: number) {
    load();
    items = cantidad <= 0 ? items.filter((i) => i.kitId !== kitId) : items.map((i) => (i.kitId === kitId ? { ...i, cantidad } : i));
    emit();
  },
  clear() {
    items = [];
    emit();
  },
};

const EMPTY: CartItem[] = [];
export function useCart() {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      l();
      return () => listeners.delete(l);
    },
    () => (loaded ? items : EMPTY),
    () => EMPTY,
  );
}
