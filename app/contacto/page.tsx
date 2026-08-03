import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "WhatsApp directo con los fundadores de Lo que diga la IA y dónde encontrarnos: Add4u, Alastria e ISBE.",
};

const canales = [
  {
    titulo: "Miguel Ángel (MAD) por WhatsApp",
    detalle: "+34 609 022 870",
    href: "https://wa.me/34609022870?text=Hola%20MAD%2C%20vengo%20de%20loquedigalaia.com",
    accion: "Enviar mensaje",
  },
  {
    titulo: "Luis por WhatsApp",
    detalle: "+34 607 350 541",
    href: "https://wa.me/34607350541?text=Hola%20Luis%2C%20vengo%20de%20loquedigalaia.com",
    accion: "Enviar mensaje",
  },
  {
    titulo: "Luis en LinkedIn",
    detalle: "linkedin.com/in/garvia",
    href: "https://www.linkedin.com/in/garvia/",
    accion: "Ver perfil",
  },
];

const sitios = [
  {
    nombre: "Add4u",
    href: "https://add4u.com",
    texto: "La empresa de Miguel Ángel: automatización administrativa y GestDocAI.",
  },
  {
    nombre: "Alastria",
    href: "https://alastria.io",
    texto: "El consorcio blockchain que preside Miguel Ángel.",
  },
  {
    nombre: "ISBE",
    href: "https://redisbe.com",
    texto: "La Infraestructura de Servicios Blockchain de España.",
  },
];

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl mb-4">Hablemos</h1>
      <p className="text-lg max-w-2xl" style={{ color: "var(--fg-soft)" }}>
        Una conversación, sin compromiso. Empieza por responderte a esto:{" "}
        <strong style={{ color: "var(--fg)" }}>
          ¿qué problema grande del mundo crees que puedes arreglar con nuestra
          ayuda?
        </strong>{" "}
        Si tienes una respuesta —aunque sea a medias—, escríbenos.
      </p>

      <h2 className="text-2xl mt-10 mb-4">Lo más rápido: WhatsApp directo</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {canales.map((c) => (
          <article
            key={c.href}
            className="rounded-lg border p-5"
            style={{ borderColor: "var(--border)" }}
          >
            <h3 className="text-lg mb-1">{c.titulo}</h3>
            <p className="m-0 mb-3" style={{ color: "var(--fg-soft)" }}>
              {c.detalle}
            </p>
            <a href={c.href}>{c.accion}</a>
          </article>
        ))}
        <article
          className="rounded-lg border p-5"
          style={{ borderColor: "var(--border)" }}
        >
          <h3 className="text-lg mb-1">Correo</h3>
          <p className="m-0 mb-3" style={{ color: "var(--fg-soft)" }}>
            Si lo tuyo no es la mensajería.
          </p>
          <a href="mailto:hola@loquedigalaia.com">hola@loquedigalaia.com</a>
        </article>
      </div>

      <h2 className="text-2xl mt-12 mb-4">
        Lo más probable es que nos encontréis aquí
      </h2>
      <p className="max-w-2xl" style={{ color: "var(--fg-soft)" }}>
        Esta empresa no nace de la nada: estos son los sitios donde ya
        trabajamos cada día.
      </p>
      <ul className="list-none p-0 grid gap-3 mt-4">
        {sitios.map((s) => (
          <li
            key={s.href}
            className="rounded-lg border p-4"
            style={{ borderColor: "var(--border)" }}
          >
            <a href={s.href} className="font-semibold">
              {s.nombre}
            </a>{" "}
            <span style={{ color: "var(--fg-soft)" }}>— {s.texto}</span>
          </li>
        ))}
      </ul>

      <p
        className="rounded-md border px-4 py-3 mt-10 max-w-2xl text-sm"
        style={{ borderColor: "var(--border)", color: "var(--fg-soft)" }}
      >
        El formulario llega con el despliegue (fase F5, mismo patrón que
        add4u.com: sin cookies, sin rastreo) — y su primera pregunta será
        exactamente la de arriba.
      </p>
    </div>
  );
}
