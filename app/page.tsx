import Link from "next/link";
import { home, problemas, origenes, site } from "@/content/es/site";
import { Compass } from "@/components/Compass";
import { AiImage } from "@/components/AiImage";
import { readPulso } from "@/lib/pulso";

function Section({
  title,
  children,
  alt = false,
}: {
  title?: string;
  children: React.ReactNode;
  alt?: boolean;
}) {
  return (
    <section
      className="py-14"
      style={alt ? { background: "var(--bg-alt)" } : undefined}
    >
      <div className="mx-auto max-w-5xl px-4">
        {title ? <h2 className="text-3xl mb-6">{title}</h2> : null}
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const pulso = readPulso();
  const tokens = pulso.indicators.find((i) => i.id === "tokens-consumidos-total");

  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <Compass size={56} className="mb-6" />
          <h1 className="text-4xl sm:text-5xl max-w-3xl">{home.heroTitulo}</h1>
          <p className="mt-6 max-w-2xl text-lg" style={{ color: "var(--fg-soft)" }}>
            {home.heroSub}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/cofundadores/"
              className="no-underline rounded-md px-5 py-3 font-medium"
              style={{ background: "var(--fg)", color: "var(--bg)" }}
            >
              {home.heroCta}
            </Link>
            <Link
              href="/manifiesto/"
              className="no-underline rounded-md px-5 py-3 font-medium border"
              style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
            >
              {home.heroCtaSecundaria}
            </Link>
          </div>
        </div>
      </section>

      <Section alt>
        <div className="grid sm:grid-cols-4 gap-6">
          {home.verbos.map((v) => (
            <p key={v.accion} className="m-0 text-center">
              <span className="block text-sm" style={{ color: "var(--fg-soft)" }}>
                {v.verbo}
              </span>
              <span className="block text-2xl font-semibold">{v.accion}</span>
            </p>
          ))}
        </div>
      </Section>

      <Section title={home.queEsTitulo}>
        <p className="max-w-3xl text-lg">{home.queEs}</p>
      </Section>

      <Section title={home.queHacemosTitulo} alt>
        <p className="max-w-3xl text-lg">{home.queHacemos}</p>
        <p className="max-w-3xl mt-4 font-medium">{home.milagroCero}</p>
      </Section>

      <Section title={home.paraQuienTitulo}>
        <div className="grid sm:grid-cols-3 gap-6">
          {home.paraQuien.map((p) => (
            <article
              key={p.titulo}
              className="rounded-lg border p-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="text-xl mb-2">{p.titulo}</h3>
              <p className="m-0" style={{ color: "var(--fg-soft)" }}>
                {p.texto}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section title={home.problemasTitulo} alt>
        <p className="max-w-3xl mb-6">{home.problemasIntro}</p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0">
          {problemas.map((p) => (
            <li key={p.id}>
              <Link
                href={`/problemas/#${p.id}`}
                className="no-underline block rounded-lg border p-4 h-full"
                style={{ borderColor: "var(--border)", color: "var(--fg)" }}
              >
                <span
                  className="text-xs uppercase tracking-wide"
                  style={{ color: "var(--accent)" }}
                >
                  {p.estado}
                </span>
                <span className="block font-medium mt-1">{p.titulo}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={home.ofertaTitulo}>
        <article
          className="rounded-lg border p-6 max-w-3xl"
          style={{ borderColor: "var(--accent)" }}
        >
          <h3 className="text-2xl mb-2">{home.ofertaNombre}</h3>
          <p className="m-0">{home.oferta}</p>
        </article>
      </Section>

      <Section title={home.pulsoTitulo} alt>
        <p className="max-w-3xl mb-4">{home.pulsoIntro}</p>
        {tokens ? (
          <p className="text-lg">
            <strong>{tokens.label}:</strong>{" "}
            {tokens.value.toLocaleString("es-ES")} {tokens.unit}{" "}
            <span className="text-sm" style={{ color: "var(--fg-soft)" }}>
              (dato del {tokens.asOf}
              {tokens.source === "sample" ? ", ejemplo" : ""})
            </span>
          </p>
        ) : null}
        <p>
          <Link href="/pulso/">Ver el pulso completo</Link>
        </p>
      </Section>

      <Section title={origenes.titulo}>
        <p className="max-w-3xl mb-6">{origenes.intro}</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {origenes.enlaces.map((e) => (
            <article
              key={e.href}
              className="rounded-lg border p-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="text-lg mb-2">{e.pregunta}</h3>
              <p className="m-0 mb-3" style={{ color: "var(--fg-soft)" }}>
                {e.texto}
              </p>
              <a href={e.href}>{e.etiqueta}</a>
            </article>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-6 mt-8 items-start">
          <figure className="m-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/selfie-fundadores.jpg"
              alt="Los dos fundadores, sonrientes, en el acto de lanzamiento"
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
            <figcaption className="text-sm mt-2" style={{ color: "var(--fg-soft)" }}>
              Los dos fundadores el día del lanzamiento. Fotografía real.
            </figcaption>
          </figure>
          <div>
            <AiImage
              src="/images/poster-lanzamiento.jpg"
              alt="Cartel del lanzamiento oficial: los dos fundadores junto a sus clones Jarvis y ClonMADv3, 2 de agosto de 2026"
              badge="top-left"
            />
            <p className="text-sm mt-2 mb-0" style={{ color: "var(--fg-soft)" }}>
              El cartel del lanzamiento: dos mentes humanas, dos inteligencias
              artificiales, un mismo propósito.
            </p>
          </div>
        </div>
      </Section>

      <Section title={home.ctaFinalTitulo}>
        <p className="max-w-2xl text-lg">{home.ctaFinal}</p>
        <p className="mt-6">
          <Link
            href="/contacto/"
            className="no-underline rounded-md px-5 py-3 font-medium inline-block"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            {home.ctaFinalBoton}
          </Link>
        </p>
        <p className="sr-only">{site.descripcion}</p>
      </Section>
    </>
  );
}
