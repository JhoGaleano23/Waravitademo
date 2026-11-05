// Reglas de negocio compartidas (UI). El límite real se aplica en la base de datos.
export const LIMITE_ANALISIS_GRATIS = 5;
export const PRECIO_PREMIUM = 15000;

export function analisisRestantes(plan: string, usados: number, mesGuardado: string, mesActual: string) {
  if (plan === "premium") return Infinity;
  const usadosMes = mesGuardado === mesActual ? usados : 0;
  return Math.max(0, LIMITE_ANALISIS_GRATIS - usadosMes);
}

export function totalCarrito(items: { precio: number; cantidad: number }[]) {
  return items.reduce((s, i) => s + i.precio * i.cantidad, 0);
}

export function formatoCOP(n: number) {
  return "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

export function mesActual(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function mesesDesde(fecha: string, hoy = new Date()) {
  const f = new Date(fecha + "T00:00:00");
  return Math.max(0, (hoy.getFullYear() - f.getFullYear()) * 12 + hoy.getMonth() - f.getMonth());
}

export function fechaLarga(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long" });
}

export const ETAPAS = [
  { id: "germinacion", label: "Germinación" },
  { id: "plantula", label: "Plántula" },
  { id: "floracion", label: "Floración" },
] as const;

export function etapaLabel(id: string) {
  return ETAPAS.find((e) => e.id === id)?.label ?? id;
}
