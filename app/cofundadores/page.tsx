import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Cofundadores",
  description: "Cualquiera puede ser cofundador aunque llegue cinco años después.",
};

export default function CofundadoresPage() {
  return (
    <article>
      <h1 className="text-4xl font-bold tracking-tight">Cofundadores</h1>
      <p className="mt-4 text-lg">
        Cualquiera puede ser cofundador aunque llegue cinco años después.
      </p>
      <Placeholder>
        Qué significa ser cofundador, cómo se entra y el CTA de solicitud. Los
        primeros en apostar fueron los dos fundadores humanos; la puerta sigue
        abierta. Redacción en F2; formulario en F5.
      </Placeholder>
      <p className="mt-8">
        <a
          href="/contacto/"
          className="inline-block rounded-lg bg-petrol px-6 py-3 text-lg font-semibold text-ivory no-underline dark:bg-ivory dark:text-petrol-deep"
        >
          Solicitar conversación
        </a>
      </p>
    </article>
  );
}
