// Páginas del pie: respaldo de los fundadores y textos preceptivos en la UE.
//
// Cada párrafo es una unidad de traducción completa (un solo nodo de texto), para
// que scripts/i18n-build.mjs pueda sustituirlo entero. Los enlaces van al final del
// párrafo y su rótulo es su propia clave.
//
// Regla editorial, que es también jurídica: una capacidad de un fundador NO es una
// capacidad de la iniciativa. Toda certificación se atribuye a su titular con su CIF
// y ninguna organización citada aparece como patrocinadora. Ver /aviso-legal.

export interface Enlace {
  t: string;
  href: string;
}

export type Bloque =
  | { tipo: "seccion"; titulo: string }
  | { tipo: "parrafo"; texto: string; enlace?: Enlace }
  | { tipo: "lista"; items: string[] };

export interface Documento {
  ruta: string;
  titulo: string;
  descripcion: string;
  entradilla: string;
  bloques: Bloque[];
}

/** Datos identificativos exigidos por el artículo 10 de la LSSI-CE. */
export const identificacion = {
  promotores: [
    { nombre: "Miguel Ángel Domínguez Castellano", dni: "01178330V" },
    { nombre: "Luis Garvía Vega", dni: "51429410F" },
  ],
  domicilio: "Calle Puerta de Abajo, 14, bajo, 28430 Alpedrete (Madrid)",
  correos: ["migueld@add4u.com", "lgarvia@comillas.edu"],
  vigencia: "3 de agosto de 2026",
};

