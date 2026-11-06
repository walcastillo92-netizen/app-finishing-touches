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
