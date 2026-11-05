import { describe, expect, it } from "vitest";
import { analisisRestantes, totalCarrito, PRECIO_PREMIUM } from "./reglas";

describe("reglas WaraVita", () => {
  it("plan gratis tiene 5 análisis al mes", () => {
    expect(analisisRestantes("gratis", 0, "2026-11", "2026-11")).toBe(5);
    expect(analisisRestantes("gratis", 5, "2026-11", "2026-11")).toBe(0);
  });
  it("el conteo se reinicia al cambiar de mes", () => {
    expect(analisisRestantes("gratis", 5, "2026-10", "2026-11")).toBe(5);
  });
  it("premium es ilimitado", () => {
    expect(analisisRestantes("premium", 99, "2026-11", "2026-11")).toBe(Infinity);
  });
  it("premium cuesta COP 15.000", () => {
    expect(PRECIO_PREMIUM).toBe(15000);
  });
  it("total del carrito suma kits", () => {
    expect(totalCarrito([{ precio: 35000, cantidad: 1 }, { precio: 25000, cantidad: 2 }])).toBe(85000);
  });
});