const respaldo: Documento = {
  ruta: "/respaldo/",
  titulo: "Qué hay detrás",
  descripcion:
    "Qué aportan los fundadores a la iniciativa, y qué no debe deducirse de ello.",
  entradilla:
    "Esta iniciativa acaba de empezar y no tiene todavía resultados que enseñar. Lo que no empieza de cero es la trayectoria de las dos personas que la promueven.",
  bloques: [
    {
      tipo: "parrafo",
      texto:
        "Conviene separar las dos cosas desde el principio, porque la diferencia es la que separa el criterio del humo: lo que sigue no son logros de esta iniciativa, sino capacidades que sus fundadores traen consigo y ponen a disposición del proyecto.",
    },
    { tipo: "seccion", titulo: "Miguel Ángel Domínguez Castellano" },
    {
      tipo: "parrafo",
      texto:
        "Una empresa que responde. Es cofundador y administrador solidario de Add4u Soluciones para Gestión y Desarrollo, S.L., una empresa española que automatiza el expediente administrativo en el sector público. Su trabajo se mide en operaciones reales sobre administraciones en producción, publicadas en abierto en",
      enlace: { t: "la web de Add4u", href: "https://add4u.com" },
    },
    {
      tipo: "parrafo",
      texto:
        "Seguridad y cumplimiento auditados por terceros. Add4u está certificada en el Esquema Nacional de Seguridad en categoría alta y en el Esquema Nacional de Interoperabilidad, además de las normas ISO/IEC 42001 de gestión de la inteligencia artificial, ISO/IEC 27001, ISO/IEC 27701, ISO 22301, ISO/IEC 20000, ISO 9001 e ISO 14001. El alcance y la vigencia de cada certificado, con el documento verificable, se publican en",
      enlace: {
        t: "la página de seguridad de Add4u",
        href: "https://add4u.com/seguridad",
      },
    },
    {
      tipo: "parrafo",
      texto:
        "Blockchain como infraestructura de país. Preside la Asociación Consorcio Red Alastria, que reúne a más de 500 organizaciones entre empresas, universidades y administraciones públicas, y que se describe a sí misma como una de las mayores plataformas blockchain público-permisionadas y multisectoriales del mundo:",
      enlace: { t: "alastria.io", href: "https://alastria.io" },
    },
    {
      tipo: "parrafo",
      texto:
        "Una infraestructura nacional en marcha. Alastria impulsa ISBE, la Infraestructura de Servicios Blockchain de España, que se plantea sostener la soberanía tecnológica española garantizando la interoperabilidad con Europa, con cumplimiento del Reglamento General de Protección de Datos y del reglamento eIDAS2 por diseño:",
      enlace: { t: "redisbe.com", href: "https://redisbe.com" },
    },
    { tipo: "seccion", titulo: "Luis Garvía Vega" },
    {
      tipo: "parrafo",
      texto:
        "Universidad. Es doctor en Finanzas por la Universidad Pontificia Comillas, ingeniero industrial superior por ICAI, licenciado en Administración y Dirección de Empresas y en Derecho por la UNED, y Executive MBA por el IESE. Dirige el Máster en Gestión de Riesgos de ICADE y da clase de finanzas en ICADE, en el IEB y en New York University. Ejerce además como administrador concursal.",
    },
    {
      tipo: "parrafo",
      texto:
        "Medios. Analiza economía y mercados en radio y televisión: colabora en la tertulia económica de Radio Intereconomía y ha participado en programas como laSexta Xplica, laSexta Noche, Todo Es Mentira de Cuatro y Y ahora Sonsoles de Antena 3. Publica de forma habitual en",
      enlace: { t: "LinkedIn", href: "https://www.linkedin.com/in/garvia/" },
    },
    {
      tipo: "parrafo",
      texto:
        "Traducir sin deformar. Su oficio es explicar en tres minutos, y ante una audiencia que no es técnica, algo que normalmente exige una hora y un doctorado. Es exactamente la capacidad que le falta a casi todo proyecto tecnológico que merece la pena.",
    },
    { tipo: "seccion", titulo: "Qué significa esto, y qué no" },
    {
      tipo: "parrafo",
      texto:
        "Las certificaciones son de Add4u, no nuestras. El Esquema Nacional de Seguridad, el Esquema Nacional de Interoperabilidad y las normas ISO citadas están concedidos a Add4u Soluciones para Gestión y Desarrollo, S.L., una sociedad distinta de esta iniciativa, y amparan el alcance auditado en esa empresa. Lo que aportan aquí es una vía: si un proyecto necesita operar en un entorno certificado, existe la posibilidad de hacerlo con Add4u mediante la relación contractual que corresponda.",
    },
    {
      tipo: "parrafo",
      texto:
        "Ninguna organización citada nos respalda. Add4u, Alastria, ISBE, las universidades y los medios de comunicación mencionados no patrocinan esta iniciativa, no la financian y no responden de ella. Aparecen porque describen la trayectoria profesional de sus fundadores, y sus nombres y marcas pertenecen a sus titulares.",
    },
    {
      tipo: "parrafo",
      texto:
        "Acceso no es resultado. Poder contar algo en un plató o en un aula no hace que la idea sea buena. Sirve para que una idea que ya funciona llegue más lejos, y para que una que no funciona se descarte antes. La prueba sigue siendo la misma de siempre: evidencia publicada, en el pulso y en lo que hagamos.",
    },
    {
      tipo: "parrafo",
      texto: "El tratamiento jurídico de todo lo anterior está detallado en el",
      enlace: { t: "aviso legal", href: "/aviso-legal/" },
    },
  ],
};

