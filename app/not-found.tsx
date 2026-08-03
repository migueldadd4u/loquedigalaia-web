import Link from "next/link";
import { Compass } from "@/components/Compass";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <Compass size={64} className="mx-auto mb-8 opacity-60" />
      <p className="text-sm uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        Error 404
      </p>
      <h1 className="text-4xl sm:text-5xl mt-2">
        Ni la IA sabe dónde está esto.
      </h1>
      <div className="mt-8 text-lg grid gap-3 max-w-xl mx-auto" style={{ color: "var(--fg-soft)" }}>
        <p className="m-0">
          Hemos preguntado a los dos clones: Jarvis culpa a ClonMADv3, ClonMADv3
          culpa a Jarvis, y los dos humanos estaban tomando café.
        </p>
        <p className="m-0">
          La IA multiplica, el humano elige, el sistema ejecuta… y la realidad, a
          veces, devuelve un 404. También esto es construir en público.
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
  );
}
