import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, X, Repeat, Handshake, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoriasQuery, zonasQuery } from "@/lib/catalog";
import { PubCard, type PubResumen } from "@/components/PubCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Busqueda = { q?: string | undefined; cat?: string | undefined; zona?: string | undefined; modo?: string | undefined; cond?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Busqueda => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    cat: typeof s["cat"] === "string" && s["cat"] ? s["cat"] : undefined,
    zona: typeof s["zona"] === "string" && s["zona"] ? s["zona"] : undefined,
    modo: typeof s["modo"] === "string" && s["modo"] ? s["modo"] : undefined,
    cond: typeof s["cond"] === "string" && s["cond"] ? s["cond"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "MORENO CERCA · Trueques entre vecinos de Moreno" },
      {
        name: "description",
        content: "Comprá, vendé e intercambiá con vecinos de Moreno. Mano a mano o con diferencia en efectivo.",
      },
      { property: "og:title", content: "MORENO CERCA · Trueques entre vecinos" },
      {
        property: "og:description",
        content: "Lo que ya no necesitás puede ser lo que otro vecino está buscando.",
      },
    ],
  }),
  component: Inicio,
});

const POR_PAGINA = 24;

const MODOS = [
  { v: "trueque", label: "Trueque", icon: Repeat },
  { v: "mano", label: "Mano a mano", icon: Handshake },
  { v: "efectivo", label: "Con diferencia", icon: Coins },
  { v: "venta", label: "En venta", icon: null },
] as const;

function Inicio() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [texto, setTexto] = useState(search.q ?? "");
  const { data: cats } = useQuery(categoriasQuery);
  const { data: zonas } = useQuery(zonasQuery);

  const set = (patch: Partial<Busqueda>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const res = useInfiniteQuery({
    queryKey: ["feed", search],
    initialPageParam: 0,
    getNextPageParam: (last: PubResumen[], all) => (last.length === POR_PAGINA ? all.length : undefined),
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from("publicaciones")
        .select(
          "id, titulo, precio_ars, condicion, modalidad_trueque, publicado_en, zonas(nombre), publicacion_fotos(storage_path, orden)",
        )
        .eq("estado", "publicada")
        .neq("disponibilidad", "vendido")
        .order("publicado_en", { ascending: false, nullsFirst: false })
        .range(pageParam * POR_PAGINA, pageParam * POR_PAGINA + POR_PAGINA - 1);
      if (search.cat) q = q.eq("categoria_id", search.cat);
      if (search.zona) q = q.eq("zona_id", search.zona);
      if (search.cond) q = q.eq("condicion", search.cond);
      if (search.modo === "trueque") q = q.not("modalidad_trueque", "is", null);
      if (search.modo === "mano") q = q.in("modalidad_trueque", ["solo_mano_a_mano", "ambas"]);
      if (search.modo === "efectivo") q = q.in("modalidad_trueque", ["con_efectivo", "ambas"]);
      if (search.modo === "venta") q = q.gt("precio_ars", 0);
      const t = search.q?.replace(/[%,()*\\]/g, " ").trim();
      if (t) q = q.or(`titulo.ilike.%${t}%,descripcion.ilike.%${t}%,busco_a_cambio.ilike.%${t}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as PubResumen[];
    },
  });

  const items = res.data?.pages.flat() ?? [];
  const hayFiltros = !!(search.q || search.cat || search.zona || search.modo || search.cond);
  const sel = "h-10 rounded-full border bg-card px-3 text-sm font-medium";

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-primary px-5 py-6 text-primary-foreground md:px-8 md:py-8">
        <h1 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
          Lo que ya no usás, otro vecino lo está buscando.
        </h1>
        <p className="mt-2 text-sm opacity-90 md:text-base">
          Comprá. Vendé. Intercambiá. Mano a mano o con diferencia en efectivo.
        </p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            set({ q: texto.trim() || undefined });
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="¿Qué buscás? Ej: bici, heladera, clases…"
              className="h-12 rounded-full border-0 bg-card pl-9 text-foreground"
            />
          </div>
          <Button type="submit" variant="secondary" className="h-12 rounded-full px-5 font-bold">
            Buscar
          </Button>
        </form>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {MODOS.map((m) => (
          <button
            key={m.v}
            onClick={() => set({ modo: search.modo === m.v ? undefined : m.v })}
            className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold ${
              search.modo === m.v ? "border-primary bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            {m.icon && <m.icon className="h-4 w-4" />}
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <select className={sel} value={search.zona ?? ""} onChange={(e) => set({ zona: e.target.value || undefined })}>
          <option value="">Todo Moreno</option>
          {zonas?.map((z) => (
            <option key={z.id} value={z.id}>{z.nombre}</option>
          ))}
        </select>
        <select className={sel} value={search.cat ?? ""} onChange={(e) => set({ cat: e.target.value || undefined })}>
          <option value="">Todas las categorías</option>
          {cats?.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select className={sel} value={search.cond ?? ""} onChange={(e) => set({ cond: e.target.value || undefined })}>
          <option value="">Nuevo o usado</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
        {hayFiltros && (
          <Button
            variant="ghost"
            className="h-10 rounded-full"
            onClick={() => {
              setTexto("");
              navigate({ search: {}, replace: true });
            }}
          >
            <X className="h-4 w-4" /> Limpiar
          </Button>
        )}
      </div>

      {res.isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : res.isError ? (
        <p className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          No pudimos cargar las publicaciones. Revisá tu conexión y probá de nuevo.
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border bg-card p-8 text-center">
          <p className="font-display text-xl font-bold">
            {hayFiltros ? "No encontramos nada con esa búsqueda" : "Todavía no hay publicaciones"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hayFiltros
              ? "Probá con otras palabras o publicá lo que estás buscando: quizás alguien lo tiene."
              : "Sé el primer vecino en publicar algo para intercambiar."}
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/publicar">{hayFiltros ? "Publicar lo que buscás" : "Publicar algo"}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.map((p) => (
              <PubCard key={p.id} p={p} />
            ))}
          </div>
          {res.hasNextPage && (
            <div className="text-center">
              <Button variant="outline" className="rounded-full" disabled={res.isFetchingNextPage} onClick={() => res.fetchNextPage()}>
                {res.isFetchingNextPage ? "Cargando…" : "Ver más"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
