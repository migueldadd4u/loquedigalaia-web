import { DocumentoLegal } from "@/components/DocumentoLegal";
import { pageMetadata } from "@/lib/seo";
import { porRuta } from "@/content/es/legal";

const doc = porRuta["/aviso-legal/"];

export const metadata = pageMetadata({
  title: doc.titulo,
  description: doc.descripcion,
  path: "/aviso-legal/",
});

export default function AvisoLegalPage() {
  return <DocumentoLegal doc={doc} />;
}
