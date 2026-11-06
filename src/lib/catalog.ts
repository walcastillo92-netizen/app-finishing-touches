import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const categoriasQuery = queryOptions({
  queryKey: ["categorias"],
  staleTime: 1000 * 60 * 30,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("id, nombre, slug")
      .eq("activa", true)
      .order("orden");
    if (error) throw error;
    return data;
  },
});

export const zonasQuery = queryOptions({
  queryKey: ["zonas"],
  staleTime: 1000 * 60 * 30,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("zonas")
      .select("id, nombre, tipo, municipio_id")
      .eq("activa", true)
      .order("nombre");
    if (error) throw error;
    // "Otro / No especificado" siempre al final
    return [...data].sort((a, b) =>
      a.nombre.startsWith("Otro") ? 1 : b.nombre.startsWith("Otro") ? -1 : 0,
    );
  },
});

export function fotoUrl(path: string | null | undefined, bucket = "publicaciones") {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export type ModalidadTrueque = "solo_mano_a_mano" | "con_efectivo" | "ambas";

export const MODALIDAD_LABEL: Record<ModalidadTrueque, string> = {
  solo_mano_a_mano: "Solo mano a mano",
  con_efectivo: "Acepta diferencia en efectivo",
  ambas: "Mano a mano o con diferencia",
};

export const ESTADO_LABEL: Record<string, string> = {
  borrador: "Borrador",
  publicada: "Activa",
  pausada: "Pausada",
  oculta: "Oculta",
  eliminada: "Eliminada",
  en_revision: "En revisión",
  suspendida_por_reporte: "Suspendida por reporte",
  rechazada: "Rechazada por moderación",
  intercambiada: "Intercambiada / Vendida",
  finalizada: "Finalizada",
};

export const FALTANTE_LABEL: Record<string, string> = {
  titulo: "Título de al menos 8 letras",
  descripcion: "Descripción de al menos 30 letras",
  precio: "Precio de venta o elegir trueque",
  categoria: "Categoría",
  condicion: "Estado: nuevo o usado",
  zona: "Barrio",
  fotos: "Al menos 3 fotos (mínimo 600×600 px)",
};

export function formatARS(n: number | null | undefined) {
  if (n == null) return "";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function esNueva(fecha: string | null | undefined, dias = 3) {
  if (!fecha) return false;
  return Date.now() - new Date(fecha).getTime() < dias * 86400000;
}
