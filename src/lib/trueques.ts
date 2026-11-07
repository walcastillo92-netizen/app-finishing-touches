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
  "pendiente" | "aceptada" | "rechazada" | "contrapropuesta" | "confirmada" | "cancelada";

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
  prop: { id: string; nombre_publico: string } | null;
  dest: { id: string; nombre_publico: string } | null;
}

export const PROPUESTA_SELECT =
  "*, destino:publicaciones!propuestas_trueque_publicacion_destino_fkey(id, titulo), " +
  "ofrecida:publicaciones!propuestas_trueque_publicacion_ofrecida_fkey(id, titulo), " +
  "prop:perfiles!propuestas_trueque_proponente_fkey(id, nombre_publico), " +
  "dest:perfiles!propuestas_trueque_destinatario_fkey(id, nombre_publico)";

export const ESTADO_PROPUESTA_LABEL: Record<EstadoPropuesta, string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada · a coordinar",
  rechazada: "Rechazada",
  contrapropuesta: "Contraofertada",
  confirmada: "Intercambio concretado",
  cancelada: "Cancelada",
};

export const LEYENDA_EFECTIVO =
  "La compensación monetaria es voluntaria y solo puede ser ofrecida por quien paga el dinero. Moreno Cerca protege el trueque comunitario.";

export const ACLARACION_DINERO =
  "MORENO CERCA facilita el contacto entre vecinos, pero no cobra, recibe, retiene ni custodia dinero. El pago se acuerda y realiza directamente entre las partes.";

export const MOTIVOS_DENUNCIA: Record<string, string> = {
  estafa: "Intento de estafa",
  enganoso: "Publicación engañosa",
  ofensivo: "Trato ofensivo",
  spam: "Spam",
  prohibido: "Producto prohibido",
  otro: "Otro motivo",
};

/** Describe en una frase quién pone qué, para que no haya ambigüedad. */
export function resumenOferta(p: Propuesta): string {
  const quien = p.prop?.nombre_publico ?? "El vecino";
  const otro = p.dest?.nombre_publico ?? "el otro vecino";
  const cosa = p.ofrecida?.titulo ?? p.oferta_texto ?? "algo a convenir";
  if (p.modalidad === "con_efectivo" && p.efectivo_monto) {
    const monto = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(p.efectivo_monto);
    const paga = p.paga === "proponente" ? quien : otro;
    const cobra = p.paga === "proponente" ? otro : quien;
    return `${quien} ofrece «${cosa}». ${paga} suma ${monto} a favor de ${cobra}.`;
  }
  return `${quien} ofrece «${cosa}» mano a mano, sin dinero.`;
}
