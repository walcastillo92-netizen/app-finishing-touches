import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña · MORENO CERCA" },
      { name: "description", content: "Creá una nueva contraseña para tu cuenta de MORENO CERCA." },
      { property: "og:title", content: "Nueva contraseña · MORENO CERCA" },
      { property: "og:description", content: "Recuperá el acceso a tu cuenta." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pass, setPass] = useState("");
  const [cargando, setCargando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (pass.length < 8) { toast.error("La contraseña debe tener al menos 8 caracteres"); return; }
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setCargando(false);
    if (error) { toast.error("El enlace venció o no es válido. Pedí uno nuevo."); return; }
    toast.success("¡Listo! Ya podés usar tu nueva contraseña.");
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <form onSubmit={guardar} className="space-y-4 rounded-3xl border bg-card p-6 shadow-sm">
        <h1 className="font-display text-2xl font-extrabold">Nueva contraseña</h1>
        <div className="space-y-1.5">
          <Label htmlFor="pass">Contraseña nueva</Label>
          <Input id="pass" type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} className="h-12" />
        </div>
        <Button type="submit" disabled={cargando} className="h-12 w-full rounded-full font-bold">
          Guardar contraseña
        </Button>
      </form>
    </div>
  );
}
