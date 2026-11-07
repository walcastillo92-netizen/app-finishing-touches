import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Repeat, ShieldCheck, ArrowLeft, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ESTADO_LABEL, fotoUrl, formatARS, MODALIDAD_LABEL, type ModalidadTrueque } from "@/lib/catalog";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { ProponerTrueque } from "@/components/ProponerTrueque";

export const Route = createFileRoute("/p/$id")({
  head: () => ({
    meta: [
      { title: "Publicación · MORENO CERCA" },
      { name: "description", content: "Mirá esta publicación de un vecino de Moreno y proponé un trueque." },
      { property: "og:title", content: "Publicación en MORENO CERCA" },
      { property: "og:description", content: "Intercambiá mano a mano o con diferencia en efectivo." },
    ],
  }),
  component: Detalle,
});

function Detalle() {
  const { id } = Route.useParams();
  const session = useSession();
  const { data: p, isLoading } = useQuery({
    queryKey: ["publicacion", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publicaciones")
        .select(
          "*, zonas(nombre), categorias(nombre), perfiles(id, nombre_publico, avatar_url, nivel_verificacion), publicacion_fotos(id, storage_path, orden)",
        )
