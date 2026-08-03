import type { Metadata } from "next";
import { MarkdownDocument } from "@/components/markdown-document";
import {
  contentSource,
  readContentDocument,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Cofundadores",
  description: "Cualquiera puede ser cofundador aunque llegue cinco años después.",
};

export default async function CofundadoresPage() {
  const source = await readContentDocument("cofundadores");
  return (
    <MarkdownDocument
      source={source}
      sourceLabel={contentSource("cofundadores")}
    />
  );
}
