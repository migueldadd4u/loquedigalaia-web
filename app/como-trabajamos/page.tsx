import { home } from "@/content/es/site";
import { PageHero } from "@/components/AiImage";
import { heroArtByRoute } from "@/content/es/heroes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cómo trabajamos",
  description:
    "Venture operating company: la IA multiplica, el humano elige, el sistema ejecuta, la realidad valida.",
  path: "/como-trabajamos/",
});

const metodo = [
  {
    titulo: "Milagros verificables, no promesas",
    texto:
      "Cada proyecto debe producir un resultado que antes parecía desproporcionado para los recursos disponibles — y que se pueda contar en medios con evidencia. Milagro = historia + evidencia. Nunca solo historia.",
  },
  {
    titulo: "El caso 0 somos nosotros",
    texto:
      "No pedimos a nadie que confíe en un método que no hayamos sufrido primero. Esta empresa se construye en público con su propio sistema: web viva con datos diarios, decisiones documentadas, métricas visibles.",
  },
  {
    titulo: "Un sistema operativo, no horas",
    texto:
      "A cada founder le montamos su infraestructura completa: memoria documental, motor de conocimiento, base operativa, agentes especializados con permisos y límites, panel privado y escaparate público. No vendemos horas: vendemos transformación operacional.",
  },
  {
    titulo: "Equipos mínimos, resultados de gigante",
    texto:
      "Con inteligencia abundante y barata, un núcleo de 2–4 personas puede operar como una organización de cien. Esa asimetría es nuestro permiso fundacional — y lo que enseñamos a usar.",
  },
  {
    titulo: "Ningún hallazgo sin evidencia",
    texto:
      "Toda afirmación operativa nace de un comando ejecutado, un dato citado o un experimento medido. «No lo sé» solo vale después de haber demostrado la búsqueda.",
  },
];

export default function ComoTrabajamosPage() {
  return (
    <>
      <PageHero
        title="Cómo trabajamos"
        eyebrow="Método"
        description={
          <p>
            La IA multiplica, el humano elige, el sistema ejecuta y la realidad
            valida. Cada pieza debe acabar en una prueba observable.
          </p>
        }
        {...heroArtByRoute["/como-trabajamos/"]}
      />
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div
          className="rounded-lg border p-6 mb-10 grid sm:grid-cols-4 gap-4 text-center"
          style={{ borderColor: "var(--accent)" }}
        >
          {home.verbos.map((v) => (
            <p key={v.accion} className="m-0">
              <span
                className="block text-sm"
                style={{ color: "var(--fg-soft)" }}
              >
                {v.verbo}
              </span>
              <span className="block text-xl font-semibold">{v.accion}</span>
            </p>
          ))}
        </div>

        <div className="grid gap-8">
          {metodo.map((m) => (
            <section key={m.titulo}>
              <h2 className="text-2xl mb-2">{m.titulo}</h2>
              <p className="m-0 max-w-3xl">{m.texto}</p>
            </section>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl mb-2">Y cómo nos comportamos</h2>
          <p className="max-w-3xl">
            Los diez principios de nuestra comunidad — la jungla, las lianas,
            la fricción buena y el veto al humo — están en el{" "}
            <a href="/manifiesto/">manifiesto</a>. No son decoración: se
            aplican.
          </p>
        </section>
      </div>
    </>
  );
}
