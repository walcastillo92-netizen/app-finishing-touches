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
