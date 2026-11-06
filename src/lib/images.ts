const TIPOS = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BYTES_ORIGINAL = 12 * 1024 * 1024;

export type ImagenProcesada = { blob: Blob; ancho: number; alto: number };

/** Valida y achica una foto para ahorrar datos (máx 1600px, JPEG). */
export async function procesarImagen(file: File, max = 1600): Promise<ImagenProcesada> {
  if (!TIPOS.includes(file.type)) throw new Error("Solo se aceptan fotos JPG, PNG o WEBP");
  if (file.size > MAX_BYTES_ORIGINAL) throw new Error("La foto pesa más de 12 MB");
  const bmp = await createImageBitmap(file);
  const escala = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const ancho = Math.round(bmp.width * escala);
  const alto = Math.round(bmp.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, ancho, alto);
  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("No se pudo procesar la foto"))), "image/jpeg", 0.82),
  );
  return { blob, ancho, alto };
}
