import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { formatARS } from "@/lib/catalog";
import { AvisoSeguridad } from "@/components/AvisoSeguridad";

interface ContactarVentaProps {
  publicacionId: string;
  vendedorId: string;
  precioArs: number | null;
  titulo: string | null;
}

export function ContactarVenta({ publicacionId, precioArs, titulo }: ContactarVentaProps) {
  const session = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const contactar = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("contactar_publicacion", {
        p_publicacion: publicacionId,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      const wa = String((data as { whatsapp?: string } | null)?.whatsapp ?? "").replace(/\D/g, "");
      if (wa && typeof window !== "undefined") {
        const texto = `Hola, vi tu publicación «${titulo ?? "tu artículo"}» en MORENO CERCA y me interesa.`;
        window.open(`https://wa.me/${wa}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
      }
      toast.success("Contacto iniciado. Coordiná el pago y encuentro con el vecino.");
      qc.invalidateQueries({ queryKey: ["contactos-venta"] });
      setOpen(false);
      navigate({ to: "/trueques" });
    },
    onError: (err: Error) => {
      toast.error(err.message || "No se pudo iniciar el contacto");
    },
  });

  if (session === null) {
    return (
      <Button asChild variant="secondary" className="min-h-[48px] h-12 w-full rounded-full text-sm font-bold sm:text-base">
        <Link to="/auth" search={{ redirect: typeof window !== "undefined" ? window.location.pathname : undefined }}>
          <ShoppingBag className="mr-1.5 h-4 w-4" /> Entrá para comprar
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={!session} variant="secondary" className="min-h-[48px] h-12 w-full rounded-full text-sm font-bold sm:text-base shadow-sm">
        <ShoppingBag className="mr-1.5 h-4 w-4" /> Contactar para comprar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <MessageCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-display text-lg">Comprar a un vecino</DialogTitle>
            <DialogDescription className="text-center text-xs">{titulo ? `«${titulo}»` : "Iniciar contacto comercial"}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {precioArs != null && precioArs > 0 && (
              <div className="rounded-2xl border bg-muted/40 p-3.5 text-center">
                <span className="text-xs text-muted-foreground">Precio publicado:</span>
                <p className="font-display text-2xl font-black text-foreground">{formatARS(precioArs)}</p>
              </div>
            )}

            <AvisoSeguridad variante="compacto" />

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground space-y-1.5">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> ¿Cómo funciona la compra?
              </p>
              <p className="text-[11px] leading-relaxed">
                Al iniciar el contacto, ambos podrán comunicarse para pactar día, hora y lugar público en Moreno. El pago se realiza en mano al momento de recibir el producto.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="min-h-[44px] flex-1 rounded-full text-xs font-bold">Cancelar</Button>
              <Button type="button" disabled={contactar.isPending} onClick={() => contactar.mutate()} className="min-h-[44px] flex-1 rounded-full text-xs font-bold">
                {contactar.isPending ? "Conectando…" : "Confirmar contacto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}