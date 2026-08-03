import type { Metadata } from "next";
import { MarkdownDocument } from "@/components/markdown-document";
import {
  contentSource,
  readContentDocument,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Cómo trabajamos",
  description: "Metodología de Lo que diga la IA.",
};

export default async function ComoTrabajamosPage() {
  const source = await readContentDocument("como-trabajamos");
  return (
    <MarkdownDocument
      source={source}
      sourceLabel={contentSource("como-trabajamos")}
    />
  );
}
