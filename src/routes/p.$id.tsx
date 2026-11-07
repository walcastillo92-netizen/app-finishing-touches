import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Repeat, ShieldCheck, ArrowLeft, Pencil, FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ESTADO_LABEL, fotoUrl, formatARS, MODALIDAD_LABEL, type ModalidadTrueque } from "@/lib/catalog";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { ProponerTrueque } from "@/components/ProponerTrueque";
import { ContactarVenta } from "@/components/ContactarVenta";
import { AvisoSeguridad } from "@/components/AvisoSeguridad";
import { ReportarModal } from "@/components/ReportarModal";
import { ReputacionBadge } from "@/components/ReputacionBadge";
import { obtenerReputacionUsuario } from "@/lib/reputacion";

export const Route = createFileRoute("/p/$id")({
  head: () => ({
    meta: [
      { title: "Publicación · MORENO CERCA" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Mirá esta publicación de un vecino de Moreno y proponé un trueque." },
      { property: "og:title", content: "Publicación en MORENO CERCA" },
      { property: "og:description", content: "Intercambiá mano a mano o con diferencia en efectivo." },
    ],
  }),
  component: Detalle,
});

function Detalle() {
  const { id } = Route.useParams();
  const session = useSession();
  const { data: p, isLoading } = useQuery({
    queryKey: ["publicacion", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publicaciones")
        .select(
          "*, zonas(nombre), categorias(nombre), perfiles(id, nombre_publico, avatar_url, nivel_verificacion), publicacion_fotos(id, storage_path, orden)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: reputacion } = useQuery({
    queryKey: ["reputacion-vendedor", p?.vendedor_id],
    queryFn: () => obtenerReputacionUsuario(p!.vendedor_id),
    enabled: Boolean(p?.vendedor_id && !p.es_demo),
  });

  if (isLoading) return <div className="aspect-square max-w-xl animate-pulse rounded-3xl bg-muted" />;
  if (!p)
    return (
      <div className="rounded-3xl border bg-card p-8 text-center">
        <p className="font-display text-xl font-bold">Esta publicación no está disponible</p>
        <Button asChild className="mt-4 rounded-full"><Link to="/">Volver al inicio</Link></Button>
      </div>
    );

  const fotos = [...p.publicacion_fotos].sort((a, b) => a.orden - b.orden);
  const esMia = session?.user.id === p.vendedor_id;
  const modalidad = p.modalidad_trueque as ModalidadTrueque | null;

  return (
    <div className="space-y-4">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>
      {p.estado !== "publicada" && (
        <p className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
          Estado: {ESTADO_LABEL[p.estado] ?? p.estado}. Solo vos podés verla.
        </p>
      )}
      {p.es_demo && (
        <p className="flex items-start gap-2 rounded-2xl border-2 border-dashed border-foreground/40 bg-muted px-4 py-3 text-sm font-semibold"><FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />Publicación de demostración (BETA). Es un ejemplo de MORENO CERCA, no pertenece a ningún vecino y no admite contacto ni trueques.</p>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-3xl">
          {fotos.length ? (
            fotos.map((f) => (
              <div key={f.id} className="relative w-full shrink-0 snap-center">
                <img src={fotoUrl(f.storage_path) ?? undefined} alt={p.titulo ?? ""} className="aspect-square w-full rounded-3xl object-cover" />
                {p.es_demo && <span className="absolute right-3 top-3 rounded-md bg-foreground/80 px-2.5 py-1 text-xs font-extrabold tracking-wide text-primary-foreground">BETA · DEMO</span>}
              </div>
            ))
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-muted text-muted-foreground">Sin fotos</div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">{p.categorias?.nombre}</p>
            <h1 className="font-display text-3xl font-extrabold leading-tight">{p.titulo}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {p.zonas?.nombre ?? "Moreno"}
              {p.condicion && <> · {p.condicion === "nuevo" ? "Nuevo" : "Usado"}</>}
              {p.disponibilidad === "reservado" && <> · Reservado</>}
            </p>
          </div>
          {modalidad && (
            <div className="rounded-2xl border-2 border-primary bg-accent p-4">
              <p className="flex items-center gap-2 font-display text-lg font-bold text-primary">
                <Repeat className="h-5 w-5" /> Acepta trueque
              </p>
              <p className="text-sm font-semibold">{MODALIDAD_LABEL[modalidad]}</p>
              {p.busco_a_cambio && (
                <p className="mt-2 text-sm"><span className="font-semibold">Busca a cambio:</span> {p.busco_a_cambio}</p>
              )}
            </div>
          )}
          {p.precio_ars != null && p.precio_ars > 0 && (
            <p className="text-sm">
              <span className="text-muted-foreground">Precio de venta: </span>
              <span className="text-xl font-bold">{formatARS(p.precio_ars)}</span>
            </p>
          )}
          {p.es_demo ? null : esMia ? (
            <Button asChild variant="outline" className="h-12 w-full rounded-full">
              <Link to="/publicar" search={{ id: p.id }}><Pencil className="h-4 w-4" /> Editar mi publicación</Link>
            </Button>
          ) : (
            <div className="space-y-2">
              {modalidad && <ProponerTrueque publicacionId={p.id} vendedorId={p.vendedor_id} modalidadPub={modalidad} />}
              {p.precio_ars != null && p.precio_ars > 0 && (
                <ContactarVenta publicacionId={p.id} vendedorId={p.vendedor_id} precioArs={p.precio_ars} titulo={p.titulo} />
              )}
            </div>
          )}
          <div className="whitespace-pre-line rounded-2xl bg-card p-4 text-sm leading-relaxed">{p.descripcion}</div>
          {p.es_demo ? (
            <div className="rounded-2xl border bg-card p-4 text-sm"><p className="font-semibold">MORENO CERCA · Contenido de prueba (BETA)</p><p className="text-xs text-muted-foreground">Esta publicación no pertenece a un vecino real.</p></div>
          ) : p.perfiles && (
            <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-muted font-bold">
                {p.perfiles.avatar_url ? (
                  <img src={fotoUrl(p.perfiles.avatar_url, "avatares")!} alt="" className="h-full w-full object-cover" />
                ) : (
                  p.perfiles.nombre_publico[0]
                )}
              </div>
              <div>
                <p className="font-semibold">{p.perfiles.nombre_publico}</p>
                {p.perfiles.nivel_verificacion !== "ninguna" && (
                  <p className="flex items-center gap-1 text-xs font-semibold text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Verificado</p>
                )}
                <ReputacionBadge promedio={reputacion?.promedio ?? null} cantidad={reputacion?.cantidad ?? 0} tamano="sm" />
              </div>
            </div>
          )}
        </div>
      </div>
      {!p.es_demo && (
        <div className="space-y-3">
          <AvisoSeguridad variante="completo" />
          {!esMia && <ReportarModal publicacionId={p.id} titulo={p.titulo} />}
        </div>
      )}
    </div>
  );
}
