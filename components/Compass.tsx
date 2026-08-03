// Rosa de los vientos de la marca (versión SVG del logo). Decorativa por defecto.
export function Compass({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M50 2 L56 38 L50 30 L44 38 Z" />
      <path d="M50 98 L56 62 L50 70 L44 62 Z" />
      <path d="M2 50 L38 44 L30 50 L38 56 Z" />
      <path d="M98 50 L62 44 L70 50 L62 56 Z" />
      <path d="M18 18 L46 41 L38 41 L41 46 Z" opacity="0.85" />
      <path d="M82 18 L59 41 L62 46 L54 41 Z" opacity="0.85" />
      <path d="M18 82 L41 59 L38 54 L46 59 Z" opacity="0.85" />
      <path d="M82 82 L54 59 L62 54 L59 59 Z" opacity="0.85" />
      <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="3.5" />
    </svg>
  );
}
