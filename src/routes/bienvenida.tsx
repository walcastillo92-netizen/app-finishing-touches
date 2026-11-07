import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/bienvenida")({
  head: () => ({
    meta: [
      { title: "¡Bienvenido a MORENO CERCA!" },
      { name: "description", content: "Tu cuenta fue creada con éxito. Empezá a conectar e intercambiar con vecinos de Moreno." },
    ],
  }),
  component: BienvenidaPage,
});

function BienvenidaPage() {
  return (
    <div className="mx-auto max-w-xl py-6 space-y-6">
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">¡Tu cuenta ya está lista!</h1>
          <p className="text-sm text-muted-foreground">Te damos la bienvenida a la comunidad de trueque y comercio entre vecinos de Moreno.</p>
        </div>

        <div className="mt-6 space-y-3 text-left">
          <div className="flex items-start gap-3.5 rounded-2xl border bg-muted/40 p-4 transition-all hover:bg-muted/70">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm"><UserCheck className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm">1. Completá tu barrio y contacto</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Elegí tu zona de Moreno y agregá tu WhatsApp para facilitar los acuerdos.</p>
              <Button asChild size="sm" variant="outline" className="mt-2.5 h-9 rounded-full text-xs font-bold min-h-[36px]"><Link to="/perfil">Ir a mi Perfil</Link></Button>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border bg-muted/40 p-4 transition-all hover:bg-muted/70">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm"><PlusCircle className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm">2. Publicá tu primer artículo o servicio</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Subí fotos de lo que ya no usás y contá qué te gustaría recibir a cambio.</p>
              <Button asChild size="sm" variant="outline" className="mt-2.5 h-9 rounded-full text-xs font-bold min-h-[36px]"><Link to="/publicar" search={{ id: undefined }}>Crear publicación</Link></Button>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border bg-muted/40 p-4 transition-all hover:bg-muted/70">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm"><Search className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm">3. Explorá las publicaciones existentes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Mirá los trueques mano a mano o con diferencia cerca de tu casa.</p>
              <Button asChild size="sm" variant="default" className="mt-2.5 h-9 rounded-full text-xs font-bold min-h-[36px]"><Link to="/">Ver publicaciones <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-accent/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>Recordá pactar siempre los encuentros en puntos públicos y céntricos de Moreno.</span>
        </div>
      </div>
    </div>
  );
}