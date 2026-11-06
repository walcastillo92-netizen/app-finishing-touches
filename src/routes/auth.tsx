import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · MORENO CERCA" },
      { name: "description", content: "Entrá o creá tu cuenta en MORENO CERCA para publicar e intercambiar." },
      { property: "og:title", content: "Entrar · MORENO CERCA" },
      { property: "og:description", content: "Creá tu cuenta gratis y empezá a intercambiar con vecinos." },
    ],
  }),
  component: AuthPage,
});

type Modo = "entrar" | "crear" | "olvide";

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setAviso(null);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw new Error(error.message.includes("Invalid") ? "Email o contraseña incorrectos" : error.message);
        navigate({ to: "/" });
      } else if (modo === "crear") {
        if (nombre.trim().length < 2) throw new Error("Escribí tu nombre (mínimo 2 letras)");
        if (pass.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { emailRedirectTo: window.location.origin, data: { nombre: nombre.trim() } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/perfil" });
        else setAviso("Te mandamos un email para confirmar tu cuenta. Abrilo y después entrá.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setAviso("Si el email está registrado, te llega un enlace para crear una nueva contraseña.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Algo falló");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h1 className="font-display text-2xl font-extrabold">
          {modo === "entrar" ? "Entrá a tu cuenta" : modo === "crear" ? "Creá tu cuenta" : "Recuperar contraseña"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {modo === "olvide" ? "Te enviamos un enlace a tu email." : "Es gratis. Publicá e intercambiá con vecinos de Moreno."}
        </p>
        {aviso ? (
          <p className="mt-5 rounded-2xl bg-accent p-4 text-sm font-medium text-accent-foreground">{aviso}</p>
        ) : (
          <form onSubmit={enviar} className="mt-5 space-y-4">
            {modo === "crear" && (
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Tu nombre o apodo</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} required className="h-12" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
            </div>
            {modo !== "olvide" && (
              <div className="space-y-1.5">
                <Label htmlFor="pass">Contraseña</Label>
                <Input
                  id="pass"
                  type="password"
                  autoComplete={modo === "crear" ? "new-password" : "current-password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            )}
            <Button type="submit" disabled={cargando} className="h-12 w-full rounded-full text-base font-bold">
              {cargando ? "Un momento…" : modo === "entrar" ? "Entrar" : modo === "crear" ? "Crear cuenta" : "Enviar enlace"}
            </Button>
          </form>
        )}
        <div className="mt-5 flex flex-col gap-2 text-center text-sm">
          {modo !== "entrar" && (
            <button className="font-semibold text-primary" onClick={() => { setModo("entrar"); setAviso(null); }}>
              Ya tengo cuenta, quiero entrar
            </button>
          )}
          {modo !== "crear" && (
            <button className="font-semibold text-primary" onClick={() => { setModo("crear"); setAviso(null); }}>
              No tengo cuenta, quiero crearla
            </button>
          )}
          {modo === "entrar" && (
            <button className="text-muted-foreground" onClick={() => { setModo("olvide"); setAviso(null); }}>
              Me olvidé la contraseña
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
