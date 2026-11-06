import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ImageIcon, Lightbulb, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { mensajeError, plantaQuery } from "@/lib/data";
import { diagnosticar } from "@/lib/diagnostico.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/diagnostico/$id")({
  head: () => ({ meta: [{ title: "Cuidado y Diagnóstico IA — WaraVita" }, { name: "description", content: "Diagnostica tu planta con IA." }] }),
  component: Diagnostico,
});

type Diag = NonNullable<Awaited<ReturnType<typeof diagnosticar>>["diagnostico"]>;
const ACCIONES = ["💧 Riego aplicado", "✂️ Poda de hojas", "🌱 Abono", "🔄 Trasplante", "☀️ Cambio de luz", "🐛 Control de plagas"];

async function comprimir(src: string): Promise<string> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const s = Math.min(1, 1024 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = img.width * s;
  c.height = img.height * s;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82);
}

function Diagnostico() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const planta = useQuery(plantaQuery(id));
  const run = useServerFn(diagnosticar);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [camara, setCamara] = useState<"on" | "off" | "error">("off");
  const [foto, setFoto] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [diag, setDiag] = useState<Diag | null>(null);
  const [cargando, setCargando] = useState(false);
  const [limite, setLimite] = useState(false);
  const [acciones, setAcciones] = useState<string[]>([]);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (foto) return;
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamara("on");
      })
      .catch(() => setCamara("error"));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [foto]);

  async function capturar() {
    const v = videoRef.current;
    if (!v || camara !== "on") return fileRef.current?.click();
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    setFoto(await comprimir(c.toDataURL("image/jpeg")));
  }

  async function onFile(f?: File) {
    if (!f) return;
    const r = new FileReader();
    r.onload = async () => setFoto(await comprimir(String(r.result)));
    r.readAsDataURL(f);
  }

  async function analizar() {
    if (!foto) return;
    setCargando(true);
    setDiag(null);
    try {
      const res = await run({ data: { plantaId: id, imagen: foto, descripcion: desc } });
      qc.invalidateQueries({ queryKey: ["perfil"] });
      if (res.error === "LIMITE") setLimite(true);
      else if (res.error) toast.error(res.error);
      else setDiag(res.diagnostico);
    } catch (e) {
      toast.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }

  async function guardar() {
    if (!foto) return;
    setGuardando(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const path = `${u.user!.id}/${id}/${Date.now()}.jpg`;
      const blob = await (await fetch(foto)).blob();
      const up = await supabase.storage.from("fotos").upload(path, blob, { contentType: "image/jpeg" });
      if (up.error) throw up.error;
      const { error } = await supabase.from("registros").insert({
        user_id: u.user!.id, planta_id: id, foto_path: path, diagnostico: diag as never, acciones, nota: nota || null,
      });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["registros", id] });
      toast.success("Bitácora actualizada ✅");
      navigate({ to: "/planta/$id", params: { id } });
    } catch (e) {
      toast.error(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  const p = planta.data;
  return (
    <AppShell header={false}>
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center px-5 pt-5">
        <Link to="/planta/$id" params={{ id }} aria-label="Volver"><ArrowLeft className="h-6 w-6" /></Link>
        <div className="text-center">
          <h1 className="text-lg font-extrabold">Cuidado y Diagnóstico IA</h1>
          {p && <p className="truncate text-xs text-muted-foreground">Monitoreo de {p.nombre_personalizado} ({p.especie?.nombre_comun})</p>}
        </div>
        <span className="w-6" />
      </header>

      <div className="relative mx-5 mt-4 aspect-[4/5] overflow-hidden rounded-3xl bg-foreground">
        {foto ? (
          <img src={foto} alt="Foto capturada" className="h-full w-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        )}
        {!foto && camara === "error" && (
          <p className="absolute inset-x-6 top-1/3 text-center text-sm font-bold text-primary-foreground">No pudimos abrir la cámara. Usa la galería para subir una foto.</p>
        )}
        <div className="pointer-events-none absolute top-[22%] left-1/2 h-1/3 w-1/2 -translate-x-1/2 rounded-md border-2 border-primary-foreground/90" />
        {!foto && camara === "on" && (
          <span className="absolute top-[58%] left-1/2 -translate-x-1/2 rounded-full bg-foreground/50 px-3 py-1 text-xs font-bold whitespace-nowrap text-primary-foreground">Tejido sano — 98% confianza</span>
        )}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
          <button onClick={() => fileRef.current?.click()} className="grid h-11 w-11 place-items-center rounded-xl bg-foreground/50 text-primary-foreground" aria-label="Galería"><ImageIcon className="h-5 w-5" /></button>
          {foto ? (
            <button onClick={() => { setFoto(null); setDiag(null); }} className="rounded-full bg-background px-4 py-2 text-sm font-bold">Tomar otra</button>
          ) : (
            <button onClick={capturar} aria-label="Capturar" className="h-16 w-16 rounded-full border-4 border-primary-foreground bg-muted-foreground/80 active:scale-95" />
          )}
          <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-bold">Modo Macro / Hojas</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      {foto && !diag && (
        <div className="mx-5 mt-4 space-y-3 animate-rise">
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Opcional: describe lo que ves, ej. las hojas se están poniendo amarillas" className="rounded-2xl" />
          <Button onClick={analizar} disabled={cargando} className="h-12 w-full rounded-full font-bold">
            {cargando ? <><Sparkles className="h-4 w-4 animate-spin" /> Analizando tu planta…</> : "Analizar con IA"}
          </Button>
        </div>
      )}

      {limite && (
        <div className="mx-5 mt-4 rounded-3xl bg-warning p-5 text-warning-foreground animate-rise">
          <p className="font-extrabold">Usaste tus 5 análisis gratis de este mes</p>
          <p className="mt-1 text-sm">Con WaraVita Premium tienes análisis ilimitados.</p>
          <Link to="/perfil"><Button className="mt-3 rounded-full font-bold">Ver Premium</Button></Link>
        </div>
      )}

      {diag && (
        <div className="animate-rise">
          <section className="mx-5 mt-5 rounded-3xl border bg-soft p-5">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <Lightbulb className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Índice de Vigor Fitosanitario</p>
                  <p className="text-2xl font-extrabold">{Math.round(diag.vigor)}% {diag.estado}</p>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[["Presencia de patógenos", diag.patogenos], ["Coloración foliar", diag.coloracion], ["Humedad aparente", diag.humedad]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <span>{k}</span>
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-bold">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border-l-4 border-primary bg-background/60 p-3 text-sm">
              {diag.explicacion} <strong>{diag.recomendacion}</strong>
            </div>
            <div className="mt-4 rounded-xl bg-background/60 p-3 text-sm">
              {diag.identificada ? (
                <>
                  <p className="font-bold">Especie probable: {diag.especie} <span className="italic font-normal">({diag.nombre_cientifico})</span> · {Math.round(diag.confianza)}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">Alternativas: {diag.alternativas.slice(0, 2).map((a) => `${a.especie} (${Math.round(a.confianza)}%)`).join(" · ")}</p>
                </>
              ) : (
                <p className="font-bold">No logramos identificar la especie. Intenta otra foto más cercana, con buena luz y enfocando las hojas.</p>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Resultado orientativo generado por IA</p>
          </section>

          <h2 className="mx-5 mt-6 font-extrabold">Acciones de Cuidado Aplicadas</h2>
          <div className="mx-5 mt-3 grid grid-cols-2 gap-2">
            {ACCIONES.map((a) => {
              const on = acciones.includes(a);
              return (
                <button key={a} onClick={() => setAcciones(on ? acciones.filter((x) => x !== a) : [...acciones, a])}
                  className={cn("rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-colors", on && "border-primary bg-soft text-primary")}>
                  {a}
                </button>
              );
            })}
          </div>
          <Textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Añade una nota personal…" className="mx-5 mt-3 w-[calc(100%-2.5rem)] rounded-2xl" />
          <div className="mx-5 mt-4">
            <Button onClick={guardar} disabled={guardando} className="h-14 w-full rounded-full text-base font-bold">
              {guardando ? "Guardando…" : "Actualizar bitácora y guardar datos"}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
