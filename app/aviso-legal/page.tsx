import { DocumentoLegal } from "@/components/DocumentoLegal";
import { porRuta } from "@/content/es/legal";
import { pageMetadata } from "@/lib/seo";

const doc = porRuta["/aviso-legal/"];

export const metadata = pageMetadata({
  title: doc.titulo,
  description: doc.descripcion,
  path: "/aviso-legal/",
});

export default function AvisoLegalPage() {
  return <DocumentoLegal doc={doc} />;
}