const avisoLegal: Documento = {
  ruta: "/aviso-legal/",
  titulo: "Aviso legal",
  descripcion:
    "Titularidad del sitio, condiciones de uso y alcance de las certificaciones y organizaciones citadas.",
  entradilla:
    "Este aviso cumple el deber de información del artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico, y recoge las condiciones de uso de este sitio web. Texto vigente desde el 3 de agosto de 2026.",
  bloques: [
    { tipo: "seccion", titulo: "Quién responde de este sitio web" },
    {
      tipo: "parrafo",
      texto:
        "Lo que diga la IA es una iniciativa en constitución. Hoy no existe todavía una sociedad mercantil detrás: la están creando dos personas físicas, que responden de este sitio web a título personal y de forma solidaria mientras dure esa fase.",
    },
    { tipo: "parrafo", texto: "Promotores y titulares del sitio:" },
    {
      tipo: "lista",
      items: [
        "Miguel Ángel Domínguez Castellano, con DNI 01178330V.",
        "Luis Garvía Vega, con DNI 51429410F.",
      ],
    },
    {
      tipo: "parrafo",
      texto: "Datos de contacto a efectos de comunicación directa y efectiva:",
    },
    {
      tipo: "lista",
      items: [
        "Domicilio a efectos de notificaciones: Calle Puerta de Abajo, 14, bajo, 28430 Alpedrete (Madrid).",
        "Correo electrónico: migueld@add4u.com y lgarvia@comillas.edu.",
      ],
    },
    {
      tipo: "parrafo",
      texto:
        "Cuando la sociedad quede constituida e inscrita, este aviso se sustituirá por el de la sociedad, con su denominación, su número de identificación fiscal, su domicilio social y sus datos registrales, y dejará de identificar a los promotores como titulares a título personal.",
    },
    { tipo: "seccion", titulo: "Qué es este sitio y qué no es" },
    {
      tipo: "parrafo",
      texto:
        "Este sitio web tiene finalidad exclusivamente informativa: explica el manifiesto de la iniciativa, los problemas en los que quiere trabajar, su método y su estado de avance.",
    },
    {
      tipo: "parrafo",
      texto:
        "No es una oferta comercial ni una invitación a contratar. No se venden productos ni servicios, no se publican precios, no se ofrecen productos o servicios financieros y no se realiza ninguna actividad de intermediación. Nada de lo publicado aquí constituye asesoramiento profesional de ningún tipo, ni jurídico, ni financiero, ni de inversión. El acceso a este sitio no crea ninguna relación contractual entre el usuario y los titulares.",
    },
    {
      tipo: "parrafo",
      texto:
        "Los contenidos describen un proyecto en curso. Pueden estar incompletos, quedar desactualizados o modificarse sin aviso previo, y los objetivos que se enuncian son direcciones de trabajo, no resultados conseguidos ni compromisos exigibles.",
    },
    { tipo: "seccion", titulo: "Certificaciones, marcas y organizaciones citadas" },
    {
      tipo: "parrafo",
      texto:
        "Esta sección es la contrapartida jurídica de la página Qué hay detrás y prevalece sobre cualquier lectura de aquella que induzca a confusión.",
    },
    {
      tipo: "parrafo",
      texto:
        "Las certificaciones no son de esta iniciativa. Las certificaciones del Esquema Nacional de Seguridad, del Esquema Nacional de Interoperabilidad y de las normas ISO que se mencionan en este sitio están concedidas a Add4u Soluciones para Gestión y Desarrollo, S.L., con número de identificación fiscal B-84428879, persona jurídica distinta e independiente de esta iniciativa y de sus promotores. Amparan únicamente el alcance auditado en esa sociedad y en las condiciones que fija cada certificado. Ni esta iniciativa ni sus promotores a título personal están certificados en esas normas, y nada de lo publicado aquí debe interpretarse como que lo estén.",
    },
    {
      tipo: "parrafo",
      texto:
        "Los cargos son personales. La condición de administrador solidario de Add4u Soluciones para Gestión y Desarrollo, S.L. y la de presidente de la Asociación Consorcio Red Alastria corresponden a Miguel Ángel Domínguez Castellano a título individual, y se mencionan como parte de su trayectoria profesional. No implican que esas entidades participen en esta iniciativa ni que asuman obligación alguna derivada de ella.",
    },
    {
      tipo: "parrafo",
      texto:
        "Ausencia de patrocinio y de respaldo institucional. Add4u Soluciones para Gestión y Desarrollo, S.L., la Asociación Consorcio Red Alastria, el proyecto ISBE, las universidades y los medios de comunicación citados en este sitio no patrocinan, no promueven, no financian, no supervisan y no respaldan esta iniciativa, y no responden de sus contenidos ni de sus actuaciones. La actividad docente y la participación en medios de comunicación de Luis Garvía Vega se desarrollan a título personal y en el marco de sus relaciones profesionales con cada institución o medio, ajenas a esta iniciativa.",
    },
    {
      tipo: "parrafo",
      texto:
        "El domicilio de notificaciones coincide con el domicilio social de Add4u Soluciones para Gestión y Desarrollo, S.L. porque uno de los promotores desarrolla allí su actividad profesional. Se señala únicamente como dirección postal a efectos de comunicación con los titulares: no convierte a esa sociedad en prestadora de este servicio ni en responsable de este sitio web.",
    },
    {
      tipo: "parrafo",
      texto:
        "Marcas de terceros. Las denominaciones, marcas, logotipos y nombres comerciales citados pertenecen a sus respectivos titulares. Se emplean únicamente con finalidad identificativa y descriptiva, al amparo del artículo 37 del Reglamento (UE) 2017/1001 sobre la marca de la Unión Europea, sin que su mención suponga vínculo, autorización, patrocinio ni recomendación algunos.",
    },
    {
      tipo: "parrafo",
      texto:
        "Compromiso de no inducir a error. Los titulares asumen expresamente el deber de no presentar como propias capacidades, certificaciones o avales ajenos, conforme a la Ley 3/1991, de 10 de enero, de Competencia Desleal. Si alguna afirmación de este sitio induce a error sobre este punto, puede comunicarse a la dirección de contacto y será corregida.",
    },
    { tipo: "seccion", titulo: "Propiedad intelectual e industrial" },
    {
      tipo: "parrafo",
      texto:
        "Los textos, el diseño, el código y los demás contenidos originales de este sitio son titularidad de sus promotores o se utilizan con autorización, y están protegidos por el Real Decreto Legislativo 1/1996, de 12 de abril, por el que se aprueba el texto refundido de la Ley de Propiedad Intelectual.",
    },
    {
      tipo: "parrafo",
      texto:
        "Se permite citar y enlazar libremente el contenido de este sitio indicando su procedencia. No se permite su explotación comercial ni la creación de obras derivadas que se presenten como propias sin autorización expresa.",
    },
    {
      tipo: "parrafo",
      texto:
        "Las imágenes de los promotores publicadas en este sitio lo están con su consentimiento. Este sitio no publica imágenes de terceros identificables sin autorización documentada.",
    },
    { tipo: "seccion", titulo: "Condiciones de uso" },
    {
      tipo: "parrafo",
      texto:
        "El acceso a este sitio es libre y gratuito, salvo el coste de la conexión que corresponda al proveedor contratado por cada usuario. El usuario se compromete a hacer un uso conforme a la ley, a la buena fe y a este aviso, y a no realizar actividades que perjudiquen el funcionamiento del sitio, su seguridad o los derechos de terceros.",
    },
    { tipo: "seccion", titulo: "Enlaces a sitios de terceros" },
    {
      tipo: "parrafo",
      texto:
        "Este sitio enlaza fuentes externas para que cualquier afirmación pueda comprobarse. Esos sitios son gestionados por terceros sobre los que los titulares no ejercen control alguno: no responden de sus contenidos, de su disponibilidad ni de sus políticas de privacidad. La existencia de un enlace no implica relación, recomendación ni respaldo.",
    },
    { tipo: "seccion", titulo: "Responsabilidad" },
    {
      tipo: "parrafo",
      texto:
        "Los titulares ponen los medios razonables para que la información publicada sea exacta y esté actualizada, y para que el sitio funcione correctamente, pero no garantizan la ausencia de errores ni la disponibilidad ininterrumpida del servicio. En la medida permitida por la ley, no responden de los daños derivados del uso de la información publicada ni de interrupciones del servicio ajenas a su control.",
    },
    {
      tipo: "parrafo",
      texto:
        "Nada en esta cláusula excluye la responsabilidad que no pueda excluirse legalmente, en particular frente a consumidores y usuarios.",
    },
    { tipo: "seccion", titulo: "Protección de datos" },
    {
      tipo: "parrafo",
      texto:
        "El tratamiento de datos personales se rige por el Reglamento (UE) 2016/679, General de Protección de Datos, y por la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales. La información completa está en la",
      enlace: { t: "política de privacidad", href: "/privacidad/" },
    },
    { tipo: "seccion", titulo: "Modificación de este aviso" },
    {
      tipo: "parrafo",
      texto:
        "Los titulares pueden modificar este aviso para adaptarlo a cambios normativos o del propio proyecto. La versión aplicable es la publicada en cada momento, con la fecha de vigencia indicada al principio.",
    },
    { tipo: "seccion", titulo: "Ley aplicable y jurisdicción" },
    {
      tipo: "parrafo",
      texto:
        "Este aviso se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que resulten competentes conforme a derecho. Cuando el usuario tenga la condición de consumidor, será competente el fuero que le reconozca la normativa de defensa de consumidores y usuarios, sin que este aviso pueda privarle de esa protección.",
    },
  ],
};

