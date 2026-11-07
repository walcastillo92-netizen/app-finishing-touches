import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Negociacion } from "@/components/Negociacion";
import { sb, PROPUESTA_SELECT, type Propuesta } from "@/lib/trueques";

export const Route = createFileRoute("/_authenticated/trueques")({
  head: () => ({ meta: [
    { title: "Mis negociaciones · MORENO CERCA" },
    { name: "description", content: "Revisá tus propuestas y acuerdos de trueque con vecinos de Moreno." },
    { property: "og:title", content: "Mis negociaciones · MORENO CERCA" },
    { property: "og:description", content: "Tus propuestas y acuerdos de trueque entre vecinos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Trueques,
});

interface Aviso { id: string; titulo: string; leida: boolean; creado_en: string }

function Trueques() {
  const { userId } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: props, isLoading } = useQuery({
    queryKey: ["propuestas", userId],
    refetchInterval: 20000,
    queryFn: async () => {
      const { data, error } = await sb.from("propuestas_trueque").select(PROPUESTA_SELECT).order("actualizado_en", { ascending: false });
      if (error) throw error;
      return data as unknown as Propuesta[];
    },
  });
  const { data: avisos } = useQuery({
    queryKey: ["avisos", userId],
    refetchInterval: 20000,
    queryFn: async () => {
      const { data, error } = await sb.from("notificaciones").select("id, titulo, leida, creado_en").order("creado_en", { ascending: false }).limit(15);
      if (error) throw error;
      return data as Aviso[];
    },
  });
  const leer = useMutation({
    mutationFn: async () => {
      const { error } = await sb.from("notificaciones").update({ leida: true }).eq("usuario_id", userId).eq("leida", false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["avisos"] });
      qc.invalidateQueries({ queryKey: ["avisos-no-leidos"] });
    },
  });
  return <div className="space-y-5">
    <h1 className="font-display text-3xl font-extrabold">Mis negociaciones</h1>
    {!!avisos?.length && <section className="space-y-2">
      <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-bold"><Bell className="h-4 w-4" /> Avisos</h2><Button variant="ghost" disabled={leer.isPending} onClick={() => leer.mutate()}>Marcar como leídos</Button></div>
      {avisos.map((a) => <p key={a.id} className={`text-sm ${a.leida ? "text-muted-foreground" : "font-semibold"}`}>{a.titulo}</p>)}
    </section>}
    {isLoading ? <p className="text-muted-foreground">Cargando negociaciones…</p> : !props?.length ? <p className="text-muted-foreground">Todavía no tenés propuestas de trueque.</p> : <div className="space-y-3">{props.map((p) => <Negociacion key={p.id} p={p} me={userId} />)}</div>}
  </div>;
}
