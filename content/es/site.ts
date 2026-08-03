// Copy canónico en español (fuente para los diccionarios i18n de F2).
// Tono: docs/IDENTIDAD.md — claro, elegante, directo, ambicioso, cero humo.

export const site = {
  nombre: "Lo que diga la IA",
  claim: "La fábrica de milagros empresariales nativos de IA",
  descripcion:
    "Venture operating company creada por dos personas y sus dos clones de IA para construir empresas que resuelven problemas grandes de la humanidad.",
};

export const nav = [
  { href: "/", label: "Inicio" },
  { href: "/manifiesto/", label: "Manifiesto" },
  { href: "/problemas/", label: "Problemas" },
  { href: "/como-trabajamos/", label: "Cómo trabajamos" },
  { href: "/pulso/", label: "Pulso" },
  { href: "/cofundadores/", label: "Cofundadores" },
  { href: "/faq/", label: "Preguntas" },
  { href: "/contacto/", label: "Contacto" },
];

// Pie de página. Dos grupos porque responden a preguntas distintas: «con qué
// capacidad contáis» y «quién responde jurídicamente de esto». Los href con el
// formato "/segmento/" los lee scripts/i18n-build.mjs para prefijar los idiomas.
export const pie = {
  identificacion:
    "Iniciativa promovida a título personal por Miguel Ángel Domínguez Castellano y Luis Garvía Vega, que responden de este sitio web mientras la sociedad está en constitución. Sus datos identificativos completos figuran en el aviso legal.",
  grupos: [
    {
      titulo: "Respaldo",
      enlaces: [
        { href: "/respaldo/", label: "Qué hay detrás" },
        {
          href: "https://github.com/migueldadd4u/loquedigalaia-web",
          label: "Contribuir en GitHub",
        },
      ],
    },
    {
      titulo: "Legal",
      enlaces: [
        { href: "/aviso-legal/", label: "Aviso legal" },
        { href: "/privacidad/", label: "Privacidad" },
        { href: "/cookies/", label: "Cookies" },
        { href: "/accesibilidad/", label: "Accesibilidad" },
      ],
    },
  ],
};

export const home = {
  heroTitulo: "Una factoría de unicornios improbables.",
  heroSub:
    "Dos personas y sus dos clones de IA —Jarvis y ClonMADv3— han creado una empresa con vocación de interés público: convertir gente buena con obsesión y talento en compañías que resuelven problemas grandes de la humanidad.",
  heroCta: "Quiero ser cofundador",
  heroCtaSecundaria: "Leer el manifiesto",

  queEsTitulo: "Qué es",
  queEs:
    "«Lo que diga la IA» no es obedecer a una máquina. Es una disciplina operativa: diseñamos sistemas donde la inteligencia artificial obliga al humano a subir de nivel, decidir mejor y ejecutar con una velocidad y claridad que antes eran imposibles. No somos una consultora, ni una agencia, ni una aceleradora clásica: somos una venture operating company.",

  verbos: [
    { verbo: "La IA", accion: "multiplica" },
    { verbo: "El humano", accion: "elige" },
    { verbo: "El sistema", accion: "ejecuta" },
    { verbo: "La realidad", accion: "valida" },
  ],

  queHacemosTitulo: "Qué hacemos",
  queHacemos:
    "Cogemos personas con ambición, problema real y energía, y les construimos una infraestructura de IA, producto, narrativa, operación y financiación para convertirlas en scale-ups. Cada proyecto debe producir un milagro verificable: un resultado que antes parecía desproporcionado para los recursos disponibles, y que se puede contar en medios con evidencia.",
  milagroCero:
    "El primer milagro somos nosotros: esta empresa construyéndose en público con exactamente el sistema que luego aplicaremos a otros. Si funciona con nosotros, funciona con ellos.",

  paraQuienTitulo: "Para quién",
  paraQuien: [
    {
      titulo: "Emprendedores senior bloqueados",
      texto: "Experiencia brutal, velocidad baja. Les devolvemos la velocidad.",
    },
    {
      titulo: "Expertos sin máquina de ejecución",
      texto:
        "Saben muchísimo, pero su conocimiento no escala. Lo convertimos en plataforma.",
    },
    {
      titulo: "Fundadores con energía y cero sistema",
      texto: "Mucho fuego, poca estructura. Les damos exoesqueleto empresarial.",
    },
  ],

  ofertaTitulo: "Oferta inicial",
  ofertaNombre: "Sprint Fundacional · 45 días",
  oferta:
    "De la idea a la empresa lanzable: propuesta, narrativa, infraestructura de IA, oferta, primeras palancas comerciales y un activo público que lo demuestre. Sin humo: todo lo que se promete tiene demo, evidencia o avance visible.",

  problemasTitulo: "Los problemas que nos importan",
  problemasIntro:
    "Somos tan grandes como el mayor problema que vamos a resolver. Estos son los ocho por los que empezamos.",

  pulsoTitulo: "El pulso, en abierto",
  pulsoIntro:
    "Esta web se reconstruye cada día con los datos que publican nuestros clones. Construcción en público, con métricas, no con adjetivos.",
  pulsoVerCompleto: "Ver el pulso completo, con evolución y metodología",
  pulsoDatoDel: "dato del",
  pulsoEjemplo: "ejemplo",
  pulsoUltimoValido: "último valor válido",
  pulsoDatoAtenuado: "dato con más de 48 h, pendiente de refresco",

  ctaFinalTitulo: "Hablemos",
  ctaFinal:
    "Si tienes un problema real, obsesión y hambre, queremos conocerte. Una conversación, sin compromiso: entrar no compromete y salir no requiere explicación.",
  ctaFinalBoton: "Solicitar conversación",
};

