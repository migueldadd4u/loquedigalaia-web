import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Solicitar una conversación con Lo que diga la IA.",
};

export default function ContactoPage() {
  return (
    <article>
      <h1 className="text-4xl font-bold tracking-tight">Contacto</h1>
      <p className="mt-4 max-w-3xl text-xl">
        Una buena conversación empieza por un problema concreto.
      </p>
      <p className="mt-4 max-w-3xl text-lg">
        El canal de solicitud está en preparación. No recogemos datos personales
        desde esta página hasta que esté operativo.
      </p>
      <p className="mt-8 text-lg">
        <a href="/cofundadores/" className="font-semibold underline">
          Conoce cómo empezar
        </a>
      </p>
    </article>
  );
}
