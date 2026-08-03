# Contenido

- `es/` — fuente canónica de cada página (markdown/MDX, se conecta al scaffold en F1).
- `en/` — no se escribe a mano página a página: las traducciones van en `i18n/en.json` (diccionario post-build, mismo mecanismo que add4u-web). Esta carpeta solo guarda contenidos largos que merezcan traducción editorial completa (manifiesto).
- `i18n/` — diccionarios `<locale>.json` (se crea en F1).

El manifiesto NO se duplica aquí: `/manifiesto` importa [../MANIFIESTO.md](../MANIFIESTO.md).
