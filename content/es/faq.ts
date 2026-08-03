// Preguntas y respuestas — borrador para revisión de los fundadores.
// Criterio: las más noticiables y las que más confusión evitan. Tono: claro,
// con carácter, cero humo. Fuente única: esta lista alimenta la página /faq
// y el JSON-LD FAQPage.

export type Faq = { id: string; q: string; a: string };

export const faqs: Faq[] = [
  {
    id: "que-es",
    q: "¿Qué es «Lo que diga la IA»?",
    a: "Una empresa creada por dos personas y sus dos clones de IA —Jarvis y ClonMADv3— para convertir gente buena con obsesión y talento en compañías que resuelven problemas grandes de la humanidad. No somos una consultora, ni una agencia, ni una aceleradora: somos una venture operating company, una fábrica de empresas.",
  },
  {
    id: "clones-fundadores",
    q: "¿En serio dos clones de IA forman parte del equipo fundador?",
    a: "En serio. Jarvis y ClonMADv3 llevan meses trabajando: gestionan agendas, vigilan canales, sintetizan reuniones, escriben y se corrigen entre sí. No son un chatbot con logo: son sistemas operativos personales construidos durante años. Esta web se reconstruye cada día con los datos que ellos publican — puedes verlos en la página del pulso.",
  },
  {
    id: "obedecer",
    q: "¿«Lo que diga la IA» significa que obedecéis a una máquina?",
    a: "No: significa lo contrario de lo que parece, y por eso nos gusta el nombre. Es una disciplina operativa: la IA multiplica, el humano elige, el sistema ejecuta y la realidad valida. Diseñamos sistemas donde la IA te obliga a pensar mejor, decidir mejor y ejecutar más rápido. El criterio siempre es humano.",
  },
  {
    id: "unicornios-improbables",
    q: "¿Qué es una «factoría de unicornios improbables»?",
    a: "Un unicornio improbable es una empresa enorme construida por alguien a quien nadie daba esa capacidad: un experto sin equipo, una emprendedora senior a la que el mercado ya no miraba, un joven con energía y cero estructura. Nuestro trabajo es fabricar las condiciones para que eso deje de ser improbable. No garantizamos unicornios; garantizamos desproporción operativa.",
  },
  {
    id: "milagro",
    q: "¿Qué es un «milagro verificable»?",
    a: "Un resultado que antes parecía desproporcionado para los recursos disponibles — y que se puede contar en medios con evidencia, no con adjetivos. Una persona sola lanzando un producto con apariencia de equipo de veinte. Una pyme tradicional creando una división nativa de IA en semanas. Milagro = historia + evidencia. Sin evidencia, no cuenta.",
  },
  {
    id: "primer-caso",
    q: "¿Cuál es vuestro primer caso de éxito?",
    a: "Nosotros mismos, y se está construyendo delante de ti. El caso 0 es esta empresa creándose en público con exactamente el sistema que luego aplicaremos a otros: web viva con métricas diarias, decisiones documentadas, clones trabajando. Si funciona con nosotros, funciona con ellos. Si no funciona, también se verá — esa es la gracia.",
  },
  {
    id: "anthropic",
    q: "¿Por qué decís que queréis pareceros a cómo se creó Anthropic?",
    a: "Porque escribieron la constitución antes que el plan de negocio. Nosotros también: lo importante es resolver problemas grandes de la humanidad; el dinero da opciones, pero no es el objetivo; y somos tan grandes como el mayor problema que vayamos a resolver. La constitución completa está publicada en el manifiesto.",
  },
  {
    id: "dinero",
    q: "Si el dinero no es el objetivo, ¿cómo vivís?",
    a: "Cobrando por lo que construimos, como cualquier empresa seria: la primera oferta es el Sprint Fundacional de 45 días, y en los proyectos con más recorrido combinamos honorarios con participación. La diferencia no está en cobrar o no cobrar: está en qué elegimos construir y para qué. El beneficio financia el siguiente problema.",
  },
  {
    id: "cofundador-tarde",
    q: "¿Puedo ser cofundador si llego cinco años tarde?",
    a: "Sí, y no es una frase de marketing: está en nuestra constitución. Los primeros en apostar y poner dinero fueron los dos fundadores, pero cofundar no es una fecha — es una forma de comprometerse con el problema. Si compartes el manifiesto y aportas trabajo, criterio o capital sobre alguno de los ocho problemas, la puerta de cofundador está abierta. Aunque vengas en 2031.",
  },
  {
    id: "ocho-problemas",
    q: "¿Por qué exactamente esos ocho problemas?",
    a: "Cárceles, salud mental, jóvenes y trabajo, la tecnología que cambia el mundo, educación, soberanía tecnológica, vivienda y administración pública. Son los problemas de los que todo el mundo habla y a los que casi nadie dedica capacidad de ejecución real. Nosotros medimos nuestro tamaño por el tamaño del problema que atacamos — así que empezamos por los grandes.",
  },
  {
    id: "miedo-ia",
    q: "¿No os da miedo la IA?",
    a: "Nos da más miedo la reacción europea: mirar a otro lado o hacer una ley sin haberla probado. Nuestra postura es probarla en público, con transparencia y con evidencia: etiquetamos toda imagen generada con IA, publicamos los datos de nuestros clones cada día y contamos lo que sale mal. El miedo se combate con criterio, y el criterio se entrena usándola.",
  },
  {
    id: "etiqueta-ia",
    q: "¿Por qué vuestras imágenes de IA llevan una etiqueta de la Unión Europea?",
    a: "Porque el Reglamento Europeo de Inteligencia Artificial (art. 50) obliga a marcar de forma clara el contenido generado o manipulado con IA, y nosotros lo aplicamos con el distintivo oficial de la UE superpuesto en cada imagen — el mismo criterio que ya usa add4u.com. Y porque encaja con lo que somos: defendemos probar la tecnología en vez de temerla, y eso solo es creíble si la usamos con transparencia total. Las fotos de personas reales, en cambio, van siempre sin retoque de IA y señaladas como fotografía real.",
  },
  {
    id: "datos-diarios",
    q: "¿Qué es eso de que la web «se reconstruye cada día»?",
    a: "La web es estática — rápida, segura, sin cookies — pero está viva: cada día se regenera con los datos que publican los clones de los fundadores, incluido el total de tokens que consumen. Cada dato lleva su fecha, y si un dato no pasa el control de calidad se muestra el último válido — nunca un número inventado. Construir en público también es esto.",
  },
];
