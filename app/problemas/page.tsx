import type { Metadata } from "next";
import { MarkdownDocument } from "@/components/markdown-document";
import {
  contentSource,
  readContentDocument,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Problemas",
  description: "Los 8 problemas foco de Lo que diga la IA.",
};

export default async function ProblemasPage() {
  const source = await readContentDocument("problemas");
  return (
    <MarkdownDocument
      source={source}
      sourceLabel={contentSource("problemas")}
    />
  );
}
