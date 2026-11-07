import { Ban, Eye, Lock, MapPin, ShieldCheck } from "lucide-react";

export function AvisoSeguridad({
  variante = "completo",
  className = "",
}: {
  variante?: "completo" | "banner" | "compacto";
  className?: string;
}) {
  if (variante === "compacto") {
    return (
      <div
        className={`flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground ${className}`}
      >
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          <strong>Seguridad vecinal:</strong> Acordá en lugares públicos de Moreno. No adelantes
          dinero y revisá el producto antes de intercambiar.
        </span>
      </div>
    );
  }

  if (variante === "banner") {
    return (
      <div
        className={`flex flex-col gap-2 rounded-2xl border border-primary/20 bg-accent/40 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between ${className}`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-semibold text-foreground">
            Encuentros seguros entre vecinos de Moreno
          </span>
        </div>
        <p className="text-muted-foreground sm:text-right">
          Puntos públicos · Sin anticipos · Revisión en mano
        </p>
      </div>
    );
  }

  const consejos = [
    { Icon: MapPin, texto: "Reunirse en lugares públicos y concurridos." },
    { Icon: Ban, texto: "No adelantar dinero ni señas bancarias." },
    { Icon: Eye, texto: "Verificar y probar el producto antes de canjear." },
    { Icon: Lock, texto: "No compartir datos personales sensibles." },
  ];

  return (
    <section
      className={`space-y-3 rounded-2xl border border-primary/20 bg-muted/40 p-4 ${className}`}
    >
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <ShieldCheck className="h-4 w-4 text-primary" /> Recomendaciones de seguridad
      </h2>
      <ul className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        {consejos.map(({ Icon, texto }) => (
          <li key={texto} className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
            {texto}
          </li>
        ))}
      </ul>
    </section>
  );
}
