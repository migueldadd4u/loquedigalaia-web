import Link from "next/link";
import { home, problemas, origenes, site } from "@/content/es/site";
import { Compass } from "@/components/Compass";
import { PageHeroArt } from "@/components/AiImage";
import { heroArtByRoute } from "@/content/es/heroes";
import { readPulso, readPulsoHistory } from "@/lib/pulso";
import { StatTile } from "@/components/Pulso";
import {
  organizationJsonLd,
  serializeJsonLd,
} from "@/lib/seo";

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
  const historia = readPulsoHistory();
  const serieDe = (id: string, asOf: string, value: number) =>
    historia[pulso.clone]?.[id]?.series ?? [{ asOf, value }];
  const tokens = pulso.indicators.find((i) => i.id === "tokens-consumidos-total");
  const restoPulso = pulso.indicators.filter(
    (i) => i.id !== "tokens-consumidos-total",
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(organizationJsonLd()),
        }}
      />
      <section className="hero">
        <div className="hero-copy">
          <Compass size={44} className="mb-6" />
          <h1 className="text-4xl sm:text-5xl">{home.heroTitulo}</h1>
          <p className="mt-6 text-lg" style={{ color: "rgba(246,243,234,0.85)" }}>
            {home.heroSub}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/cofundadores/"
              className="no-underline rounded-md px-5 py-3 font-medium"
              style={{ background: "#f6f3ea", color: "#1c2a30" }}
            >
              {home.heroCta}
            </Link>
            <Link
              href="/manifiesto/"
              className="no-underline rounded-md px-5 py-3 font-medium border"
              style={{ borderColor: "#f6f3ea", color: "#f6f3ea" }}
            >
              {home.heroCtaSecundaria}
            </Link>
          </div>
          <figure className="hero-selfie">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/selfie-fundadores.jpg"
              alt="Los dos fundadores, sonrientes, el día del lanzamiento"
            />
            <figcaption>
              Fotografía real, sin IA: los dos fundadores el día del
              lanzamiento.
            </figcaption>
          </figure>
        </div>
        <PageHeroArt {...heroArtByRoute["/"]} className="hero-art" />
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
        <p className="max-w-3xl mb-6">{home.pulsoIntro}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tokens ? (
            <StatTile
              indicator={tokens}
              series={serieDe(tokens.id, tokens.asOf, tokens.value)}
              hero
              onAlt
              className="sm:col-span-2 lg:col-span-3"
            />
          ) : null}
          {restoPulso.map((i, idx) => (
            <StatTile
              key={i.id}
              indicator={i}
              series={serieDe(i.id, i.asOf, i.value)}
              onAlt
              className={
                idx === restoPulso.length - 1
                  ? "sm:col-span-2 lg:col-span-1"
                  : undefined
              }
            />
          ))}
        </div>
        <p className="mt-6">
          <Link href="/pulso/">{home.pulsoVerCompleto}</Link>
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
