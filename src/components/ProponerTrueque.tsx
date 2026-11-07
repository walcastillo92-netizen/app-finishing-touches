import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Repeat } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { sb, LEYENDA_EFECTIVO, ACLARACION_DINERO } from "@/lib/trueques";
import type { ModalidadTrueque } from "@/lib/catalog";

const sel = "h-11 w-full rounded-xl border bg-card px-3 text-sm";

export function ProponerTrueque({ publicacionId, vendedorId, modalidadPub }: { publicacionId: string; vendedorId: string; modalidadPub: ModalidadTrueque }) {
  const session = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const permiteEfectivo = modalidadPub !== "solo_mano_a_mano";
  const permiteMano = modalidadPub !== "con_efectivo";
  const [modalidad, setModalidad] = useState<"mano_a_mano" | "con_efectivo">(permiteMano ? "mano_a_mano" : "con_efectivo");
  const [ofrecida, setOfrecida] = useState("");
  const [texto, setTexto] = useState("");
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const { data: misPubs } = useQuery({
    queryKey: ["mis-publicaciones-activas", session?.user.id],
    enabled: open && !!session,
    queryFn: async () => {
      if (!session) return [];
      const { data, error } = await supabase.from("publicaciones").select("id, titulo")
        .eq("vendedor_id", session.user.id).eq("estado", "publicada");
      if (error) throw error;
      return data;
    },
  });
  const enviar = useMutation({
    mutationFn: async () => {
      if (!session || session.user.id === vendedorId) throw new Error("Entrá con tu cuenta para proponer un trueque.");
      if (!ofrecida && !texto.trim()) throw new Error("Elegí una publicación o contá qué ofrecés.");
      const efectivo = modalidad === "con_efectivo" ? Number(monto) : null;
      if (modalidad === "con_efectivo" && (!efectivo || !Number.isFinite(efectivo) || efectivo <= 0)) throw new Error("Escribí la diferencia que ofrecés en efectivo.");
      const { error } = await sb.from("propuestas_trueque").insert({
        publicacion_destino: publicacionId, publicacion_ofrecida: ofrecida || null,
        proponente: session.user.id, destinatario: vendedorId, modalidad,
        efectivo_monto: efectivo, paga: efectivo ? "proponente" : null,
        oferta_texto: texto.trim() || null, mensaje: mensaje.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["propuestas"] });
      setOpen(false);
      toast.success("Propuesta enviada");
    },
    onError: (error) => toast.error(error.message),
  });
  return <>
    <Button className="h-14 w-full rounded-full text-base font-bold" onClick={() => {
      if (!session) { navigate({ to: "/auth" }); return; }
      setOpen(true);
    }}><Repeat className="h-5 w-5" /> Proponer trueque</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Proponer trueque</DialogTitle><DialogDescription>Tu propuesta para este vecino.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); enviar.mutate(); }}>
          <div className="space-y-2"><Label htmlFor="ofrecida">Tu publicación</Label>
            <select id="ofrecida" className={sel} value={ofrecida} onChange={(e) => setOfrecida(e.target.value)}>
              <option value="">Otra oferta</option>
              {misPubs?.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label htmlFor="oferta">¿Qué ofrecés?</Label><Textarea id="oferta" value={texto} onChange={(e) => setTexto(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="modalidad">Modalidad</Label>
            <select id="modalidad" className={sel} value={modalidad} onChange={(e) => setModalidad(e.target.value === "con_efectivo" ? "con_efectivo" : "mano_a_mano")}>
              {permiteMano && <option value="mano_a_mano">Mano a mano</option>}
              {permiteEfectivo && <option value="con_efectivo">Ofrezco diferencia en efectivo</option>}
            </select>
          </div>
          {modalidad === "con_efectivo" && <div className="space-y-2"><Label htmlFor="monto">Efectivo que ofrecés (pesos)</Label><Input id="monto" inputMode="numeric" value={monto} onChange={(e) => setMonto(e.target.value.replace(/\D/g, ""))} /><p className="text-xs text-muted-foreground">{LEYENDA_EFECTIVO} {ACLARACION_DINERO}</p></div>}
          <div className="space-y-2"><Label htmlFor="mensaje">Mensaje</Label><Textarea id="mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)} /></div>
          <Button type="submit" disabled={enviar.isPending} className="w-full">{enviar.isPending ? "Enviando…" : "Enviar propuesta"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}
