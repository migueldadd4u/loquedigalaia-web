import { DocumentoLegal } from "@/components/DocumentoLegal";
import { pageMetadata } from "@/lib/seo";
import { porRuta } from "@/content/es/legal";

const doc = porRuta["/respaldo/"];

export const metadata = pageMetadata({
  title: doc.titulo,
  description: doc.descripcion,
  path: "/respaldo/",
});

export default function RespaldoPage() {
  return <DocumentoLegal doc={doc} />;
}
