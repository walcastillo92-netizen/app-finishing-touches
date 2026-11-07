import { supabase } from "@/integrations/supabase/client";

export interface ReputacionResumen {
  promedio: number | null;
  cantidad: number;
}

export async function obtenerReputacionUsuario(vendedorId: string): Promise<ReputacionResumen> {
  const { data, error } = await supabase
    .from("reputacion_vendedores")
    .select("promedio, cantidad")
    .eq("vendedor_id", vendedorId)
    .maybeSingle();

  if (error || !data) return { promedio: null, cantidad: 0 };
  return {
    promedio: data.promedio == null ? null : Number(data.promedio),
    cantidad: data.cantidad == null ? 0 : Number(data.cantidad),
  };
}
