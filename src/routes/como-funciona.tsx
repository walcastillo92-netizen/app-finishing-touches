import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Handshake,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Cómo funciona · MORENO CERCA" },
      {
        name: "description",
        content:
          "Aprendé a comprar, vender e intercambiar con vecinos de Moreno de forma simple y segura.",
      },
    ],
  }),
  component: ComoFunciona,
});

const pasos = [
  {
    numero: "01",
    icono: UserPlus,
    titulo: "Creá tu cuenta",
    texto:
      "Registrate gratis, completá tu nombre público y elegí tu zona de Moreno. Así podés conectar con personas de tu barrio.",
  },
  {
    numero: "02",
    icono: Camera,
    titulo: "Publicá lo que ofrecés",
    texto:
      "Agregá fotos claras, una descripción honesta y el estado del artículo. Elegí si querés venderlo, intercambiarlo o aceptar ambas opciones.",
  },
  {
    numero: "03",
    icono: Search,
    titulo: "Encontrá algo cerca",
    texto:
      "Explorá las publicaciones, buscá por palabra y filtrá por categoría, zona o modalidad. Entrá en cada publicación para ver sus detalles.",
  },
  {
    numero: "04",
    icono: MessageCircle,
    titulo: "Contactá y coordiná",
    texto:
      "Para una compra, iniciá el contacto con el vendedor y coordiná directamente por WhatsApp. Acordá el día, el horario y el lugar de encuentro.",
  },
  {
    numero: "05",
    icono: Handshake,
    titulo: "Confirmá la operación",
    texto:
      "En una venta, el vendedor puede confirmar si se concretó desde Compras y ventas. En un trueque, las dos personas pueden confirmar el intercambio desde la sección Trueques.",
  },
  {
    numero: "06",
    icono: CheckCircle2,
    titulo: "Compartí tu experiencia",
    texto:
      "Cuando la operación esté confirmada, dejá tu valoración si la aplicación habilita esa opción. Las opiniones ayudan a construir confianza entre vecinos.",
  },
];

function ComoFunciona() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
      <div>
        <Button asChild variant="ghost" className="-ml-3 mb-4 rounded-full">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
        <div className="rounded-3xl bg-primary px-5 py-8 text-primary-foreground sm:px-8 sm:py-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] opacity-80">
            MORENO CERCA
          </p>
          <h1 className="max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Comprar, vender e intercambiar entre vecinos es así de simple.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-90 sm:text-base">
            Una guía rápida para aprovechar la comunidad de Moreno y coordinar
            operaciones mano a mano.
          </p>
          <Button asChild variant="secondary" className="mt-6 min-h-11 rounded-full font-bold">
            <Link to="/">
              Explorar publicaciones
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Cómo empezar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seguí estos pasos para publicar o encontrar lo que necesitás.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pasos.map(({ numero, icono: Icono, titulo, texto }) => (
            <article
              key={numero}
              className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-extrabold tracking-widest text-primary">
                  PASO {numero}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icono className="h-5 w-5" />
                </span>
              </div>
              <h3 className="font-semibold">{titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {texto}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">¿Cómo funciona una compra?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              MORENO CERCA facilita el contacto entre vecinos; no cobra ni procesa
              el pago. El comprador y el vendedor acuerdan los detalles por su
              cuenta. Si concretan la operación, el vendedor la confirma en
              Compras y ventas y luego se puede habilitar la valoración.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Handshake className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">¿Y un trueque?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Enviá una propuesta sobre una publicación. La otra persona puede
              responderla y, si acepta, ambas partes confirman cuando el
              intercambio se haya realizado.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Cuidate en cada encuentro</h2>
        </div>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Elegí lugares públicos, concurridos y conocidos de Moreno.
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            No envíes adelantos ni compartas claves o códigos de verificación.
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Revisá el producto antes de pagar o completar el intercambio.
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Si algo te parece sospechoso, no sigas adelante y reportá la publicación.
          </li>
          <li className="flex gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Acordá de antemano el punto de encuentro y avisale a alguien de confianza.
          </li>
        </ul>
      </section>

      <div className="flex flex-col gap-3 rounded-3xl bg-muted/60 p-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold">¿Listo para empezar?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Descubrí qué están ofreciendo tus vecinos.
          </p>
        </div>
        <Button asChild className="min-h-11 rounded-full font-bold">
          <Link to="/">
            Ver publicaciones
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
