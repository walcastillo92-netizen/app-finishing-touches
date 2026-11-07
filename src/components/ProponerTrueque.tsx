import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
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
      const { data, error } = await supabase.from("publicaciones").select("id, titulo").eq("vendedor_id", session!.user.id).eq("estado", "publicada");
      if (error) throw error;
      return data;
    },
  });

  const enviar = useMutation({
    mutationFn: async () => {
      const cash = modalidad === "con_efectivo";
      const n = Number(monto.replace(/\./g, "").replace(",", "."));
      if (cash && !(n > 0)) throw new Error("Ingresá el monto que vas a sumar");
      if (!ofrecida && texto.trim().length < 2) throw new Error("Elegí una de tus publicaciones o describí qué ofrecés");
      const { error } = await sb.from("propuestas_trueque").insert({
        publicacion_destino: publicacionId,
        destinatario: vendedorId,
        publicacion_ofrecida: ofrecida || null,
        oferta_texto: texto.trim() || null,
        modalidad,
        efectivo_monto: cash ? n : null,
        paga: cash ? "proponente" : null,
        mensaje: mensaje.trim() || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Propuesta enviada. Te avisamos cuando respondan.");
      qc.invalidateQueries({ queryKey: ["propuestas"] });
      setOpen(false);
      navigate({ to: "/trueques" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (session === null)
    return (
      <Button asChild className="h-14 w-full rounded-full text-base font-bold">
        <Link to="/auth" search={{ redirect: typeof window !== "undefined" ? window.location.pathname : undefined }}><Repeat className="h-5 w-5" /> Entrá para proponer un trueque</Link>
      </Button>
    );

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={!session} className="h-14 w-full rounded-full text-base font-bold">
        <Repeat className="h-5 w-5" /> Proponer trueque
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proponer un trueque</DialogTitle>
            <DialogDescription>Contale al vecino qué le ofrecés a cambio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {permiteMano && permiteEfectivo && (
              <div className="space-y-2">
                <Label>Modalidad</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([["mano_a_mano", "Mano a mano"], ["con_efectivo", "Sumo efectivo"]] as const).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setModalidad(v)}
                      className={`min-h-11 rounded-xl border-2 px-3 text-sm font-semibold ${modalidad === v ? "border-primary bg-accent" : "border-transparent bg-card"}`}>{l}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="ofr">Ofrezco una de mis publicaciones</Label>
              <select id="ofr" className={sel} value={ofrecida} onChange={(e) => setOfrecida(e.target.value)}>
                <option value="">— Ninguna / describo abajo —</option>
                {misPubs?.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="txt">O describí qué ofrecés</Label>
              <Input id="txt" maxLength={200} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej: clases de guitarra, una amoladora…" />
            </div>
            {modalidad === "con_efectivo" && (
              <div className="space-y-2 rounded-2xl bg-accent p-3">
                <Label htmlFor="monto">Efectivo que sumás vos (ARS)</Label>
                <Input id="monto" inputMode="numeric" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="15000" />
                <p className="text-xs">{LEYENDA_EFECTIVO}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="msg">Mensaje (opcional)</Label>
              <Textarea id="msg" maxLength={500} rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">{ACLARACION_DINERO}</p>
            <Button className="h-12 w-full rounded-full font-bold" disabled={enviar.isPending} onClick={() => enviar.mutate()}>
              {enviar.isPending ? "Enviando…" : "Enviar propuesta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
    }
