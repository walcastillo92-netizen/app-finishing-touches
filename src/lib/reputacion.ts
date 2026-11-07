import { supabase } from "@/integrations/supabase/client";

export interface ReputacionResumen {
  promedio: number | null;
  cantidad: number;
}

export interface DatosValidacionCalificacion {
  operacionId: string;
  valoradoId: string;
  valoradorId: string;
  esDemo?: boolean;
  estadoOperacion: string;
}

export function validarCalificacion({
  operacionId,
  valoradoId,
  valoradorId,
  esDemo = false,
  estadoOperacion,
}: DatosValidacionCalificacion): { valida: boolean; motivo?: string } {
  if (esDemo) {
    return { valida: false, motivo: "No se pueden calificar publicaciones de demostración." };
  }
  if (!operacionId.trim()) {
    return { valida: false, motivo: "No se encontró la operación a calificar." };
  }
  if (!valoradoId.trim() || !valoradorId.trim()) {
    return { valida: false, motivo: "No se pudo identificar a los participantes." };
  }
  if (valoradoId === valoradorId) {
    return { valida: false, motivo: "No podés calificar tu propia operación." };
  }
  if (estadoOperacion !== "confirmado") {
    return { valida: false, motivo: "Solo podés calificar operaciones confirmadas." };
  }
  return { valida: true };
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
