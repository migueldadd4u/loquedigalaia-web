import { DocumentoLegal } from "@/components/DocumentoLegal";
import { porRuta } from "@/content/es/legal";
import { pageMetadata } from "@/lib/seo";

const doc = porRuta["/accesibilidad/"];

export const metadata = pageMetadata({
  title: doc.titulo,
  description: doc.descripcion,
  path: "/accesibilidad/",
});

export default function AccesibilidadPage() {
  return <DocumentoLegal doc={doc} />;
}
