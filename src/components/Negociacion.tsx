import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, MessageCircle, ShieldAlert, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  sb,
  ESTADO_PROPUESTA_LABEL,
  LEYENDA_EFECTIVO,
  MOTIVOS_DENUNCIA,
  resumenOferta,
  type Propuesta,
} from "@/lib/trueques";

const sel = "h-11 w-full rounded-xl border bg-card px-3 text-sm";
const tono: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-900",
  aceptada: "bg-emerald-100 text-emerald-900",
  confirmada: "bg-primary text-primary-foreground",
  rechazada: "bg-muted text-muted-foreground",
  cancelada: "bg-muted text-muted-foreground",
  contrapropuesta: "bg-muted text-muted-foreground",
};

export function Negociacion({
  p,
  me,
  abierta = false,
}: {
  p: Propuesta;
  me: string;
  abierta?: boolean;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(abierta);
  const [contra, setContra] = useState(false);
  const soyProponente = p.proponente === me;
  const otroId = soyProponente ? p.destinatario : p.proponente;
  const otroNombre = (soyProponente ? p.dest : p.prop)?.nombre_publico ?? "Vecino";
  const yaConfirme = soyProponente ? p.confirmo_proponente : p.confirmo_destinatario;
  const refrescar = () => {
    qc.invalidateQueries({ queryKey: ["propuestas"] });
    qc.invalidateQueries({ queryKey: ["avisos"] });
  };

  const responder = useMutation({
    mutationFn: async (accion: "aceptada" | "rechazada" | "cancelada" | "confirmar") => {
      const { error } = await sb.rpc("responder_propuesta", { p_id: p.id, p_accion: accion });
      if (error) throw new Error(error.message);
    },
    onSuccess: refrescar,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <article className="rounded-3xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold">
            {p.destino?.titulo ?? "Publicación"}
          </p>
          <p className="text-sm text-muted-foreground">
            {soyProponente ? "Le propusiste a" : "Te propuso"} {otroNombre}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${tono[p.estado]}`}>
          {ESTADO_PROPUESTA_LABEL[p.estado]}
        </span>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-4 border-t p-4">
          <p className="rounded-2xl bg-accent p-3 text-sm font-semibold text-accent-foreground">
            {resumenOferta(p)}
          </p>
          {p.mensaje && <p className="text-sm italic">“{p.mensaje}”</p>}

          <div className="flex flex-wrap gap-2">
            {p.estado === "pendiente" && !soyProponente && (
              <>
                <Button
                  className="rounded-full"
                  disabled={responder.isPending}
                  onClick={() => responder.mutate("aceptada")}
                >
                  <Check className="h-4 w-4" /> Aceptar
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setContra(!contra)}
                >
                  Contraofertar
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={responder.isPending}
                  onClick={() => responder.mutate("rechazada")}
                >
                  <X className="h-4 w-4" /> Rechazar
                </Button>
              </>
            )}
            {p.estado === "pendiente" && soyProponente && (
              <Button
                variant="outline"
                className="rounded-full"
                disabled={responder.isPending}
                onClick={() => responder.mutate("cancelada")}
              >
                Cancelar propuesta
              </Button>
            )}
            {p.estado === "aceptada" && !yaConfirme && (
              <Button
                className="rounded-full"
                disabled={responder.isPending}
                onClick={() => responder.mutate("confirmar")}
              >
                Confirmar intercambio concretado
              </Button>
            )}
          </div>
          {p.estado === "aceptada" && yaConfirme && (
            <p className="text-sm font-semibold text-muted-foreground">
              Ya confirmaste. Esperando a {otroNombre}.
            </p>
          )}

          {contra && p.estado === "pendiente" && !soyProponente && (
            <Contraoferta
              p={p}
              me={me}
              onDone={() => {
                setContra(false);
                refrescar();
              }}
            />
          )}
          {p.estado === "aceptada" && <Seguridad />}
          {(p.estado === "aceptada" || p.estado === "confirmada") && <Contacto id={p.id} />}
          {p.estado === "confirmada" && (
            <Valoracion propuestaId={p.id} otroNombre={otroNombre} me={me} />
          )}
          {["pendiente", "aceptada", "contrapropuesta", "confirmada"].includes(p.estado) && (
            <Chat p={p} me={me} />
          )}
          <Ayuda otroId={otroId} me={me} onBloqueado={refrescar} />
          <Link
            to="/p/$id"
            params={{ id: p.publicacion_destino }}
            className="block text-xs font-semibold text-primary"
          >
            Ver la publicación
          </Link>
        </div>
      )}
    </article>
  );
}

function Contraoferta({ p, me, onDone }: { p: Propuesta; me: string; onDone: () => void }) {
  const pagadorOriginal =
    p.paga === "proponente" ? p.proponente : p.paga === "destinatario" ? p.destinatario : null;
  const otroPagaYa = pagadorOriginal !== null && pagadorOriginal !== me; // no puedo tocar su monto
  const [texto, setTexto] = useState("");
  const [monto, setMonto] = useState("");
  const enviar = useMutation({
    mutationFn: async () => {
      if (texto.trim().length < 2) throw new Error("Describí tu contrapropuesta");
      let modalidad: "mano_a_mano" | "con_efectivo" = "mano_a_mano";
      let efectivo_monto: number | null = null;
      let paga: "proponente" | "destinatario" | null = null;
      if (otroPagaYa) {
        modalidad = "con_efectivo";
        efectivo_monto = p.efectivo_monto;
        paga = "destinatario";
      } else if (monto.trim()) {
        const n = Number(monto.replace(/\./g, "").replace(",", "."));
        if (!(n > 0)) throw new Error("Monto inválido");
        modalidad = "con_efectivo";
        efectivo_monto = n;
        paga = "proponente";
      }
      const { error } = await sb.from("propuestas_trueque").insert({
        publicacion_destino: p.publicacion_destino,
        destinatario: p.proponente,
        contrapropuesta_de: p.id,
        oferta_texto: texto.trim(),
        modalidad,
        efectivo_monto,
        paga,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Contrapropuesta enviada");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-2 rounded-2xl border p-3">
      <Input
        maxLength={200}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Tu contrapropuesta (qué ofrecés)"
      />
      {otroPagaYa ? (
        <p className="text-xs text-muted-foreground">
          El efectivo que ofreció el otro vecino queda igual: solo quien paga puede modificarlo.
        </p>
      ) : (
        <Input
          inputMode="numeric"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="Efectivo que sumás vos (opcional)"
        />
      )}
      <p className="text-xs text-muted-foreground">{LEYENDA_EFECTIVO}</p>
      <Button
        size="sm"
        className="rounded-full"
        disabled={enviar.isPending}
        onClick={() => enviar.mutate()}
      >
        Enviar contrapropuesta
      </Button>
    </div>
  );
}

function Chat({ p, me }: { p: Propuesta; me: string }) {
  const qc = useQueryClient();
  const [texto, setTexto] = useState("");
  const cerrado = p.estado === "confirmada";
  const { data } = useQuery({
    queryKey: ["mensajes", p.id],
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("mensajes_trueque")
        .select("id, autor_id, texto, creado_en")
        .eq("propuesta_id", p.id)
        .order("creado_en");
      if (error) throw error;
      return data as { id: string; autor_id: string; texto: string; creado_en: string }[];
    },
  });
  const enviar = useMutation({
    mutationFn: async () => {
      const { error } = await sb
        .from("mensajes_trueque")
        .insert({ propuesta_id: p.id, texto: texto.trim() });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setTexto("");
      qc.invalidateQueries({ queryKey: ["mensajes", p.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1 text-sm font-bold">
        <MessageCircle className="h-4 w-4" /> Mensajes de coordinación
      </p>
      <div className="max-h-60 space-y-1.5 overflow-y-auto rounded-2xl bg-muted/50 p-2">
        {data?.length ? (
          data.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.autor_id === me ? "ml-auto bg-primary text-primary-foreground" : "bg-card"}`}
            >
              {m.texto}
            </div>
          ))
        ) : (
          <p className="p-2 text-xs text-muted-foreground">
            Todavía no hay mensajes. Nunca compartas datos bancarios ni claves.
          </p>
        )}
      </div>
      {!cerrado && (
        <div className="flex gap-2">
          <Input
            maxLength={500}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí un mensaje"
          />
          <Button
            className="rounded-full"
            disabled={enviar.isPending || !texto.trim()}
            onClick={() => enviar.mutate()}
          >
            Enviar
          </Button>
        </div>
      )}
    </div>
  );
}

