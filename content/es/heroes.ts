import type {
  AiBadgePosition,
  AiBadgeVariant,
} from "@/components/AiImage";

export type HeroRoute =
  | "/"
  | "/manifiesto/"
  | "/problemas/"
  | "/como-trabajamos/"
  | "/pulso/"
  | "/cofundadores/"
  | "/faq/"
  | "/contacto/";

export type HeroArt = {
  src: string;
  alt: string;
  badge: AiBadgePosition;
  badgeVariant: AiBadgeVariant;
  objectPosition?: string;
};

/* Contrato visual: todas las rutas públicas de navegación deben tener una
   entrada. El gate compara estas claves con nav y comprueba data-ai-hero en el
   HTML final. La etiqueta nunca forma parte del bitmap. */
export const heroArtByRoute = {
  "/": {
    src: "/images/poster-lanzamiento.jpg",
    alt: "Los dos fundadores junto a sus clones Jarvis y ClonMADv3 en el cartel de lanzamiento. Imagen generada con IA.",
    badge: "bottom-left",
    badgeVariant: "white",
    objectPosition: "center 22%",
  },
  "/manifiesto/": {
    src: "/images/heroes/manifiesto.jpg",
    alt: "Dos personas y dos presencias de inteligencia artificial contemplan un horizonte junto a una brújula sobre páginas abiertas.",
    badge: "bottom-left",
    badgeVariant: "white",
  },
  "/problemas/": {
    src: "/images/heroes/problemas.jpg",
    alt: "Ocho caminos parten de una gran brújula hacia distintos ámbitos de una ciudad y su territorio.",
    badge: "bottom-right",
    badgeVariant: "white",
  },
  "/como-trabajamos/": {
    src: "/images/heroes/como-trabajamos.jpg",
    alt: "Manos humanas y herramientas robóticas construyen juntas un puente modular alrededor de una brújula.",
    badge: "bottom-left",
    badgeVariant: "white",
  },
  "/pulso/": {
    src: "/images/heroes/pulso.jpg",
    alt: "Un instrumento de observación combina una brújula y una señal de pulso sobre una ciudad al amanecer.",
    badge: "bottom-right",
    badgeVariant: "black",
  },
  "/cofundadores/": {
    src: "/images/heroes/cofundadores.jpg",
    alt: "Una mesa orientada por una brújula reúne a dos personas, dos presencias de IA y varias sillas abiertas para quienes lleguen después.",
    badge: "bottom-right",
    badgeVariant: "black",
  },
  "/faq/": {
    src: "/images/heroes/faq.jpg",
    alt: "Una brújula guía la búsqueda entre libros, archivos y formas abstractas de inteligencia artificial.",
    badge: "bottom-left",
    badgeVariant: "black",
  },
  "/contacto/": {
    src: "/images/heroes/contacto.jpg",
    alt: "Dos personas conversan en un puente acompañadas a distancia por dos presencias abstractas de inteligencia artificial.",
    badge: "bottom-right",
    badgeVariant: "white",
  },
} satisfies Record<HeroRoute, HeroArt>;

export const notFoundHeroArt: HeroArt = {
  src: "/images/heroes/404.jpg",
  alt: "Una brújula y dos pequeñas presencias de IA buscan la salida de un laberinto arquitectónico.",
  badge: "bottom-left",
  badgeVariant: "black",
};
