import { useState } from "react";
import { AlertCircle, Flag } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

const MOTIVOS = [
  "Posible estafa o producto sospechoso",
  "Pide adelantos de dinero / señas bancarias",
  "Artículo o servicio prohibido / ilícito",
  "Fotos engañosas o descripción falsa",
  "Trato inapropiado o agresivo",
  "Otro motivo",
];

export function ReportarModal({ publicacionId, titulo }: { publicacionId: string; titulo?: string | null }) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleReportar(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setEnviando(true);
    try {
      const { error } = await supabase.from("denuncias").insert({
        denunciante_id: session.user.id,
        tipo_objeto: "publicacion",
        objeto_id: publicacionId,
        motivo,
        detalle: detalle.trim() || null,
        estado: "pendiente",
      });
      if (error) throw error;
      toast.success("Denuncia recibida. El equipo de moderación va a revisarla.");
      setOpen(false);
      setDetalle("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos registrar tu reporte");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive">
          <Flag className="h-3 w-3" /> Reportar publicación sospechosa
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive"><AlertCircle className="h-5 w-5" /></div>
          <DialogTitle className="text-center font-display text-lg">Reportar publicación</DialogTitle>
          <DialogDescription className="text-center text-xs">{titulo ? `«${titulo}»` : "Ayudanos a mantener seguro MORENO CERCA."}</DialogDescription>
        </DialogHeader>
        {!session ? (
          <div className="space-y-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Tenés que entrar a tu cuenta para enviar un reporte.</p>
            <Button asChild className="h-11 w-full rounded-full font-bold"><Link to="/auth" search={{ redirect: typeof window !== "undefined" ? window.location.pathname : undefined }}>Entrar para reportar</Link></Button>
          </div>
        ) : (
          <form onSubmit={handleReportar} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="motivo-reporte">Motivo del reporte</Label>
              <select id="motivo-reporte" value={motivo} onChange={(e) => setMotivo(e.target.value)} className="h-11 w-full rounded-xl border bg-card px-3 text-xs sm:text-sm">
                {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detalle-reporte">Detalle adicional (opcional)</Label>
              <Textarea id="detalle-reporte" rows={3} maxLength={400} placeholder="Contanos brevemente qué te llamó la atención..." value={detalle} onChange={(e) => setDetalle(e.target.value)} className="resize-none text-xs sm:text-sm" />
            </div>
            <p className="text-[11px] text-muted-foreground">El reporte se envía al equipo de moderación para su revisión.</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 flex-1 rounded-full text-xs font-bold">Cancelar</Button>
              <Button type="submit" variant="destructive" disabled={enviando} className="h-11 flex-1 rounded-full text-xs font-bold">{enviando ? "Enviando…" : "Enviar reporte"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
