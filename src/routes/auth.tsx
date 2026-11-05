import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import logo from "@/assets/waravita-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mensajeError } from "@/lib/data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar — WaraVita" },
      { name: "description", content: "Crea tu cuenta o inicia sesión en WaraVita." },
      { property: "og:title", content: "Ingresar — WaraVita" },
      { property: "og:description", content: "Crea tu cuenta o inicia sesión en WaraVita." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"ingresar" | "registro">("ingresar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (modo === "registro") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { nombre } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/inicio" });
        else setEnviado(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
        navigate({ to: "/inicio" });
      }
    } catch (err) {
      toast.error(mensajeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <img src={logo.url} alt="WaraVita" className="mx-auto h-32 w-auto" />
      {enviado ? (
        <div className="animate-rise mt-6 rounded-3xl bg-soft p-6 text-center">
          <p className="text-lg font-extrabold">¡Revisa tu correo! 📬</p>
          <p className="mt-2 text-sm">Te enviamos un enlace a {email} para confirmar tu cuenta. Después podrás ingresar.</p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setEnviado(false); setModo("ingresar"); }}>
            Ya confirmé, ingresar
          </Button>
        </div>
      ) : (
        <>
          <h1 className="mt-4 text-center text-2xl font-extrabold">{modo === "ingresar" ? "Bienvenido de nuevo" : "Crea tu cuenta"}</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {modo === "registro" && (
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Tu nombre</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ana" className="h-12 rounded-2xl" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-2xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-2xl" />
            </div>
            <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-bold">
              {loading ? "Un momento…" : modo === "ingresar" ? "Ingresar" : "Crear cuenta"}
            </Button>
          </form>
          <button
            className="mt-4 text-center text-sm font-bold text-primary"
            onClick={() => setModo(modo === "ingresar" ? "registro" : "ingresar")}
          >
            {modo === "ingresar" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
          </button>
        </>
      )}
    </div>
  );
}
