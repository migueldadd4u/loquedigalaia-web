import { DocumentoLegal } from "@/components/DocumentoLegal";
import { porRuta } from "@/content/es/legal";
import { pageMetadata } from "@/lib/seo";

const doc = porRuta["/cookies/"];

export const metadata = pageMetadata({
  title: doc.titulo,
  description: doc.descripcion,
  path: "/cookies/",
});

export default function CookiesPage() {
  return <DocumentoLegal doc={doc} />;
}
