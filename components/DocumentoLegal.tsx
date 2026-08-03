import Link from "next/link";
import type { Documento } from "@/content/es/legal";

/**
 * Renderiza una de las páginas del pie. Cada párrafo se emite como un único
 * nodo de texto para que scripts/i18n-build.mjs pueda traducirlo entero; por eso
 * los enlaces van al final del párrafo y no intercalados.
 */
export function DocumentoLegal({ doc }: { doc: Documento }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl mb-4">{doc.titulo}</h1>
      <p className="text-lg" style={{ color: "var(--fg-soft)" }}>
        {doc.entradilla}
      </p>

      {doc.bloques.map((bloque, i) => {
        if (bloque.tipo === "seccion") {
          return (
            <h2 key={i} className="text-2xl mt-10 mb-3">
              {bloque.titulo}
            </h2>
          );
        }
        if (bloque.tipo === "lista") {
          return (
            <ul key={i} className="ps-6 grid gap-2 mt-4">
              {bloque.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        const enlace = bloque.enlace;
        return (
          <p key={i} className="mt-4">
            {bloque.texto}
            {enlace ? (
              <>
                {" "}
                {enlace.href.startsWith("/") ? (
                  <Link href={enlace.href}>{enlace.t}</Link>
                ) : (
                  <a href={enlace.href}>{enlace.t}</a>
                )}
                .
              </>
            ) : null}
          </p>
        );
      })}
    </div>
  );
}
