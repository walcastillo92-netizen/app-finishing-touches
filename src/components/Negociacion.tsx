import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, MessageCircle, ShieldAlert, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  sb, ESTADO_PROPUESTA_LABEL, LEYENDA_EFECTIVO, resumenOferta, type Propuesta,
} from "@/lib/trueques";

const sel = "h-11 w-full rounded-xl border bg-card px-3 text-sm";
export function Negociacion({ p, me, abierta = false }: { p: Propuesta; me: string; abierta?: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(abierta);
  const [contra, setContra] = useState(false);
  const soyProponente = p.proponente === me;
  const otroId = soyProponente ? p.destinatario : p.proponente;
  const otroNombre = (soyProponente ? p.dest : p.prop)?.nombre_publico ?? "Vecino";
  const yaConfirme = soyProponente ? p.confirmo_proponente : p.confirmo_destinatario;
  const refrescar = () => {
    qc.invalidateQueries({ queryKey: ["propuestas"] });
    qc.invalidateQueries({ queryKey: ["avisos"] });
  };
  
  const responder = useMutation({
    mutationFn: async (accion: string) => {
      const { error } = await sb.rpc("responder_propuesta", { p_id: p.id, p_accion: accion });
      if (error) throw error;
    },
    onSuccess: refrescar,
    onError: (error) => toast.error(error.message),
  });
  return <article className="space-y-3 rounded-lg border bg-card p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0"><h2 className="font-display text-lg font-bold">{otroNombre}</h2>
        <Link to="/p/$id" params={{ id: p.publicacion_destino }} className="font-semibold text-primary">{p.destino?.titulo ?? "Publicación"}</Link>
        <p className="text-sm text-muted-foreground">{ESTADO_PROPUESTA_LABEL[p.estado] ?? p.estado}</p>
      </div>
      <Button variant="ghost" size="icon" aria-label={open ? "Cerrar negociación" : "Ver negociación"} onClick={() => setOpen(!open)}><ChevronDown className="h-5 w-5" /></Button>
    </div>
    {open && <div className="space-y-3">
      <p className="text-sm">{resumenOferta(p)}</p>
      {p.efectivo_monto != null && <p className="text-sm">Diferencia: {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(p.efectivo_monto)} · paga {p.paga === "proponente" ? "quien propone" : "quien recibe"}</p>}
      {p.modalidad === "con_efectivo" && <p className="text-xs text-muted-foreground">{LEYENDA_EFECTIVO}</p>}
      {p.mensaje && <p className="whitespace-pre-line text-sm">{p.mensaje}</p>}
      {p.estado === "pendiente" && <div className="flex flex-wrap gap-2">
        {soyProponente ? <Button variant="outline" disabled={responder.isPending} onClick={() => responder.mutate("cancelar")}>Cancelar</Button> : <>
          <Button disabled={responder.isPending} onClick={() => responder.mutate("aceptar")}><Check className="h-4 w-4" /> Aceptar</Button>
          <Button variant="outline" disabled={responder.isPending} onClick={() => responder.mutate("rechazar")}><X className="h-4 w-4" /> Rechazar</Button>
        </>}
      </div>}
    </div>}
  </article>;
}
