import { DocumentoLegal } from "@/components/DocumentoLegal";
import { porRuta } from "@/content/es/legal";
import { pageMetadata } from "@/lib/seo";

const doc = porRuta["/privacidad/"];

export const metadata = pageMetadata({
  title: doc.titulo,
  description: doc.descripcion,
  path: "/privacidad/",
});

export default function PrivacidadPage() {
  return <DocumentoLegal doc={doc} />;
}
