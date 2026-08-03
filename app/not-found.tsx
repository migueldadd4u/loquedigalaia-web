import Link from "next/link";
import { Compass } from "@/components/Compass";
import { PageHero } from "@/components/AiImage";
import { notFoundHeroArt } from "@/content/es/heroes";

export default function NotFound() {
  return (
    <>
      <PageHero
        title="Ni la IA sabe dónde está esto."
        eyebrow="Error 404"
        description={
          <p>
            Hemos preguntado a los dos clones: Jarvis culpa a ClonMADv3,
            ClonMADv3 culpa a Jarvis, y los dos humanos estaban tomando café.
          </p>
        }
        {...notFoundHeroArt}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 text-center">
        <Compass size={48} className="mx-auto mb-6 opacity-60" />
        <div
          className="text-lg grid gap-3 max-w-xl mx-auto"
          style={{ color: "var(--fg-soft)" }}
        >
          <p className="m-0">
            La IA multiplica, el humano elige, el sistema ejecuta… y la
            realidad, a veces, devuelve un 404. También esto es construir en
            público.
          </p>
          <p className="m-0 font-medium" style={{ color: "var(--fg)" }}>
            Eso sí: si esta página no existe, igual el problema que resuelve
            todavía tampoco. ¿Lo montamos?
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="no-underline rounded-md px-5 py-3 font-medium"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            Volver a la brújula
          </Link>
          <Link
            href="/cofundadores/"
            className="no-underline rounded-md px-5 py-3 font-medium border"
            style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
          >
            Ser cofundador (existe de verdad)
          </Link>
        </div>
      </div>
    </>
  );
}
