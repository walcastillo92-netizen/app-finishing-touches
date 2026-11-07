import { Link } from "@tanstack/react-router";
import { MapPin, Repeat, ImageOff } from "lucide-react";
import { esNueva, fotoUrl, formatARS, MODALIDAD_LABEL, type ModalidadTrueque } from "@/lib/catalog";

export type PubResumen = {
  es_demo?: boolean;
  id: string;
  titulo: string | null;
  precio_ars: number | null;
  condicion: string | null;
  modalidad_trueque: string | null;
  publicado_en: string | null;
  zonas: { nombre: string } | null;
  publicacion_fotos: { storage_path: string; orden: number }[];
};

export function PubCard({ p }: { p: PubResumen }) {
  const foto = [...(p.publicacion_fotos ?? [])].sort((a, b) => a.orden - b.orden)[0];
  const url = fotoUrl(foto?.storage_path);
  return (
    <Link
      to="/p/$id"
      params={{ id: p.id }}
      className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square bg-muted">
        {url ? (
          <img
            src={url}
            alt={p.titulo ?? ""}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {p.es_demo && (
          <span className="absolute right-2 top-2 rounded-md bg-foreground/80 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-primary-foreground">
            BETA · DEMO
          </span>
        )}
        {!p.es_demo && esNueva(p.publicado_en) && (
          <span className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">
            Nuevo
          </span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{p.titulo}</h3>
        {p.modalidad_trueque && (
          <p className="flex items-center gap-1 text-xs font-semibold text-primary">
            <Repeat className="h-3.5 w-3.5" />
            {MODALIDAD_LABEL[p.modalidad_trueque as ModalidadTrueque]}
          </p>
        )}
        {p.precio_ars != null && p.precio_ars > 0 && (
          <p className="text-sm font-bold">{formatARS(p.precio_ars)}</p>
        )}
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {p.zonas?.nombre ?? "Moreno"}
          {p.condicion && <span>· {p.condicion === "nuevo" ? "Nuevo" : "Usado"}</span>}
        </p>
      </div>
    </Link>
  );
}
