import type { Metadata } from "next";
import { DocumentoLegal } from "@/components/DocumentoLegal";
import { porRuta } from "@/content/es/legal";

const doc = porRuta["/privacidad/"];

export const metadata: Metadata = {
  title: doc.titulo,
  description: doc.descripcion,
};

export default function PrivacidadPage() {
  return <DocumentoLegal doc={doc} />;
}
