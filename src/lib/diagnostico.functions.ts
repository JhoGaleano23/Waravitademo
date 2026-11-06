import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const diagnosticar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { plantaId: string; imagen: string; descripcion: string }) => {
    if (!d.imagen?.startsWith("data:image/")) throw new Error("Imagen inválida");
    if (d.imagen.length > 6_000_000) throw new Error("La imagen es muy pesada");
    return { plantaId: d.plantaId, imagen: d.imagen, descripcion: (d.descripcion ?? "").slice(0, 500) };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: planta } = await supabase
      .from("plantas_usuario")
      .select("nombre_personalizado, especie:especies(nombre_comun, nombre_cientifico)")
      .eq("id", data.plantaId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!planta) return { error: "No encontramos esta planta." as string, diagnostico: null };

    const { data: ok, error: rpcErr } = await supabase.rpc("consumir_analisis");
    if (rpcErr) return { error: "No pudimos verificar tu plan.", diagnostico: null };
    if (!ok) return { error: "LIMITE", diagnostico: null };

    try {
      const { analizarPlanta } = await import("./ai.server");
      const esp = planta.especie as { nombre_comun: string; nombre_cientifico: string } | null;
      const diagnostico = await analizarPlanta(data.imagen, data.descripcion, `${planta.nombre_personalizado} (${esp?.nombre_comun}, ${esp?.nombre_cientifico})`);
      return { error: null, diagnostico };
    } catch (e) {
      console.error("diagnostico", e);
      const msg = String((e as { statusCode?: number })?.statusCode ?? "");
      if (msg === "429") return { error: "Muchas solicitudes. Intenta en un minuto.", diagnostico: null };
      if (msg === "402") return { error: "Sin créditos de IA disponibles por ahora.", diagnostico: null };
      return { error: "La IA no pudo analizar la foto. Intenta con otra imagen.", diagnostico: null };
    }
  });