const privacidad: Documento = {
  ruta: "/privacidad/",
  titulo: "Política de privacidad",
  descripcion:
    "Qué datos personales tratamos, con qué base jurídica y cómo ejercer tus derechos.",
  entradilla:
    "Esta política explica qué datos personales tratamos y con qué garantías, conforme al Reglamento (UE) 2016/679, General de Protección de Datos, y a la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales. Texto vigente desde el 3 de agosto de 2026.",
  bloques: [
    { tipo: "seccion", titulo: "Lo esencial, primero" },
    {
      tipo: "parrafo",
      texto:
        "Esta web no te pide datos, no te sigue y no usa cookies. No hay formularios, no hay perfiles, no hay publicidad y no hay analítica de audiencia. Solo tratamos datos personales si decides escribirnos, y únicamente para responderte.",
    },
    { tipo: "seccion", titulo: "Quién es el responsable" },
    {
      tipo: "parrafo",
      texto:
        "Mientras la sociedad está en constitución, son corresponsables del tratamiento, conforme al artículo 26 del Reglamento General de Protección de Datos, las dos personas que promueven la iniciativa: Miguel Ángel Domínguez Castellano y Luis Garvía Vega. Sus datos identificativos completos figuran en el",
      enlace: { t: "aviso legal", href: "/aviso-legal/" },
    },
    {
      tipo: "parrafo",
      texto:
        "Puedes dirigirte a cualquiera de ellos, para cualquier cuestión relacionada con tus datos o para ejercer tus derechos, en migueld@add4u.com o en lgarvia@comillas.edu.",
    },
    {
      tipo: "parrafo",
      texto:
        "No estamos obligados a designar delegado de protección de datos, porque no concurren los supuestos del artículo 37 del Reglamento. Si eso cambia, se publicará aquí.",
    },
    { tipo: "seccion", titulo: "Qué datos tratamos y para qué" },
    {
      tipo: "parrafo",
      texto:
        "Si nos escribes, tratamos los datos que incluyas en tu mensaje: normalmente tu nombre, tu dirección de correo y el contenido de lo que nos cuentas. La finalidad es leerte y responderte, y nada más. La base jurídica es tu propio consentimiento al dirigirte a nosotros y, en su caso, la aplicación de medidas precontractuales a petición tuya, conforme al artículo 6.1, letras a y b, del Reglamento.",
    },
    {
      tipo: "parrafo",
      texto:
        "Conservamos esos mensajes mientras la conversación siga viva y, después, durante el plazo necesario para atender posibles responsabilidades legales. Puedes pedirnos que los borremos antes.",
    },
    {
      tipo: "parrafo",
      texto:
        "Si nos escribes hablándonos de otra persona, te pedimos que no incluyas datos suyos que no sean imprescindibles. Los que no lo sean serán eliminados.",
    },
    { tipo: "seccion", titulo: "Qué ocurre al visitar la web" },
    {
      tipo: "parrafo",
      texto:
        "Este sitio es estático: se sirve como ficheros ya generados, sin base de datos ni sesión de usuario. No instalamos cookies ni ninguna otra tecnología de seguimiento en tu equipo, según se detalla en la",
      enlace: { t: "política de cookies", href: "/cookies/" },
    },
    {
      tipo: "parrafo",
      texto:
        "El proveedor de alojamiento, Cloudflare, trata datos técnicos de conexión, como tu dirección IP, con la única finalidad de servir las páginas y proteger la infraestructura frente a ataques y abusos. Es un tratamiento necesario para que la web funcione y para su seguridad, amparado en el interés legítimo del artículo 6.1, letra f, del Reglamento. Actúa como encargado del tratamiento, con el contrato exigido por el artículo 28 y con las garantías previstas en el capítulo V del Reglamento para cualquier transferencia internacional.",
    },
    { tipo: "seccion", titulo: "Con quién compartimos tus datos" },
    {
      tipo: "parrafo",
      texto:
        "Con nadie, salvo el proveedor de alojamiento en los términos anteriores y salvo obligación legal o requerimiento de una autoridad competente. No vendemos ni cedemos datos, no elaboramos perfiles y no tomamos decisiones automatizadas que produzcan efectos jurídicos sobre las personas.",
    },
    { tipo: "seccion", titulo: "Los datos del pulso" },
    {
      tipo: "parrafo",
      texto:
        "Los indicadores que publicamos en el pulso son datos agregados de nuestro propio trabajo, como el consumo acumulado de tokens: no contienen información personal de los visitantes ni de terceros.",
    },
    { tipo: "seccion", titulo: "Tus derechos" },
    {
      tipo: "parrafo",
      texto:
        "Puedes ejercer en cualquier momento los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar tu consentimiento sin que ello afecte a la licitud del tratamiento anterior. Basta con escribirnos indicando qué derecho quieres ejercer. Responderemos en el plazo de un mes previsto en el Reglamento.",
    },
    {
      tipo: "parrafo",
      texto:
        "Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos, con domicilio en la calle Jorge Juan 6, 28001 Madrid, a través de su sede electrónica:",
      enlace: { t: "aepd.es", href: "https://www.aepd.es" },
    },
    { tipo: "seccion", titulo: "Seguridad y cambios" },
    {
      tipo: "parrafo",
      texto:
        "Aplicamos medidas técnicas y organizativas proporcionadas al riesgo, empezando por la más eficaz de todas: no recoger datos que no necesitamos. El código de esta web es público y auditable.",
    },
    {
      tipo: "parrafo",
      texto:
        "Si esta política cambia, por ejemplo cuando se active el formulario de contacto o cuando la sociedad quede constituida, se publicará aquí la nueva versión con su fecha de vigencia.",
    },
  ],
};

