# Checklist de accesibilidad AA

Criterio de gate (F4), no de pulido. Cada punto debe estar cubierto por un test automático sobre el HTML renderizado o, si es imposible automatizar, por una verificación manual documentada con evidencia en `docs/TESTING.md`.

## Estructura y semántica
- [ ] Un único `<h1>` por página; jerarquía de encabezados sin saltos.
- [ ] Landmarks: `header`, `nav`, `main`, `footer`; skip-link «Saltar al contenido» como primer elemento enfocable.
- [ ] `lang` correcto en `<html>` por locale; `hreflang` en alternativas.
- [ ] Todo funciona **sin JavaScript**: la web es estática de verdad.

## Percepción
- [ ] Contraste AA: ≥ 4.5:1 texto normal, ≥ 3:1 texto grande e iconos informativos (test computado sobre los tokens de color).
- [ ] `alt` significativo en toda imagen informativa; `alt=""` en decorativas; el distintivo «Imagen generada con IA» es texto real, no solo visual.
- [ ] La información nunca depende solo del color.
- [ ] Texto redimensionable al 200 % sin pérdida (layout fluido, sin alturas fijas en contenedores de texto).

## Operación
- [ ] Todo interactivo alcanzable y operable por teclado; orden de tabulación lógico.
- [ ] Focus visible siempre (nunca `outline: none` sin sustituto).
- [ ] Targets táctiles ≥ 44×44 px en móvil.
- [ ] `prefers-reduced-motion` respetado: sin animaciones esenciales.

## Formularios (F5)
- [ ] `label` asociado a cada campo; errores descritos en texto y vinculados con `aria-describedby`.
- [ ] Envío operable por teclado; mensajes de éxito/error anunciados (`role="status"`).

## Multidispositivo
- [ ] Breakpoints verificados: 360 px (móvil), 768 px (tablet), 1280 px (escritorio); sin scroll horizontal en ninguno.
- [ ] Modo claro y oscuro con contraste AA en ambos.

## Herramientas del gate
- axe-core contra el HTML exportado (todas las rutas × locales) — cero violaciones AA.
- Test propio de contraste sobre los tokens Tailwind.
- Lighthouse a11y ≥ 95 en staging (registro en TESTING.md).