export const problemas = [
  {
    id: "carceles",
    titulo: "Cárceles",
    estado: "Abandonadas",
    foto: {
      src: "/images/problems/carceles.avif",
      fallbackSrc: "/images/problems/carceles.jpg",
      alt: "Pasillo de una antigua prisión con celdas a ambos lados.",
    },
    texto:
      "Instituciones de las que la sociedad prefiere no hablar. La reinserción real necesita gestión, datos y oportunidades, no solo muros.",
  },
  {
    id: "salud-mental",
    titulo: "Salud mental",
    estado: "Olvidada",
    foto: {
      src: "/images/problems/salud-mental.avif",
      fallbackSrc: "/images/problems/salud-mental.jpg",
      alt: "Persona sentada en la oscuridad con las rodillas recogidas y el rostro fuera de plano.",
    },
    texto:
      "La epidemia silenciosa. Las listas de espera y el estigma dejan a demasiada gente sola justo cuando más acompañamiento necesita.",
  },
  {
    id: "jovenes-trabajo",
    titulo: "Jóvenes y trabajo",
    estado: "Ignorados",
    foto: {
      src: "/images/problems/jovenes-trabajo.avif",
      fallbackSrc: "/images/problems/jovenes-trabajo.jpg",
      alt: "Persona rellenando una solicitud de empleo sobre una mesa.",
    },
    texto:
      "Una generación preparada como ninguna se encuentra las puertas cerradas. El acceso al primer empleo digno es un problema de diseño, no de talento.",
  },
  {
    id: "tecnologia",
    titulo: "La tecnología que va a cambiar el mundo",
    estado: "Temida",
    foto: {
      src: "/images/problems/tecnologia.avif",
      fallbackSrc: "/images/problems/tecnologia.jpg",
      alt: "Manifestantes sostienen carteles que alertan sobre los riesgos de la inteligencia artificial.",
    },
    texto:
      "Como nos da miedo, miramos a otro lado o hacemos una ley, pero no la probamos. Nosotros la probamos: en público y con evidencia.",
  },
  {
    id: "educacion",
    titulo: "Educación",
    estado: "Por reconstruir",
    foto: {
      src: "/images/problems/educacion.avif",
      fallbackSrc: "/images/problems/educacion.jpg",
      alt: "Auditorio universitario vacío con filas de butacas rojas.",
    },
    texto:
      "La universidad tiene que reconstruirse para buscar criterio y no conocimiento. El conocimiento ya es abundante; el criterio, no.",
  },
  {
    id: "soberania",
    titulo: "Soberanía tecnológica",
    estado: "Cedida",
    foto: {
      src: "/images/problems/soberania.avif",
      fallbackSrc: "/images/problems/soberania.jpg",
      alt: "Pasillos del superordenador MareNostrum en Barcelona.",
    },
    texto:
      "En Europa consumimos productos de otros y desarrollamos poco. Sin capacidad propia no hay decisiones propias.",
  },
  {
    id: "vivienda",
    titulo: "Vivienda",
    estado: "Atascada",
    foto: {
      src: "/images/problems/vivienda.avif",
      fallbackSrc: "/images/problems/vivienda.jpg",
      alt: "Promoción de viviendas en construcción con andamios.",
    },
    texto:
      "La velocidad de gestión hace imposible resolver el problema. Es, sobre todo, un problema de ejecución — nuestra especialidad.",
  },
  {
    id: "administracion",
    titulo: "Administración pública",
    estado: "Desbordada",
    foto: {
      src: "/images/problems/administracion.avif",
      fallbackSrc: "/images/problems/administracion.jpg",
      alt: "Sala de una oficina pública llena de personas esperando ante mostradores numerados.",
    },
    texto:
      "Con los mayores ingresos de la historia, la gente siente que recibe el peor servicio público de siempre. Se puede servir mejor con lo mismo.",
  },
];

