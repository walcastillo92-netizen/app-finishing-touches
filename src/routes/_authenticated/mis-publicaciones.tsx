import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ESTADO_LABEL, fotoUrl } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/mis-publicaciones")({
  head: () => ({
    meta: [
      { title: "Mis publicaciones · MORENO CERCA" },
      { name: "description", content: "Administrá tus publicaciones: editá, pausá o finalizá." },
      { property: "og:title", content: "Mis publicaciones · MORENO CERCA" },
      { property: "og:description", content: "Tus productos y servicios publicados." },
    ],
  }),
  component: MisPublicaciones,
});

type Cambio = { estado?: string; disponibilidad?: string };

function MisPublicaciones() {
  const { userId } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["mis-publicaciones", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publicaciones")
        .select("id, titulo, estado, disponibilidad, faltantes, actualizado_en, publicacion_fotos(storage_path, orden)")
        .eq("vendedor_id", userId)
        .neq("estado", "eliminada")
        .order("actualizado_en", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function cambiar(id: string, c: Cambio, msg: string, confirmar?: string) {
    if (confirmar && !window.confirm(confirmar)) return;
    const { error } = await supabase.from("publicaciones").update(c).eq("id", id);
    if (error) { toast.error("No pudimos actualizar: " + error.message); return; }
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ["mis-publicaciones", userId] });
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-3xl bg-muted" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold">Mis publicaciones</h1>
        <Button asChild className="rounded-full"><Link to="/publicar" search={{ id: undefined }}>Nueva</Link></Button>
      </div>
      {!data?.length ? (
        <div className="rounded-3xl border bg-card p-8 text-center">
          <p className="font-display text-xl font-bold">Todavía no publicaste nada</p>
          <p className="mt-1 text-sm text-muted-foreground">Publicá algo que ya no uses y contá qué buscás a cambio.</p>
          <Button asChild className="mt-4 rounded-full"><Link to="/publicar" search={{ id: undefined }}>Publicar algo</Link></Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((p) => {
            const foto = [...p.publicacion_fotos].sort((a, b) => a.orden - b.orden)[0];
            const reservado = p.disponibilidad === "reservado";
            return (
              <li key={p.id} className="flex gap-3 rounded-2xl border bg-card p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {foto && <img src={fotoUrl(foto.storage_path)!} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <Link to="/p/$id" params={{ id: p.id }} className="line-clamp-1 font-semibold">{p.titulo || "Sin título"}</Link>
                    <p className="text-xs">
                      <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-accent-foreground">{ESTADO_LABEL[p.estado] ?? p.estado}</span>
                      {reservado && <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 font-semibold text-secondary-foreground">Reservada</span>}
                      {p.estado === "borrador" && p.faltantes.length > 0 && <span className="ml-1 text-muted-foreground">Faltan {p.faltantes.length} datos</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["borrador", "publicada", "pausada"].includes(p.estado) && (
                      <Button asChild size="sm" variant="outline" className="h-8 rounded-full"><Link to="/publicar" search={{ id: p.id }}>Editar</Link></Button>
                    )}
                    {p.estado === "publicada" && (
                      <>
                        <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => cambiar(p.id, { estado: "pausada" }, "Publicación pausada")}>Pausar</Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => cambiar(p.id, { disponibilidad: reservado ? "disponible" : "reservado" }, reservado ? "Disponible otra vez" : "Marcada como reservada")}>
                          {reservado ? "Quitar reserva" : "Reservar"}
                        </Button>
                      </>
                    )}
                    {p.estado === "pausada" && (
                      <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => cambiar(p.id, { estado: "publicada" }, "Publicación activa otra vez")}>Reactivar</Button>
                    )}
                    {["publicada", "pausada"].includes(p.estado) && (
                      <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => cambiar(p.id, { estado: "intercambiada", disponibilidad: "vendido" }, "¡Felicitaciones! Marcada como intercambiada o vendida", "¿Ya la intercambiaste o vendiste? Deja de mostrarse.")}>
                        Ya la intercambié
                      </Button>
                    )}
                    {["borrador", "publicada", "pausada"].includes(p.estado) && (
                      <Button size="sm" variant="ghost" className="h-8 rounded-full text-destructive" onClick={() => cambiar(p.id, { estado: "finalizada" }, "Publicación finalizada", "¿Finalizar esta publicación? Deja de mostrarse, pero queda en tu historial.")}>
                        Finalizar
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
