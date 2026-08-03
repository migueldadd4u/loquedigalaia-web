import type { Metadata } from "next";
import { DocumentoLegal } from "@/components/DocumentoLegal";
import { porRuta } from "@/content/es/legal";

const doc = porRuta["/accesibilidad/"];

export const metadata: Metadata = {
  title: doc.titulo,
  description: doc.descripcion,
};

export default function AccesibilidadPage() {
  return <DocumentoLegal doc={doc} />;
}
