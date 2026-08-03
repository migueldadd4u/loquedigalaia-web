import { readPulso } from "@/lib/pulso";

// El endpoint se hornea durante el export estático y lee exactamente la misma
// fuente que /pulso y su JSON-LD. No hay una segunda copia de los indicadores.
export const dynamic = "force-static";

export function GET() {
  return Response.json(readPulso());
}
