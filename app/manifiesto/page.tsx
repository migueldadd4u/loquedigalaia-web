import type { Metadata } from "next";
import { MarkdownDocument } from "@/components/markdown-document";
import {
  contentSource,
  readContentDocument,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Manifiesto",
  description: "La constitución completa de Lo que diga la IA.",
};

export default async function ManifiestoPage() {
  const source = await readContentDocument("manifiesto");
  const publicSource = source.replace(/^(# [^\n]+\n\n)>[^\n]+\n\n/, "$1");
  if (publicSource === source) {
    throw new Error("MANIFIESTO.md no contiene la entradilla editorial esperada");
  }
  return (
    <MarkdownDocument
      canonicalSource={source}
      source={publicSource}
      sourceLabel={contentSource("manifiesto")}
    />
  );
}
