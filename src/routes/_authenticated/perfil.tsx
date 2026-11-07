import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fotoUrl, zonasQuery } from "@/lib/catalog";
import { procesarImagen } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Mi perfil · MORENO CERCA" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Editá tu perfil público en MORENO CERCA." },
      { property: "og:title", content: "Mi perfil · MORENO CERCA" },
      { property: "og:description", content: "Tu presentación para los vecinos." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { userId } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: zonas } = useQuery(zonasQuery);
  const { data: perfil } = useQuery({
    queryKey: ["perfil", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("perfiles").select("*").eq("id", userId).single();
      if (error) throw error;
      return data;
    },
  });
  const [f, setF] = useState({ nombre_publico: "", descripcion: "", zona_id: "", tipo: "vecino" });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (perfil)
      setF({
        nombre_publico: perfil.nombre_publico,
        descripcion: perfil.descripcion ?? "",
        zona_id: perfil.zona_id ?? "",
        tipo: perfil.tipo,
      });
  }, [perfil]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (f.nombre_publico.trim().length < 2) {
      toast.error("El nombre debe tener al menos 2 letras");
      return;
    }
    setGuardando(true);
    const { error } = await supabase
      .from("perfiles")
      .update({
        nombre_publico: f.nombre_publico.trim(),
        descripcion: f.descripcion.trim() || null,
        zona_id: f.zona_id || null,
        tipo: f.tipo,
      })
      .eq("id", userId);
    setGuardando(false);
    if (error) {
      toast.error("No pudimos guardar: " + error.message);
      return;
    }
    toast.success("Perfil guardado");
    qc.invalidateQueries({ queryKey: ["perfil", userId] });
  }

  async function subirAvatar(file: File) {
    try {
      const img = await procesarImagen(file, 512);
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      const up = await supabase.storage
        .from("avatares")
        .upload(path, img.blob, { contentType: "image/jpeg" });
      if (up.error) throw up.error;
      const { error } = await supabase
        .from("perfiles")
        .update({ avatar_url: path })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Foto actualizada");
      qc.invalidateQueries({ queryKey: ["perfil", userId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos subir la foto");
    }
  }

  if (!perfil) return <div className="h-64 animate-pulse rounded-3xl bg-muted" />;

  return (
    <form onSubmit={guardar} className="mx-auto max-w-lg space-y-5 rounded-3xl border bg-card p-6">
      <h1 className="font-display text-2xl font-extrabold">Mi perfil</h1>
      <label className="relative mx-auto block h-24 w-24 cursor-pointer overflow-hidden rounded-full bg-muted">
        {perfil.avatar_url ? (
          <img
            src={fotoUrl(perfil.avatar_url, "avatares")!}
            alt="Tu foto"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-3xl font-bold">
            {perfil.nombre_publico[0]}
          </span>
        )}
        <span className="absolute bottom-0 inset-x-0 flex justify-center bg-foreground/60 py-1 text-background">
          <Camera className="h-4 w-4" />
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && subirAvatar(e.target.files[0])}
        />
      </label>
      <div className="space-y-1.5">
        <Label htmlFor="n">Nombre público</Label>
        <Input
          id="n"
          value={f.nombre_publico}
          maxLength={60}
          onChange={(e) => setF({ ...f, nombre_publico: e.target.value })}
          className="h-12"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="z">Tu barrio (aproximado)</Label>
        <select
          id="z"
          className="h-12 w-full rounded-md border bg-card px-3"
          value={f.zona_id}
          onChange={(e) => setF({ ...f, zona_id: e.target.value })}
        >
          <option value="">Elegí tu barrio</option>
          {zonas?.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t">Soy</Label>
        <select
          id="t"
          className="h-12 w-full rounded-md border bg-card px-3"
          value={f.tipo}
          onChange={(e) => setF({ ...f, tipo: e.target.value })}
        >
          <option value="vecino">Vecino/a</option>
          <option value="vendedor">Emprendedor/a</option>
          <option value="comercio">Comercio</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="d">Presentación breve</Label>
        <Textarea
          id="d"
          value={f.descripcion}
          maxLength={500}
          rows={3}
          onChange={(e) => setF({ ...f, descripcion: e.target.value })}
          placeholder="Contá qué te gusta intercambiar…"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Tu email nunca se muestra. Los vecinos solo ven tu nombre, foto, barrio y presentación.
      </p>
      <Button type="submit" disabled={guardando} className="h-12 w-full rounded-full font-bold">
        {guardando ? "Guardando…" : "Guardar perfil"}
      </Button>
    </form>
  );
}
