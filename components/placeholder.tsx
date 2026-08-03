import type { ReactNode } from "react";

/**
 * Marcador visible de contenido pendiente (F1 → F2).
 * El token TODO-CONTENIDO debe llegar intacto al HTML exportado:
 * el gate F2 exige «cero TODO-CONTENIDO en build».
 */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <p className="todo-contenido">
      {/* TODO-CONTENIDO */}
      <strong>TODO-CONTENIDO</strong>
      {" — "}
      {children}
    </p>
  );
}