const cookies: Documento = {
  ruta: "/cookies/",
  titulo: "Política de cookies",
  descripcion: "Esta web no usa cookies ni analítica de audiencia.",
  entradilla: "Texto vigente desde el 3 de agosto de 2026.",
  bloques: [
    { tipo: "seccion", titulo: "Esta web no usa cookies" },
    {
      tipo: "parrafo",
      texto:
        "No instalamos cookies propias ni de terceros en tu equipo, ni ninguna otra tecnología equivalente de almacenamiento o recuperación de datos: ni balizas web, ni almacenamiento local, ni huella digital del navegador.",
    },
    {
      tipo: "parrafo",
      texto:
        "Por eso no verás aquí ningún banner pidiéndote permiso. El artículo 22.2 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información exige el consentimiento informado del usuario para usar dispositivos de almacenamiento y recuperación de datos en su equipo. La forma más limpia de cumplirlo es no necesitarlo.",
    },
    { tipo: "seccion", titulo: "Tampoco medimos tu visita" },
    {
      tipo: "parrafo",
      texto:
        "No usamos ninguna herramienta de analítica de audiencia, ni siquiera de las que funcionan sin cookies. No sabemos cuántas personas nos visitan, ni desde dónde, ni qué páginas leen.",
    },
    {
      tipo: "parrafo",
      texto:
        "El proveedor de alojamiento registra datos técnicos de conexión para servir las páginas y proteger la infraestructura, como se explica en la política de privacidad. Ese registro es necesario para que la web funcione y no se utiliza para perfilar a nadie.",
    },
    { tipo: "seccion", titulo: "Si esto cambia" },
    {
      tipo: "parrafo",
      texto:
        "Si en el futuro incorporamos alguna herramienta que requiera cookies no imprescindibles, esta página detallará cada una con su proveedor, su finalidad, su tipo y su duración, y se pedirá tu consentimiento previo mediante un aviso que permita aceptarlas, rechazarlas y configurarlas con la misma facilidad.",
    },
    {
      tipo: "parrafo",
      texto:
        "Mientras tanto, no hay nada que configurar. Si aun así quieres revisar o borrar el almacenamiento de este u otro sitio, puedes hacerlo desde los ajustes de privacidad de tu navegador.",
    },
  ],
};