export const origenes = {
  titulo: "De dónde viene esto",
  intro:
    "Esto no nació en una pizarra: nació de años de trabajo, dos trayectorias reales y dos clones operativos construidos a la vista.",
  enlaces: [
    {
      pregunta: "¿Dónde nació todo?",
      href: "https://garvia.es/",
      etiqueta: "garvia.es",
      texto: "El origen intelectual: la tesis y las obsesiones que arrancaron esto.",
    },
    {
      pregunta: "¿Quién es el flipado técnico?",
      href: "https://miguelangeldominguez.info/",
      etiqueta: "miguelangeldominguez.info",
      texto: "El que convierte la energía en movimiento (y en sistemas).",
    },
    {
      pregunta: "¿Quién es ClonMAD?",
      href: "https://migueldadd4u.github.io/madclon-front-office/",
      etiqueta: "El front office del clon",
      texto: "El clon operativo, con su escaparate público de métricas.",
    },
  ],
};

export const cofundadores = {
  titulo: "Cualquiera puede ser cofundador",
  intro:
    "Los primeros que apostaron y pusieron dinero fueron los dos fundadores. Pero esta empresa tiene vocación de interés público, y cofundar no es una fecha: es una forma de comprometerse con el problema.",
  tesis:
    "Si compartes la constitución, aportas trabajo, criterio o capital, y te comprometes con alguno de los ocho problemas, puedes ser considerado cofundador — aunque llegues cinco años después.",
  comoTitulo: "Cómo se entra",
  como: [
    "Lee el manifiesto. Si no lo compartes, no sigas: no pasa nada.",
    "Elige el problema que te obsesiona y cuéntanos qué harías con él.",
    "Una conversación. Si hay encaje, empezamos con algo pequeño y verificable.",
    "Aquí nadie está atado a nada: entrar no compromete y salir no requiere explicación.",
  ],
  cta: "Solicitar conversación",
};

export const pulso = {
  titulo: "El pulso de la empresa",
  intro:
    "Datos publicados por los clones de los fundadores. La web se reconstruye cada día con ellos: si un dato no pasa el control de calidad, se muestra el último válido con su fecha — nunca un número inventado.",
  avisoSample:
    "Datos de ejemplo. Las fuentes reales de los clones están en proceso de publicación; este es el formato exacto con el que se mostrarán.",
  evolucionTitulo: "Evolución",
  evolucionIntro:
    "Cada lectura que pasa el control de calidad queda registrada. Esta es la serie reciente de cada indicador, con la fecha de cada dato.",
  metodologiaTitulo: "Metodología: cómo se valida cada dato",
  metodologiaIntro:
    "Un proceso automático descarga cada noche el pulso que publican los clones y solo reconstruye la web si hay datos válidos nuevos. El contrato completo está en docs/DATOS.md del repositorio público; estas son las reglas:",
  metodologiaReglas: [
    "Esquema cerrado: un JSON que no cumple el contrato se descarta entero esa noche.",
    "Frescura: un dato con más de 48 horas se muestra atenuado y siempre con su fecha.",
    "Monotonía: los contadores acumulados no pueden decrecer; si lo hacen, se conserva el último valor válido.",
    "Consenso: un cambio brusco de más del 20 % solo se acepta si dos lecturas separadas al menos 5 minutos coinciden.",
    "Reserva por indicador: si un dato falla, ese indicador — y solo ese — cae a su último valor válido. La página nunca se rompe ni inventa un número.",
    "Nada muere en silencio: si una fuente falla 7 días seguidos, se abre una incidencia en el repositorio.",
  ],
  metodologiaFuentes:
    "Fase 1: datos del clon ClonMADv3. Fase 2: suma de ClonMADv3 y Jarvis. Las URLs públicas de las fuentes viven en data/sources.json del repositorio, sin credenciales.",
};
