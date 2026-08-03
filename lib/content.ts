import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_FILES = {
  manifiesto: "MANIFIESTO.md",
  problemas: "content/es/problemas.md",
  "como-trabajamos": "content/es/como-trabajamos.md",
  cofundadores: "content/es/cofundadores.md",
} as const;

export type ContentDocument = keyof typeof CONTENT_FILES;

export function contentSource(document: ContentDocument): string {
  return CONTENT_FILES[document];
}

/** Lee únicamente documentos editoriales incluidos en la lista cerrada anterior. */
export async function readContentDocument(
  document: ContentDocument,
): Promise<string> {
  switch (document) {
    case "manifiesto":
      return readFile(path.join(process.cwd(), "MANIFIESTO.md"), "utf8");
    case "problemas":
      return readFile(
        path.join(process.cwd(), "content", "es", "problemas.md"),
        "utf8",
      );
    case "como-trabajamos":
      return readFile(
        path.join(process.cwd(), "content", "es", "como-trabajamos.md"),
        "utf8",
      );
    case "cofundadores":
      return readFile(
        path.join(process.cwd(), "content", "es", "cofundadores.md"),
        "utf8",
      );
  }
}
