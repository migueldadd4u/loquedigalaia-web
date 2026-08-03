/* Imágenes generadas con IA: este componente impone el distintivo de transparencia
   (Reglamento europeo de IA, art. 50). No renderizar imágenes IA fuera de él. */
export function AiImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <figure className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
      <figcaption
        className="absolute bottom-0 right-0 text-xs px-2 py-1 rounded-tl-md"
        style={{ background: "var(--fg)", color: "var(--bg)" }}
      >
        Imagen generada con IA
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
