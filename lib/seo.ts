import type { Metadata } from "next";
import { pulso as pulsoCopy, site } from "@/content/es/site";
import type { Pulso } from "@/lib/pulso";

export const SITE_URL = "https://loquedigalaia.com";
export const SITE_DEFAULT_TITLE = `${site.nombre} — ${site.claim}`;

const OG_IMAGE_URL = `${SITE_URL}/images/poster-lanzamiento.jpg`;
const OG_IMAGE_ALT =
  "Cartel generado con IA: los dos fundadores de Lo que diga la IA junto a sus clones Jarvis y ClonMADv3";

type PageMetadataOptions = {
  title?: string;
  description: string;
  path: string;
};

function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

/**
 * Construye metadatos homogéneos sin perder los títulos y descripciones únicos
 * de cada página. El poster es la pieza social canónica definida en PLAN §2.1.
 */
export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataOptions): Metadata {
  const fullTitle = title ? `${title} — ${site.nombre}` : SITE_DEFAULT_TITLE;
  const canonical = absoluteUrl(path);

  return {
    title: title ?? SITE_DEFAULT_TITLE,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: canonical,
      siteName: site.nombre,
      title: fullTitle,
      description,
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1254,
          height: 1254,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: OG_IMAGE_URL, alt: OG_IMAGE_ALT }],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: site.nombre,
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/logo-brujula.jpg`,
      width: 512,
      height: 512,
    },
    description: site.descripcion,
    foundingDate: "2026-08-02",
  };
}

export function datasetJsonLd(data: Pulso) {
  const sample = data.indicators.every((indicator) => indicator.source === "sample");

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${SITE_URL}/pulso/#dataset`,
    name: pulsoCopy.titulo,
    description: pulsoCopy.intro,
    url: `${SITE_URL}/pulso/`,
    inLanguage: "es",
    dateModified: data.asOf,
    isAccessibleForFree: true,
    creator: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${SITE_URL}/pulso.json`,
      },
    ],
    variableMeasured: data.indicators.map((indicator) => ({
      "@type": "PropertyValue",
      propertyID: indicator.id,
      name: indicator.label,
      value: indicator.value,
      unitText: indicator.unit,
    })),
    ...(sample ? { abstract: pulsoCopy.avisoSample } : {}),
  };
}

/** Evita que una cadena futura pueda cerrar el elemento script. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
