# Contrato de agentes — loquedigalaia-web

Este repo lo construyen varios agentes (Kimi K3, Codex, Claude) coordinados por fases. Este fichero es vinculante para todos.

## Reglas innegociables

1. **Datos personales: la identidad pública de los fundadores SÍ; la de terceros NO.** Aclarado por los fundadores el 03/08: aunque el repo es público, pueden versionarse sus nombres, sus fotos ya publicadas y sus datos de contacto públicos — toda esa información ya es pública por decisión suya; si algo concreto es privado, ellos lo dirán expresamente y se retira. Sigue prohibido sin excepción: datos de cualquier otra persona, credenciales/tokens, correos o teléfonos no públicos, y rutas locales de máquinas privadas (`/Users/...`). Ante la duda con un dato de terceros, se para y se anota en docs/DECISIONES.md.
2. **`assets-privados/` está en .gitignore** para material que los fundadores marquen como privado. El material público de los fundadores puede ir directamente a `public/images/`.
3. **Commits con autor neutro.** El repo fija `user.name`/`user.email` locales neutros; no los cambies ni firmes con identidad personal.
4. **Trabajo por rama + PR.** Nada directo a `main`. Un PR = una fase o una tarea de fase; el PR referencia el gate que satisface.
5. **Ningún hallazgo sin comando ejecutado.** «Verificado» significa: comando + salida en la descripción del PR. Los gates son scripts, no opiniones.
6. **Cero claims sin evidencia** en el contenido: toda cifra visible en la web lleva fuente enlazada o viene del contrato de datos (docs/DATOS.md).
7. **No se publica ni se toca DNS** sin aprobación expresa de los fundadores (fase F6).
8. **Keep it simple.** Ante dos diseños, el que tenga menos piezas. No añadir dependencias sin justificarlo en el PR.

## Cómo trabajar una fase

1. Lee PLAN.md §3 y localiza tu fase y su gate.
2. Crea rama `f<N>-<slug>` desde `main`.
3. Ejecuta. Si el plan y la realidad chocan, gana la realidad: documenta la desviación en el PR y, si cambia el plan, edita PLAN.md en el mismo PR.
4. Corre el gate (`npm run lint && npm test` como mínimo desde F1).
5. Abre PR con: qué se hizo, comandos ejecutados y su salida, checklist del gate.

## Referencias de metodología

La metodología madre es la refactorización de add4u.com (repo privado de los fundadores). Lo que hay que replicar está descrito en PLAN.md §1; no se necesita acceso a ese repo para ejecutar este plan. Si algo del pipeline (i18n post-build, export estático, snapshot con gate) resulta ambiguo, preguntar a Claude en el PR antes de inventar.
