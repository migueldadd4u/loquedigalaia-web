import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { markdownToHtml } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Manifiesto",
  description:
    "La constitución de Lo que diga la IA: por qué nace, los ocho problemas y cómo nos comportamos.",
};

export default function ManifiestoPage() {
  const md = readFileSync(join(process.cwd(), "MANIFIESTO.md"), "utf-8");
  // Se retira el banner de control interno (la cita inicial) del render público.
  const publicMd = md.replace(/^> \*\*Texto definitivo\*\*.*$/m, "");
  const html = markdownToHtml(publicMd);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <article className="prose-md" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
