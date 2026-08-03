import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Solicita una conversación con Lo que diga la IA.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl mb-4">Hablemos</h1>
      <p className="text-lg max-w-2xl" style={{ color: "var(--fg-soft)" }}>
        Una conversación, sin compromiso. Cuéntanos qué problema te obsesiona y
        qué has hecho ya con él.
      </p>
      <p
        className="rounded-md border px-4 py-3 mt-8 max-w-2xl"
        style={{ borderColor: "var(--border)" }}
      >
        El formulario de contacto se activa con el despliegue (fase F5, mismo
        patrón que add4u.com: sin cookies, sin rastreo). Mientras tanto, escribe
        a <a href="mailto:hola@loquedigalaia.com">hola@loquedigalaia.com</a>.
      </p>
    </div>
  );
}