const accesibilidad: Documento = {
  ruta: "/accesibilidad/",
  titulo: "Accesibilidad",
  descripcion:
    "Compromiso de accesibilidad de este sitio, qué está hecho y qué no.",
  entradilla:
    "Queremos que esta web pueda usarla cualquiera, con cualquier dispositivo y con cualquier tecnología de apoyo. Texto vigente desde el 3 de agosto de 2026.",
  bloques: [
    { tipo: "seccion", titulo: "Nuestro compromiso" },
    {
      tipo: "parrafo",
      texto:
        "Tomamos como referencia las Pautas de Accesibilidad para el Contenido Web en su versión 2.2, nivel AA, y la norma europea UNE-EN 301 549. Esta iniciativa no presta todavía un servicio de los que obligan por ley a publicar una declaración de accesibilidad: lo hacemos porque una web que excluye a parte de sus lectores no cumple su función.",
    },
    { tipo: "seccion", titulo: "Qué está hecho" },
    {
      tipo: "lista",
      items: [
        "La página funciona sin JavaScript: el contenido y la navegación son HTML servido tal cual.",
        "Toda la web se recorre con teclado y el foco es siempre visible.",
        "Estructura semántica: cabecera, navegación, contenido principal y pie identificados como regiones, y un único encabezado de primer nivel por página.",
        "Contraste de color suficiente para texto normal, en modo claro y en modo oscuro, respetando la preferencia del sistema.",
        "Los enlaces del texto van subrayados: nunca se distinguen solo por el color.",
        "Se respeta la preferencia de movimiento reducido del sistema operativo.",
        "Cada idioma se declara en el código y las versiones alternativas están enlazadas entre sí.",
      ],
    },
    { tipo: "seccion", titulo: "Qué no está hecho" },
    {
      tipo: "parrafo",
      texto:
        "Todavía no hemos encargado una auditoría externa de accesibilidad, así que esta declaración se basa en comprobaciones automáticas y propias, que detectan bastante menos que una revisión con usuarios reales.",
    },
    {
      tipo: "parrafo",
      texto:
        "Sabemos además que estas comprobaciones no cubren todo lo que importa: la claridad del lenguaje, la carga cognitiva de un texto largo o la utilidad real con un lector de pantalla se evalúan con personas, no con un script.",
    },
    { tipo: "seccion", titulo: "Si encuentras una barrera" },
    {
      tipo: "parrafo",
      texto:
        "Escríbenos contándonos qué página es, qué intentabas hacer y con qué navegador o tecnología de apoyo. Es la vía más rápida de que se corrija, y agradecemos el aviso. Las direcciones están en el",
      enlace: { t: "aviso legal", href: "/aviso-legal/" },
    },
  ],
};

export const documentos: Documento[] = [
  respaldo,
  avisoLegal,
  privacidad,
  cookies,
  accesibilidad,
];

export const porRuta = Object.fromEntries(
  documentos.map((d) => [d.ruta, d]),
) as Record<string, Documento>;
