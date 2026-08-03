/** Datos estructurales compartidos; toda cadena visible tiene traducción EN. */

export const SITE = {
  name: "Lo que diga la IA",
  domain: "https://loquedigalaia.com",
  defaultLocale: "es",
  locales: ["es", "en"],
} as const;

export type NavItem = {
  href: string;
  label: string;
};

/** Navegación principal: las 7 rutas de PLAN.md §2 (la home enlaza desde el wordmark). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/manifiesto/", label: "Manifiesto" },
  { href: "/problemas/", label: "Problemas" },
  { href: "/como-trabajamos/", label: "Cómo trabajamos" },
  { href: "/pulso/", label: "Pulso" },
  { href: "/cofundadores/", label: "Cofundadores" },
  { href: "/contacto/", label: "Contacto" },
];

/** Los 4 verbos de la home (PLAN.md §2, fila `/`). */
export const VERBOS = [
  "La IA multiplica",
  "El humano elige",
  "El sistema ejecuta",
  "La realidad valida",
] as const;
