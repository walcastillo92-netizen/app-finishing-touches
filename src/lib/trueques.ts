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
