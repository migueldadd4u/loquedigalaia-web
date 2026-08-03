import Link from "next/link";

/* Imágenes generadas con IA: este componente impone la etiqueta oficial de la
   Unión Europea (mismo patrón que add4u.com) — obligatoria por el reglamento
   europeo de IA (art. 50). La etiqueta va superpuesta como HTML, nunca
   incrustada en el bitmap, y vive en un componente precisamente para que no
   pueda faltar en ninguna imagen. No renderizar imágenes IA fuera de él. */
const badgePos: Record<string, string> = {
  "bottom-right": "bottom-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "top-right": "top-2 right-2",
  "top-left": "top-2 left-2",
};

export function AiImage({
  src,
  alt,
  className = "",
  badge = "bottom-right",
}: {
  src: string;
  alt: string;
  className?: string;
  /** Esquina donde superponer la etiqueta UE: elegir la que no tape texto relevante de la imagen. */
  badge?: keyof typeof badgePos;
}) {
  return (
    <figure className={`m-0 ${className}`}>
      <span className="relative block overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`absolute w-28 max-w-[40%] h-auto ${badgePos[badge]}`}
          src="/images/eu-ai-generated-white.svg"
          alt="Etiqueta de la Unión Europea: contenido totalmente generado con inteligencia artificial"
        />
      </span>
      <figcaption className="text-xs mt-1" style={{ color: "var(--fg-soft)" }}>
        Imagen generada con IA, etiquetada con el distintivo oficial de la UE.{" "}
        <Link href="/faq/#etiqueta-ia">Por qué lo hacemos</Link>
      </figcaption>
    </figure>
  );
}

/* Hueco para imagen real (no IA) aún no volcada: mantiene el layout y deja claro
   qué falta, sin fingir contenido. */
export function PhotoPending({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={`Fotografía pendiente: ${label}`}
      className="rounded-lg border flex items-center justify-center text-center p-6 min-h-36"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg-alt)",
        color: "var(--fg-soft)",
      }}
    >
      <span className="text-sm">Fotografía real (no IA) pendiente · {label}</span>
    </div>
  );
}
