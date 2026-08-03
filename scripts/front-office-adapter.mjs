// Adaptador madclon-front-office/v1 → contrato del pulso (docs/DATOS.md).
//
// El frontal público de ClonMADv3 (GitHub Pages) publica cinco JSON propios;
// este adaptador extrae SOLO los cuatro indicadores del contrato y los pone en
// la forma de data/schema/pulso.schema.json. Nada más atraviesa: el esquema
// cerrado del gate hace el resto (ni un campo extra llega a la web).
//
// Mapeo (etiquetas idénticas a las del sample para no romper los diccionarios
// i18n ya traducidos):
//   tokens-consumidos-total ← tokens.json → contador.total_tokens
//                             (tal como lo publica la fuente: medido + estimado)
//   dias-construyendo       ← días desde la primera fecha de serie.json
//                             (primer día con pulso público) hasta asOf, +1
//   tareas-despachadas-7d   ← serie.json → último registro, contexto.tareas_hechas
//   canales-vigilados       ← clones.json → perfil «clon»: canales + calendarios
//   asOf                    ← manifest.json → generado (fecha)
//
// Cualquier campo ausente o de tipo inesperado lanza Error → la fuente se
// descarta esa noche y el gate sirve el último valor válido (DATOS.md §5).

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function needNumber(value, where) {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new Error(`adaptador front-office: ${where} no es un número`);
  return value;
}

function daysBetween(fromDate, toDate) {
  const a = new Date(`${fromDate}T00:00:00Z`).getTime();
  const b = new Date(`${toDate}T00:00:00Z`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) throw new Error("adaptador front-office: fechas inválidas en serie.json");
  return Math.round((b - a) / 86_400_000) + 1;
}

export function adaptFrontOffice(docs, baseUrl) {
  const { tokens, serie, clones, manifest } = docs ?? {};
  const source = String(baseUrl).replace(/\/$/, "");

  const generado = manifest?.generado;
  if (typeof generado !== "string" || Number.isNaN(Date.parse(generado)))
    throw new Error("adaptador front-office: manifest.json sin «generado» válido");
  const asOf = generado.slice(0, 10);
  if (!DATE.test(asOf)) throw new Error(`adaptador front-office: asOf «${asOf}» inválido`);

  const totalTokens = needNumber(tokens?.contador?.total_tokens, "tokens.contador.total_tokens");

  const serieArr = serie?.serie;
  if (!Array.isArray(serieArr) || serieArr.length < 1)
    throw new Error("adaptador front-office: serie.json sin registros");
  const first = serieArr[0];
  const last = serieArr[serieArr.length - 1];
  if (typeof first?.fecha !== "string" || !DATE.test(first.fecha))
    throw new Error("adaptador front-office: serie[0].fecha inválida");
  const tareas7d = needNumber(last?.contexto?.tareas_hechas, "serie[último].contexto.tareas_hechas");

  const clon = Array.isArray(clones?.clones)
    ? clones.clones.find((c) => c?.perfil === "clon")
    : null;
  if (!clon) throw new Error("adaptador front-office: clones.json sin perfil «clon»");
  if (!Array.isArray(clon.canales) || !Array.isArray(clon.calendarios))
    throw new Error("adaptador front-office: clones.clon sin canales/calendarios (arrays)");
  const canalesVigilados = clon.canales.length + clon.calendarios.length;

  return {
    clone: "clonmadv3",
    asOf,
    indicators: [
      {
        id: "tokens-consumidos-total",
        label: "Tokens consumidos (total acumulado)",
        value: totalTokens,
        unit: "tokens",
        asOf,
        source,
        monotonic: true,
      },
      {
        id: "dias-construyendo",
        label: "Días construyendo en público",
        value: daysBetween(first.fecha, asOf),
        unit: "días",
        asOf,
        source,
        monotonic: true,
      },
      {
        id: "tareas-despachadas-7d",
        label: "Tareas despachadas (últimos 7 días)",
        value: tareas7d,
        unit: "tareas",
        asOf,
        source,
      },
      {
        id: "canales-vigilados",
        label: "Canales de entrada vigilados",
        value: canalesVigilados,
        unit: "canales",
        asOf,
        source,
      },
    ],
  };
}
