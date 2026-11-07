import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Negociacion } from "@/components/Negociacion";
import { sb, PROPUESTA_SELECT, type Propuesta } from "@/lib/trueques";

export const Route = createFileRoute("/_authenticated/trueques")({
  head: () => ({ meta: [{ title: "Mis negociaciones · MORENO CERCA" }] }),
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
  const leerTodo = useMutation({
    mutationFn: async () => {
      const { error } = await sb.from("notificaciones").update({ leida: true }).eq("leida", false);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["avisos"] }); qc.invalidateQueries({ queryKey: ["avisos-no-leidos"] }); },
  });

  const lista = props ?? [];
  const responder = lista.filter((p) => p.estado === "pendiente" && p.destinatario === userId);
  const enCurso = lista.filter((p) => p.estado === "aceptada" || (p.estado === "pendiente" && p.proponente === userId));
  const historial = lista.filter((p) => !responder.includes(p) && !enCurso.includes(p));
  const noLeidos = avisos?.filter((a) => !a.leida).length ?? 0;

  const Grupo = ({ titulo, items }: { titulo: string; items: Propuesta[] }) =>
    items.length ? (
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">{titulo}</h2>
        {items.map((p) => <Negociacion key={p.id} p={p} me={userId} />)}
      </section>
    ) : null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold">Mis negociaciones</h1>
      {!!avisos?.length && (
        <section className="rounded-3xl border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-2 font-bold"><Bell className="h-4 w-4" /> Avisos {noLeidos > 0 && <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">{noLeidos}</span>}</p>
            {noLeidos > 0 && <Button variant="ghost" size="sm" onClick={() => leerTodo.mutate()}>Marcar leídos</Button>}
          </div>
          <ul className="space-y-1 text-sm">
            {avisos.slice(0, 5).map((a) => <li key={a.id} className={a.leida ? "text-muted-foreground" : "font-semibold"}>{a.titulo}</li>)}
          </ul>
        </section>
      )}
      {isLoading && <div className="h-24 animate-pulse rounded-3xl bg-muted" />}
      {!isLoading && !lista.length && (
        <div className="rounded-3xl border bg-card p-8 text-center">
          <p className="font-display text-xl font-bold">Todavía no tenés trueques</p>
          <p className="mt-1 text-sm text-muted-foreground">Entrá a una publicación y tocá «Proponer trueque».</p>
        </div>
      )}
      <Grupo titulo="Esperan tu respuesta" items={responder} />
      <Grupo titulo="En curso" items={enCurso} />
      <Grupo titulo="Historial" items={historial} />
    </div>
  );
}
