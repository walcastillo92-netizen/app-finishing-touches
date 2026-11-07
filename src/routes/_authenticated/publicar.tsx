import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  categoriasQuery,
  ESTADO_LABEL,
  FALTANTE_LABEL,
  fotoUrl,
  zonasQuery,
  type ModalidadTrueque,
} from "@/lib/catalog";
import { procesarImagen } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/publicar")({
  validateSearch: (s: Record<string, unknown>): { id?: string | undefined } => ({
    id: typeof s["id"] === "string" ? s["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Publicar · MORENO CERCA" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "description",
        content: "Publicá un producto o servicio para intercambiar o vender en Moreno.",
      },
      { property: "og:title", content: "Publicar · MORENO CERCA" },
      {
        property: "og:description",
        content: "Ofrecé lo que ya no usás y contá qué buscás a cambio.",
      },
    ],
  }),
  component: Publicar,
});

type Objetivo = "trueque" | "venta" | "ambos";
const MAX_FOTOS = 8;

const vacio = {
  titulo: "",
  descripcion: "",
  categoria_id: "",
  condicion: "",
  zona_id: "",
  objetivo: "trueque" as Objetivo,
  modalidad: "ambas" as ModalidadTrueque,
  busco_a_cambio: "",
  precio: "",
};

function Publicar() {
  const { id } = Route.useSearch();
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: cats } = useQuery(categoriasQuery);
  const { data: zonas } = useQuery(zonasQuery);
  const [f, setF] = useState(vacio);
  const [ocupado, setOcupado] = useState(false);
  const [subiendo, setSubiendo] = useState(0);

  const pub = useQuery({
    queryKey: ["mi-publicacion", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publicaciones")
        .select("*, publicacion_fotos(id, storage_path, orden, ancho, alto)")
        .eq("id", id!)
        .eq("vendedor_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const p = pub.data;

  useEffect(() => {
    if (!id) setF(vacio);
    if (!p) return;
    const venta = p.precio_ars != null && p.precio_ars > 0;
    setF({
      titulo: p.titulo ?? "",
      descripcion: p.descripcion ?? "",
      categoria_id: p.categoria_id ?? "",
      condicion: p.condicion ?? "",
      zona_id: p.zona_id ?? "",
      objetivo: p.modalidad_trueque ? (venta ? "ambos" : "trueque") : "venta",
      modalidad: (p.modalidad_trueque as ModalidadTrueque) ?? "ambas",
      busco_a_cambio: p.busco_a_cambio ?? "",
      precio: venta ? String(p.precio_ars) : "",
    });
  }, [p, id]);

  const fotos = [...(p?.publicacion_fotos ?? [])].sort((a, b) => a.orden - b.orden);
  const editable = !p || ["borrador", "publicada", "pausada"].includes(p.estado);

  function datos() {
    const trueque = f.objetivo !== "venta";
    const venta = f.objetivo !== "trueque";
    const precio = Number(f.precio.replace(/\D/g, ""));
    return {
      titulo: f.titulo.trim() || null,
      descripcion: f.descripcion.trim() || null,
      categoria_id: f.categoria_id || null,
      condicion: f.condicion || null,
      zona_id: f.zona_id || null,
      modalidad_trueque: trueque ? f.modalidad : null,
      busco_a_cambio: trueque ? f.busco_a_cambio.trim() || null : null,
      precio_ars: venta && precio > 0 ? precio : null,
    };
  }

  async function guardar(publicar: boolean) {
    setOcupado(true);
    try {
      let pid = id;
      if (!pid) {
        const { data, error } = await supabase
          .from("publicaciones")
          .insert({ ...datos(), vendedor_id: userId, estado: "borrador" })
          .select("id")
          .single();
        if (error) throw error;
        pid = data.id;
        toast.success("Borrador guardado. Ahora sumá las fotos.");
        navigate({ to: "/publicar", search: { id: pid }, replace: true });
        return;
      }
      const cambios = { ...datos(), ...(publicar ? { estado: "publicada" } : {}) };
      const { data, error } = await supabase
        .from("publicaciones")
        .update(cambios)
        .eq("id", pid)
        .select("estado, faltantes")
        .single();
      if (error) throw error;
      if (publicar && data.estado === "publicada") {
        toast.success("¡Tu publicación ya está activa!");
        navigate({ to: "/p/$id", params: { id: pid } });
      } else if (publicar) {
        toast.error("Todavía faltan datos para publicar. Lo guardamos como borrador.");
      } else {
        toast.success("Cambios guardados");
      }
      qc.invalidateQueries({ queryKey: ["mi-publicacion", pid] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos guardar");
    } finally {
      setOcupado(false);
    }
  }

  async function subirFotos(files: FileList) {
    if (!id) return;
    const lista = Array.from(files).slice(0, MAX_FOTOS - fotos.length);
    if (!lista.length) {
      toast.error(`Máximo ${MAX_FOTOS} fotos`);
      return;
    }
    setSubiendo(lista.length);
    let orden = (fotos.at(-1)?.orden ?? -1) + 1;
    for (const file of lista) {
      try {
        const img = await procesarImagen(file);
        if (img.ancho < 600 || img.alto < 600)
          toast.warning(
            "Una foto es chica (menos de 600 px): se guarda pero no cuenta para publicar.",
          );
        const path = `${userId}/${id}/${crypto.randomUUID()}.jpg`;
        const up = await supabase.storage
          .from("publicaciones")
          .upload(path, img.blob, { contentType: "image/jpeg" });
        if (up.error) throw up.error;
        const { error } = await supabase.from("publicacion_fotos").insert({
          publicacion_id: id,
          storage_path: path,
          orden: orden++,
          ancho: img.ancho,
          alto: img.alto,
          bytes: img.blob.size,
        });
        if (error) {
          await supabase.storage.from("publicaciones").remove([path]);
          throw error;
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No pudimos subir una foto");
      }
      setSubiendo((n) => n - 1);
    }
    qc.invalidateQueries({ queryKey: ["mi-publicacion", id] });
  }

  async function borrarFoto(fid: string, path: string) {
    const { error } = await supabase.from("publicacion_fotos").delete().eq("id", fid);
    if (error) {
      toast.error("No pudimos borrar la foto");
      return;
    }
    await supabase.storage.from("publicaciones").remove([path]);
    qc.invalidateQueries({ queryKey: ["mi-publicacion", id] });
  }

  if (id && pub.isLoading) return <div className="h-96 animate-pulse rounded-3xl bg-muted" />;
  if (id && !p)
    return (
      <div className="rounded-3xl border bg-card p-8 text-center">
        <p className="font-display text-xl font-bold">
          No encontramos esta publicación entre las tuyas
        </p>
        <Button asChild className="mt-4 rounded-full">
          <Link to="/publicar" search={{ id: undefined }}>
            Crear una nueva
          </Link>
        </Button>
      </div>
    );

  const sel = "h-12 w-full rounded-md border bg-card px-3";
  const faltan = p?.faltantes ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-extrabold">
          {id ? "Editar publicación" : "Publicar"}
        </h1>
        {p && (
          <p className="text-sm text-muted-foreground">
            Estado:{" "}
            <span className="font-semibold text-foreground">
              {ESTADO_LABEL[p.estado] ?? p.estado}
            </span>
          </p>
        )}
      </div>

      {!editable && (
        <p className="rounded-2xl bg-accent p-4 text-sm font-medium">
          Esta publicación no se puede editar en su estado actual.
        </p>
      )}

      {p && faltan.length > 0 && (
        <div className="rounded-2xl border border-destructive/40 bg-card p-4">
          <p className="flex items-center gap-2 font-semibold text-destructive">
            <AlertCircle className="h-4 w-4" /> Para publicar te falta:
          </p>
          <ul className="mt-1 list-inside list-disc text-sm">
            {faltan.map((x) => (
              <li key={x}>{FALTANTE_LABEL[x] ?? x}</li>
            ))}
          </ul>
        </div>
      )}
      {p && faltan.length === 0 && p.estado === "borrador" && (
        <p className="flex items-center gap-2 rounded-2xl bg-accent p-4 text-sm font-semibold text-accent-foreground">
          <CheckCircle2 className="h-4 w-4" /> ¡Está completa! Ya podés publicarla.
        </p>
      )}

      <fieldset
        disabled={!editable || ocupado}
        className="space-y-5 rounded-3xl border bg-card p-5"
      >
        <div className="space-y-2">
          <Label>¿Qué querés hacer?</Label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["trueque", "Intercambiar"],
                ["ambos", "Las dos"],
                ["venta", "Vender"],
              ] as const
            ).map(([v, l]) => (
              <button
                type="button"
                key={v}
                onClick={() => setF({ ...f, objetivo: v })}
                className={`h-12 rounded-xl border-2 text-sm font-bold ${f.objetivo === v ? "border-primary bg-accent text-primary" : "border-border"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            maxLength={120}
            value={f.titulo}
            onChange={(e) => setF({ ...f, titulo: e.target.value })}
            placeholder="Ej: Bicicleta rodado 26 con cambios"
            className="h-12"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Descripción</Label>
          <Textarea
            id="desc"
            maxLength={3000}
            rows={4}
            value={f.descripcion}
            onChange={(e) => setF({ ...f, descripcion: e.target.value })}
            placeholder="Contá cómo está, medidas, detalles, si tiene algún defecto…"
          />
          <p className="text-xs text-muted-foreground">
            {f.descripcion.trim().length}/30 letras mínimo
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="cat">Categoría</Label>
            <select
              id="cat"
              className={sel}
              value={f.categoria_id}
              onChange={(e) => setF({ ...f, categoria_id: e.target.value })}
            >
              <option value="">Elegí</option>
              {cats?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cond">Estado</Label>
            <select
              id="cond"
              className={sel}
              value={f.condicion}
              onChange={(e) => setF({ ...f, condicion: e.target.value })}
            >
              <option value="">Elegí</option>
              <option value="nuevo">Nuevo</option>
              <option value="usado">Usado</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zona">Barrio</Label>
            <select
              id="zona"
              className={sel}
              value={f.zona_id}
              onChange={(e) => setF({ ...f, zona_id: e.target.value })}
            >
              <option value="">Elegí</option>
              {zonas?.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {f.objetivo !== "venta" && (
          <div className="space-y-4 rounded-2xl bg-accent/60 p-4">
            <div className="space-y-2">
              <Label>¿Cómo aceptás el trueque?</Label>
              {(
                [
                  ["solo_mano_a_mano", "Solo mano a mano", "Cambio por cambio, sin dinero."],
                  [
                    "con_efectivo",
                    "Con diferencia en efectivo",
                    "Evaluás propuestas que suman un monto.",
                  ],
                  ["ambas", "Acepto las dos", "Mano a mano o con diferencia."],
                ] as const
              ).map(([v, l, d]) => (
                <label
                  key={v}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 bg-card p-3 ${f.modalidad === v ? "border-primary" : "border-transparent"}`}
                >
                  <input
                    type="radio"
                    name="mod"
                    className="mt-1"
                    checked={f.modalidad === v}
                    onChange={() => setF({ ...f, modalidad: v })}
                  />
                  <span>
                    <span className="block font-semibold">{l}</span>
                    <span className="text-xs text-muted-foreground">{d}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="busco">¿Qué buscás a cambio?</Label>
              <Textarea
                id="busco"
                maxLength={300}
                rows={2}
                value={f.busco_a_cambio}
                onChange={(e) => setF({ ...f, busco_a_cambio: e.target.value })}
                placeholder="Ej: herramientas, ropa de bebé, clases de inglés…"
              />
            </div>
          </div>
        )}

        {f.objetivo !== "trueque" && (
          <div className="space-y-1.5">
            <Label htmlFor="precio">Precio de venta (pesos)</Label>
            <Input
              id="precio"
              inputMode="numeric"
              value={f.precio}
              onChange={(e) => setF({ ...f, precio: e.target.value.replace(/\D/g, "") })}
              placeholder="Ej: 25000"
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Es el precio si alguien te lo compra. No es la diferencia de un trueque.
            </p>
          </div>
        )}
      </fieldset>

      {id && (
        <section className="space-y-3 rounded-3xl border bg-card p-5">
          <div>
            <h2 className="font-display text-lg font-bold">
              Fotos ({fotos.length}/{MAX_FOTOS})
            </h2>
            <p className="text-xs text-muted-foreground">
              Subí al menos 3 fotos reales y propias, de 600 px o más. JPG, PNG o WEBP.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {fotos.map((ft) => (
              <div
                key={ft.id}
                className="relative aspect-square overflow-hidden rounded-xl bg-muted"
              >
                <img
                  src={fotoUrl(ft.storage_path)!}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {editable && (
                  <button
                    type="button"
                    aria-label="Borrar foto"
                    onClick={() => borrarFoto(ft.id, ft.storage_path)}
                    className="absolute right-1 top-1 rounded-full bg-card p-1.5 text-destructive shadow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {Array.from({ length: subiendo }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
            ))}
            {editable && fotos.length < MAX_FOTOS && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-semibold text-muted-foreground">
                <ImagePlus className="h-6 w-6" /> Agregar
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) subirFotos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        </section>
      )}

      {editable && (
        <div className="sticky bottom-20 flex gap-2 md:bottom-4">
          <Button
            variant="outline"
            disabled={ocupado}
            onClick={() => guardar(false)}
            className="h-12 flex-1 rounded-full bg-card font-bold"
          >
            {id ? "Guardar cambios" : "Guardar y seguir con las fotos"}
          </Button>
          {id && p?.estado !== "publicada" && (
            <Button
              disabled={ocupado || subiendo > 0}
              onClick={() => guardar(true)}
              className="h-12 flex-1 rounded-full font-bold"
            >
              Publicar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
