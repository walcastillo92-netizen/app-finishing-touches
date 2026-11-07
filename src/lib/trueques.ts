import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Cliente sin tipos para las tablas agregadas en la Etapa 2 (mensajes_trueque,
 * notificaciones, bloqueos, opiniones.propuesta_id). Cuando Lovable regenere
 * `types.ts` se puede volver a `supabase` directo.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sb = supabase as unknown as SupabaseClient<any>;

export type EstadoPropuesta =
  | "pendiente"
  | "aceptada"
  | "rechazada"
  | "contrapropuesta"
  | "confirmada"
  | "cancelada";

export interface Propuesta {
  id: string;
  publicacion_destino: string;
  publicacion_ofrecida: string | null;
  proponente: string;
  destinatario: string;
  modalidad: "mano_a_mano" | "con_efectivo";
  efectivo_monto: number | null;
  paga: "proponente" | "destinatario" | null;
  oferta_texto: string | null;
  mensaje: string | null;
  estado: EstadoPropuesta;
  contrapropuesta_de: string | null;
  confirmo_proponente: boolean;
  confirmo_destinatario: boolean;
  creado_en: string;
  actualizado_en: string;
  destino: { id: string; titulo: string } | null;
  ofrecida: { id: string; titulo: string } | null;
  prop: { nombre_publico: string } | null;
  dest: { nombre_publico: string } | null;
}

export const PROPUESTA_SELECT = "*, destino:publicaciones!propuestas_trueque_publicacion_destino_fkey(id, titulo), ofrecida:publicaciones!propuestas_trueque_publicacion_ofrecida_fkey(id, titulo), prop:perfiles!propuestas_trueque_proponente_fkey(nombre_publico), dest:perfiles!propuestas_trueque_destinatario_fkey(nombre_publico)";
export const ESTADO_PROPUESTA_LABEL: Record<EstadoPropuesta, string> = {
  pendiente: "Pendiente", aceptada: "Aceptada", rechazada: "Rechazada",
  contrapropuesta: "Contrapropuesta", confirmada: "Confirmada", cancelada: "Cancelada",
};
export const LEYENDA_EFECTIVO = "La diferencia en efectivo se acuerda entre vecinos, fuera de la app.";
export const ACLARACION_DINERO = "El precio de venta no es la diferencia de un trueque.";
export function resumenOferta(p: Propuesta) {
  return p.ofrecida?.titulo ?? p.oferta_texto ?? "Propuesta de trueque";
}
