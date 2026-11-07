import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CalificarModal } from "@/components/CalificarModal";
import { supabase } from "@/integrations/supabase/client";
import { fotoUrl, formatARS } from "@/lib/catalog";

const ESTADO: Record<string, string> = {
  iniciado: "Contacto iniciado",
  confirmado: "Venta confirmada",
  rechazado: "No se concretó",
};

/** Compras y ventas iniciadas con «Contactar para comprar». El VENDEDOR confirma; el COMPRADOR valora. */
export function ContactosVenta({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState({ open: false, contactoId: "", valoradoId: "", nombre: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["contactos-venta", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contactos")
        .select(
          "*, publicaciones(id, titulo, precio_ars, publicacion_fotos(storage_path, orden)), comprador:perfiles!comprador_id(id, nombre_publico), vendedor:perfiles!vendedor_id(id, nombre_publico)",
        )
        .or(`comprador_id.eq.${userId},vendedor_id.eq.${userId}`)
        .order("creado_en", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const confirmar = useMutation({
    mutationFn: async ({ id, ok }: { id: string; ok: boolean }) => {
      const { error } = await supabase.rpc("confirmar_operacion", {
        p_contacto: id,
        p_confirmar: ok,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, v) => {
      toast.success(
        v.ok ? "Venta confirmada. El comprador ya puede valorarte." : "Marcada como no concretada.",
      );
      qc.invalidateQueries({ queryKey: ["contactos-venta", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="h-28 animate-pulse rounded-2xl bg-muted" />;
  if (!data?.length)
    return (
      <div className="space-y-2 rounded-3xl border bg-card p-8 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
        <p className="font-display text-base font-bold">No tenés compras ni ventas iniciadas</p>
        <p className="mx-auto max-w-sm text-xs text-muted-foreground">
          Cuando contactes para comprar o un vecino te contacte, aparece acá.
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      {data.map((c) => {
        const soyComprador = c.comprador_id === userId;
        const otro = soyComprador ? c.vendedor : c.comprador;
        const foto = c.publicaciones?.publicacion_fotos?.[0]?.storage_path;
        return (
          <article key={c.id} className="space-y-3 rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold">
                {soyComprador
                  ? `Le comprás a ${otro?.nombre_publico}`
                  : `Comprador: ${otro?.nombre_publico}`}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-secondary-foreground">
                {ESTADO[c.estado] ?? c.estado}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                {foto && (
                  <img
                    src={fotoUrl(foto) ?? undefined}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {c.publicaciones?.titulo ?? "Artículo"}
                </p>
                {c.publicaciones?.precio_ars != null && (
                  <p className="text-sm font-extrabold">{formatARS(c.publicaciones.precio_ars)}</p>
                )}
              </div>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary" /> Encontrate en un punto público de Moreno.
              No adelantes dinero.
            </p>
            <div className="flex flex-wrap gap-2">
              {!soyComprador && c.estado === "iniciado" && (
                <>
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={confirmar.isPending}
                    onClick={() => confirmar.mutate({ id: c.id, ok: true })}
                  >
                    Confirmar venta concretada
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={confirmar.isPending}
                    onClick={() => confirmar.mutate({ id: c.id, ok: false })}
                  >
                    No se concretó
                  </Button>
                </>
              )}
              {soyComprador && c.estado === "confirmado" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() =>
                    setModal({
                      open: true,
                      contactoId: c.id,
                      valoradoId: c.vendedor_id,
                      nombre: otro?.nombre_publico ?? "Vecino",
                    })
                  }
                >
                  <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" /> Valorar al
                  vendedor
                </Button>
              )}
              {soyComprador && c.estado === "iniciado" && (
                <p className="text-xs text-muted-foreground">
                  Cuando el vendedor confirme la venta vas a poder valorarlo.
                </p>
              )}
            </div>
          </article>
        );
      })}
      <CalificarModal
        open={modal.open}
        onOpenChange={(open) => setModal((m) => ({ ...m, open }))}
        operacionId={modal.contactoId}
        contactoId={modal.contactoId}
        valoradoId={modal.valoradoId}
        nombreVecino={modal.nombre}
        esDemo={false}
      />
    </div>
  );
}
