import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, MessageCircle, ShieldAlert, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  sb, ESTADO_PROPUESTA_LABEL, LEYENDA_EFECTIVO, MOTIVOS_DENUNCIA, resumenOferta, type Propuesta,
} from "@/lib/trueques";

const sel = "h-11 w-full rounded-xl border bg-card px-3 text-sm";
const tono: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-900",
  aceptada: "bg-emerald-100 text-emerald-900",
  confirmada: "bg-primary text-primary-foreground",
  rechazada: "bg-muted text-muted-foreground",
  cancelada: "bg-muted text-muted-foreground",
  contrapropuesta: "bg-muted text-muted-foreground",
};

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
  
