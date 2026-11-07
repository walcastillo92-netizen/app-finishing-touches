/**
 * Imágenes ilustrativas de las publicaciones de demostración BETA.
 * Se generan por código (SVG) a partir de rutas como "/demo/demo-01-bicicleta-1.svg".
 * Para quitar las demos: delete from public.publicaciones where es_demo;  (y borrar este archivo).
 */
type Demo = [emoji: string, titulo: string, color1: string, color2: string, rubro: string, detalle: string];

const DEMOS: Record<string, Demo> = {
  bicicleta: ["🚲", "Bicicleta rodado 26", "#2438d8", "#6f86ff", "Vehículos", "Usada · buen estado"],
  taladro: ["🛠️", "Taladro percutor con valija", "#c2410c", "#fb923c", "Herramientas", "Con brocas incluidas"],
  cochecito: ["👶", "Cochecito de bebé plegable", "#be185d", "#f472b6", "Hogar", "Plegado fácil"],
  celular: ["📱", "Celular Android 64 GB", "#0f766e", "#2dd4bf", "Tecnología", "Con cargador"],
  guitarra: ["🎸", "Clases de guitarra", "#7c3aed", "#a78bfa", "Servicios", "Clases de 2 horas"],
  campera: ["🧥", "Campera de abrigo talle L", "#1d4ed8", "#60a5fa", "Ropa", "Talle L"],
  pan: ["🥖", "Pan casero y facturas", "#b45309", "#fbbf24", "Comida", "Por encargo"],
  living: ["🛋️", "Juego de living 3 piezas", "#4d7c0f", "#a3e635", "Hogar", "Tres cuerpos"],
  moto: ["🏍️", "Moto 110 cc", "#b91c1c", "#f87171", "Vehículos", "Documentación al día"],
  notebook: ["💻", "Notebook 14 pulgadas", "#334155", "#94a3b8", "Tecnología", "Con cargador"],
  plomeria: ["🔧", "Plomería y gas", "#0369a1", "#38bdf8", "Servicios", "Presupuesto sin cargo"],
  ollas: ["🍳", "Set de ollas y vajilla", "#a16207", "#facc15", "Hogar", "Set completo"],
  bolsos: ["👜", "Bolsos de lona artesanales", "#9d174d", "#fb7185", "Otros", "Hechos a mano"],
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function demoImagen(path: string): string | null {
  const m = path.match(/^\/demo\/demo-\d+-([a-z]+)-([123])\.svg$/);
  const d = m ? DEMOS[m[1]] : undefined;
  if (!m || !d) return null;
  const v = Number(m[2]);
  const [emoji, titulo, c1, c2, rubro, detalle] = d;
  const size = v === 1 ? 330 : v === 2 ? 200 : 260;
  const sub = v === 1 ? rubro : v === 2 ? `Detalle: ${detalle}` : `Imagen ${v} de 3`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
    `<clipPath id="c"><rect width="800" height="800"/></clipPath></defs>` +
    `<rect width="800" height="800" fill="url(#g)"/>` +
    `<circle cx="${v === 2 ? 150 : 650}" cy="${v === 3 ? 650 : 150}" r="230" fill="#fff" opacity=".10"/>` +
    `<g clip-path="url(#c)"><rect x="-120" y="70" width="620" height="76" fill="#111" opacity=".88" transform="rotate(-35 190 108)"/>` +
    `<text x="190" y="120" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="3" transform="rotate(-35 190 108)">BETA · DEMOSTRACIÓN</text></g>` +
    `<text x="400" y="${v === 2 ? 430 : 470}" font-size="${size}" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${emoji}</text>` +
    `<rect x="60" y="590" width="680" height="130" rx="28" fill="#fff" opacity=".93"/>` +
    `<text x="400" y="650" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="800" fill="#111" text-anchor="middle">${esc(titulo)}</text>` +
    `<text x="400" y="695" font-family="Arial,Helvetica,sans-serif" font-size="28" fill="#444" text-anchor="middle">${esc(sub)} · imagen ilustrativa</text>` +
    `</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}