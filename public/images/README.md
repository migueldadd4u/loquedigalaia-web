# Política de imágenes

1. **Generadas con IA**: solo para ilustrar conceptos de la propia empresa. Siempre renderizadas con el componente `<AiImage>`, que añade el distintivo visible «Imagen generada con IA» (transparencia, Reglamento europeo de IA art. 50). Nombre de fichero con sufijo `-ia` (p. ej. `factoria-ia.webp`).
2. **Reales (no IA)**: obligatorias para los 8 problemas de la constitución. Licencia verificada y atribución completa en `CREDITS.md` (crear en F4).
3. **Caras y personas identificables**: NO entran en este repo. Viven en `assets-privados/` (gitignored) y se inyectan en el build de producción solo tras aprobar la decisión D2.
4. Formatos: `webp`/`avif` con fallback, `loading="lazy"` salvo hero, `alt` obligatorio.
