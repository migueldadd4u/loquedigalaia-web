import type { ReactNode } from "react";
import Link from "next/link";

/* Imágenes generadas con IA: estos componentes imponen la etiqueta oficial de
   la Unión Europea como una capa HTML separada del bitmap. No renderizar
   imágenes IA fuera de AiImage o PageHeroArt. */
const badgePos = {
  "bottom-right": "bottom-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "top-right": "top-3 right-3",
  "top-left": "top-3 left-3",
} as const;

export type AiBadgePosition = keyof typeof badgePos;
export type AiBadgeVariant = "white" | "black";

function AiBadge({
  position,
  variant,
}: {
  position: AiBadgePosition;
  variant: AiBadgeVariant;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`absolute z-10 w-28 max-w-[38%] h-auto ${badgePos[position]}`}
      src={`/images/eu-ai-generated-${variant}.svg`}
      alt="Etiqueta de la Unión Europea: contenido totalmente generado con inteligencia artificial"
    />
  );
}

export function AiImage({
  src,
  alt,
  className = "",
  badge = "bottom-right",
  badgeVariant = "white",
}: {
  src: string;
  alt: string;
  className?: string;
  /** Elegir la esquina que no tape información relevante de la ilustración. */
  badge?: AiBadgePosition;
  /** Pastilla blanca sobre fondo oscuro; negra sobre fondo claro. */
  badgeVariant?: AiBadgeVariant;
}) {
  return (
    <figure className={`m-0 ${className}`} data-ai-image="true">
      <span className="relative block overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
        <AiBadge position={badge} variant={badgeVariant} />
      </span>
      <figcaption className="text-xs mt-1" style={{ color: "var(--fg-soft)" }}>
        Imagen generada con IA, etiquetada con el distintivo oficial de la UE.{" "}
        <Link href="/faq/#etiqueta-ia">Por qué lo hacemos</Link>
      </figcaption>
    </figure>
  );
}

export function PageHeroArt({
  src,
  alt,
  badge = "bottom-left",
  badgeVariant = "white",
  className = "",
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  badge?: AiBadgePosition;
  badgeVariant?: AiBadgeVariant;
  className?: string;
  objectPosition?: string;
}) {
  return (
    <figure
      className={`page-hero-art m-0 ${className}`}
      data-ai-image="true"
      data-ai-hero="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="page-hero-image"
        style={{ objectPosition }}
        loading="eager"
        fetchPriority="high"
      />
      <AiBadge position={badge} variant={badgeVariant} />
      <figcaption className="sr-only">
        Imagen generada con IA y etiquetada mediante una capa HTML con el
        distintivo oficial de la Unión Europea.
      </figcaption>
    </figure>
  );
}

export function PageHero({
  title,
  description,
  eyebrow,
  src,
  alt,
  badge = "bottom-left",
  badgeVariant = "white",
  objectPosition,
  children,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  src: string;
  alt: string;
  badge?: AiBadgePosition;
  badgeVariant?: AiBadgeVariant;
  objectPosition?: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero" aria-labelledby="page-title" data-page-hero>
      <div className="page-hero-copy">
        {eyebrow ? <p className="page-hero-eyebrow">{eyebrow}</p> : null}
        <h1 id="page-title" className="text-4xl sm:text-5xl">
          {title}
        </h1>
        {description ? <div className="page-hero-description">{description}</div> : null}
        {children}
      </div>
      <PageHeroArt
        src={src}
        alt={alt}
        badge={badge}
        badgeVariant={badgeVariant}
        objectPosition={objectPosition}
      />
    </section>
  );
}

export function RealPhoto({
  src,
  fallbackSrc,
  alt,
  className = "",
  objectPosition = "center",
}: {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  objectPosition?: string;
}) {
  return (
    <figure className={`real-photo m-0 ${className}`} data-real-photo="true">
      <picture>
        <source srcSet={src} type="image/avif" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fallbackSrc}
          alt={alt}
          loading="lazy"
          style={{ objectPosition }}
        />
      </picture>
      <figcaption>Fotografía real, no generada con IA.</figcaption>
    </figure>
  );
}

/* Se conserva durante la transición para que cualquier hueco restante sea
   visible en el gate; F2 debe terminar sin instancias de este componente. */
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
