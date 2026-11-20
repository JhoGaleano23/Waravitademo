import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sesión expirada. Vuelve a ingresar.");
  return data.user.id;
}

export async function fetchKits() {
  const { data, error } = await supabase.from("kits").select("*, especie:especies(*)").order("precio");
  if (error) throw error;
  return data;
}

export const kitsQuery = queryOptions({ queryKey: ["kits"], queryFn: fetchKits });

export const especiesQuery = queryOptions({
  queryKey: ["especies"],
  queryFn: async () => {
    const { data, error } = await supabase.from("especies").select("*").order("orden");
    if (error) throw error;
    return data;
  },
});

export const perfilQuery = queryOptions({
  queryKey: ["perfil"],
  queryFn: async () => {
    const id = await uid();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (error) throw error;
    const { data: u } = await supabase.auth.getUser();
    return { ...data, email: u.user?.email ?? "" };
  },
});

export const plantasQuery = queryOptions({
  queryKey: ["plantas"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("plantas_usuario")
      .select("*, especie:especies(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const plantaQuery = (id: string) =>
  queryOptions({
    queryKey: ["planta", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plantas_usuario")
        .select("*, especie:especies(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const registrosQuery = (plantaId: string) =>
  queryOptions({
    queryKey: ["registros", plantaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("planta_id", plantaId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const paths = data.map((r) => r.foto_path).filter(Boolean) as string[];
      let urls: Record<string, string> = {};
      if (paths.length) {
        const { data: signed } = await supabase.storage.from("fotos").createSignedUrls(paths, 3600);
        urls = Object.fromEntries((signed ?? []).map((s) => [s.path ?? "", s.signedUrl ?? ""]));
      }
      return data.map((r) => ({ ...r, url: r.foto_path ? urls[r.foto_path] : undefined }));
    },
  });

export const recordatoriosQuery = queryOptions({
  queryKey: ["recordatorios"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("recordatorios")
      .select("*, planta:plantas_usuario(nombre_personalizado)")
      .order("fecha");
    if (error) throw error;
    return data;
  },
});

export function mensajeError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (/fetch|network|Failed/i.test(msg)) return "Sin conexión. Revisa tu internet e inténtalo de nuevo.";
  return msg;
}
