import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { validarCalificacion } from "@/lib/reputacion";

interface CalificarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operacionId: string;
  contactoId?: string | null;
  valoradoId: string;
  nombreVecino: string;
  esDemo?: boolean;
}

export function CalificarModal({
  open,
  onOpenChange,
  operacionId,
  contactoId,
  valoradoId,
  nombreVecino,
  esDemo,
}: CalificarModalProps) {
  const session = useSession();
  const qc = useQueryClient();
  const [puntuacion, setPuntuacion] = useState(5);
  const [hoverPuntaje, setHoverPuntaje] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleCalificar(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      toast.error("Tenés que iniciar sesión para calificar");
      return;
    }

    const check = validarCalificacion({
      operacionId,
      valoradoId,
      valoradorId: session.user.id,
      esDemo,
      estadoOperacion: "confirmado",
    });

    if (!check.valida) {
      toast.error(check.motivo || "No se puede calificar esta operación");
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase.from("opiniones").insert({
        autor_id: session.user.id,
        vendedor_id: valoradoId,
        contacto_id: contactoId || null,
        puntaje: puntuacion,
        comentario: comentario.trim().slice(0, 500) || null,
      });

      if (error) {
        if (error.message.includes("unique") || error.message.includes("duplicate")) {
          throw new Error("Ya calificaste esta operación.");
        }
        throw error;
      }

      toast.success("¡Gracias! Tu valoración ayuda a construir confianza en Moreno.");
      qc.invalidateQueries({ queryKey: ["reputacion"] });
      qc.invalidateQueries({ queryKey: ["propuestas-trueque"] });
      qc.invalidateQueries({ queryKey: ["contactos-venta"] });
      onOpenChange(false);
      setComentario("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo registrar la calificación");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Star className="h-6 w-6 fill-amber-500" />
          </div>
          <DialogTitle className="text-center font-display text-lg">
            ¿Cómo fue tu experiencia con {nombreVecino}?
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            Calificá el intercambio para fortalecer la reputación de tu barrio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCalificar} className="space-y-4 pt-1">
          <div className="flex flex-col items-center justify-center gap-1.5 py-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const activo = (hoverPuntaje ?? puntuacion) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setPuntuacion(star)}
                    onMouseEnter={() => setHoverPuntaje(star)}
                    onMouseLeave={() => setHoverPuntaje(null)}
                    className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${activo ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-foreground">
              {puntuacion === 5 && "Excelente intercambio"}
              {puntuacion === 4 && "Muy buen vecino"}
              {puntuacion === 3 && "Correcto / Conforme"}
              {puntuacion === 2 && "Hubo inconvenientes"}
              {puntuacion === 1 && "Mala experiencia"}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comentario">Comentario opcional</Label>
            <Textarea
              id="comentario"
              rows={3}
              maxLength={300}
              placeholder="Ej: Muy puntual, el producto estaba impecable tal como en las fotos..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="resize-none text-xs sm:text-sm"
            />
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Las calificaciones reflejan operaciones reales. No se permite la autovaloración.
          </p>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-[44px] flex-1 rounded-full text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={enviando}
              className="min-h-[44px] flex-1 rounded-full text-xs font-bold"
            >
              {enviando ? "Guardando…" : "Publicar calificación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
