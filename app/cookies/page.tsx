import { DocumentoLegal } from "@/components/DocumentoLegal";
import { pageMetadata } from "@/lib/seo";
import { porRuta } from "@/content/es/legal";

const doc = porRuta["/cookies/"];

export const metadata = pageMetadata({
  title: doc.titulo,
  description: doc.descripcion,
  path: "/cookies/",
});

export default function CookiesPage() {
  return <DocumentoLegal doc={doc} />;
}
