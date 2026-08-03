import { DocumentoLegal } from "@/components/DocumentoLegal";
import { pageMetadata } from "@/lib/seo";
import { porRuta } from "@/content/es/legal";

const doc = porRuta["/accesibilidad/"];

export const metadata = pageMetadata({
  title: doc.titulo,
  description: doc.descripcion,
  path: "/accesibilidad/",
});

export default function AccesibilidadPage() {
  return <DocumentoLegal doc={doc} />;
}
