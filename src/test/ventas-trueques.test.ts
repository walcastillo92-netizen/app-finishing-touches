import { describe, expect, it } from "vitest";
import { validarCalificacion } from "@/lib/reputacion";
import { resumenOferta, type Propuesta } from "@/lib/trueques";

const baseCalificacion = {
  operacionId: "operacion-1",
  valoradoId: "vendedor-1",
  valoradorId: "comprador-1",
  estadoOperacion: "confirmado",
};

const propuesta: Propuesta = {
  id: "propuesta-1",
  publicacion_destino: "publicacion-1",
  publicacion_ofrecida: null,
  proponente: "usuario-1",
  destinatario: "usuario-2",
  modalidad: "mano_a_mano",
  efectivo_monto: null,
  paga: null,
  oferta_texto: "Una bicicleta",
  mensaje: null,
  estado: "confirmada",
  contrapropuesta_de: null,
  confirmo_proponente: true,
  confirmo_destinatario: true,
  creado_en: "2026-11-07T10:00:00.000Z",
  actualizado_en: "2026-11-07T10:00:00.000Z",
  destino: { id: "publicacion-1", titulo: "Taladro" },
  ofrecida: null,
  prop: { id: "usuario-1", nombre_publico: "Ana" },
  dest: { id: "usuario-2", nombre_publico: "Luis" },
};

describe("validarCalificacion", () => {
  it("permite valorar una operación confirmada entre dos personas", () => {
    expect(validarCalificacion(baseCalificacion)).toEqual({ valida: true });
  });

  it("rechaza publicaciones de demostración", () => {
    expect(validarCalificacion({ ...baseCalificacion, esDemo: true })).toMatchObject({
      valida: false,
      motivo: expect.stringContaining("demostración"),
    });
  });

  it("rechaza operaciones sin identificar", () => {
    expect(validarCalificacion({ ...baseCalificacion, operacionId: " " })).toMatchObject({
      valida: false,
      motivo: expect.stringContaining("operación"),
    });
  });

  it("rechaza la autovaloración", () => {
    expect(validarCalificacion({ ...baseCalificacion, valoradoId: "comprador-1" })).toMatchObject({
      valida: false,
      motivo: expect.stringContaining("propia"),
    });
  });

  it("rechaza operaciones no confirmadas", () => {
    expect(validarCalificacion({ ...baseCalificacion, estadoOperacion: "iniciado" })).toMatchObject(
      { valida: false, motivo: expect.stringContaining("confirmadas") },
    );
  });
});

describe("resumenOferta", () => {
  it("describe claramente un trueque mano a mano", () => {
    const resumen = resumenOferta(propuesta);
    expect(resumen).toContain("Ana ofrece «Una bicicleta»");
    expect(resumen).toContain("mano a mano, sin dinero");
  });

  it("identifica quién aporta el efectivo y quién lo recibe", () => {
    const resumen = resumenOferta({
      ...propuesta,
      modalidad: "con_efectivo",
      efectivo_monto: 15000,
      paga: "proponente",
    });
    expect(resumen).toContain("Ana suma");
    expect(resumen).toContain("a favor de Luis");
  });
});