function Contacto({ id }: { id: string }) {
  const ver = useMutation({
    mutationFn: async () => {
      const { data, error } = await sb.rpc("contacto_trueque", { p_id: id });
      if (error) throw new Error(error.message);
      return (data as { whatsapp: string }).whatsapp;
    },
    onSuccess: (wa) => window.open(`https://wa.me/${wa.replace(/\D/g, "")}`, "_blank", "noopener"),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full"
      disabled={ver.isPending}
      onClick={() => ver.mutate()}
    >
      Contactar por WhatsApp
    </Button>
  );
}

function Seguridad() {
  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
      <p className="mb-1 flex items-center gap-1 font-bold">
        <ShieldAlert className="h-4 w-4" /> Encuentro seguro
      </p>
      <ul className="list-disc space-y-0.5 pl-4">
        <li>Encontrate en un lugar público y con gente (plaza, estación, comercio).</li>
        <li>Preferí horario diurno y avisale a alguien de confianza.</li>
        <li>Revisá el producto antes de entregar o pagar. No adelantes dinero.</li>
        <li>Si algo te hace dudar, no sigas y denuncialo desde acá.</li>
      </ul>
    </div>
  );
}

function Valoracion({
  propuestaId,
  otroNombre,
  me,
}: {
  propuestaId: string;
  otroNombre: string;
  me: string;
}) {
  const qc = useQueryClient();
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState("");
  const { data: mia } = useQuery({
    queryKey: ["opinion", propuestaId],
    queryFn: async () => {
      const { data, error } = await sb
        .from("opiniones")
        .select("puntaje, comentario")
        .eq("propuesta_id", propuestaId)
        .eq("autor_id", me)
        .maybeSingle();
      if (error) throw error;
      return data as { puntaje: number; comentario: string | null } | null;
    },
  });
  const enviar = useMutation({
    mutationFn: async () => {
      if (!puntaje) throw new Error("Elegí de 1 a 5 estrellas");
      const { error } = await sb
        .from("opiniones")
        .insert({ propuesta_id: propuestaId, puntaje, comentario: comentario.trim() || null });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("¡Gracias por valorar!");
      qc.invalidateQueries({ queryKey: ["opinion", propuestaId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  if (mia)
    return (
      <p className="text-sm font-semibold">
        Tu valoración a {otroNombre}: {"★".repeat(mia.puntaje)}
      </p>
    );
  return (
    <div className="space-y-2 rounded-2xl border p-3">
      <p className="text-sm font-bold">¿Cómo te fue con {otroNombre}?</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrellas`}
            onClick={() => setPuntaje(n)}
            className="p-1"
          >
            <Star
              className={`h-7 w-7 ${n <= puntaje ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
            />
          </button>
        ))}
      </div>
      <Textarea
        rows={2}
        maxLength={500}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Comentario (opcional)"
      />
      <Button
        size="sm"
        className="rounded-full"
        disabled={enviar.isPending}
        onClick={() => enviar.mutate()}
      >
        Enviar valoración
      </Button>
    </div>
  );
}

function Ayuda({
  otroId,
  me,
  onBloqueado,
}: {
  otroId: string;
  me: string;
  onBloqueado: () => void;
}) {
  const [denunciando, setDenunciando] = useState(false);
  const [motivo, setMotivo] = useState("estafa");
  const [detalle, setDetalle] = useState("");
  const denunciar = useMutation({
    mutationFn: async () => {
      const { error } = await sb
        .from("denuncias")
        .insert({
          denunciante_id: me,
          tipo_objeto: "perfil",
          objeto_id: otroId,
          motivo,
          detalle: detalle.trim() || null,
        });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Denuncia enviada. La revisamos.");
      setDenunciando(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const bloquear = useMutation({
    mutationFn: async () => {
      const { error } = await sb.from("bloqueos").insert({ bloqueado: otroId });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Vecino bloqueado");
      onBloqueado();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-2 border-t pt-3">
      <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
        <button type="button" onClick={() => setDenunciando(!denunciando)}>
          Denunciar
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm("¿Bloquear a este vecino? No podrán enviarse propuestas ni mensajes.")
            )
              bloquear.mutate();
          }}
        >
          Bloquear
        </button>
      </div>
      {denunciando && (
        <div className="space-y-2">
          <select className={sel} value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            {Object.entries(MOTIVOS_DENUNCIA).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <Textarea
            rows={2}
            maxLength={500}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder="Contanos qué pasó"
          />
          <Button
            size="sm"
            variant="destructive"
            className="rounded-full"
            disabled={denunciar.isPending}
            onClick={() => denunciar.mutate()}
          >
            Enviar denuncia
          </Button>
        </div>
      )}
    </div>
  );
}
