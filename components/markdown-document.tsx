import { createHash } from "node:crypto";
import Markdown, { type Components } from "react-markdown";

function internalHref(href: string | undefined): string | undefined {
  if (!href?.startsWith("/") || href.endsWith("/") || /[?#]/.test(href)) {
    return href;
  }
  return `${href}/`;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-12 text-2xl font-bold tracking-tight sm:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 text-xl font-bold tracking-tight">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-4 max-w-3xl text-lg">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 max-w-3xl border-l-4 border-sage pl-5 text-lg text-petrol/80 dark:border-sage-light dark:text-ivory/80">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-7 text-lg">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 max-w-3xl list-decimal space-y-3 pl-7 text-lg">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ children, href }) => (
    <a href={internalHref(href)} className="font-medium underline">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
};

type MarkdownDocumentProps = {
  canonicalSource?: string;
  source: string;
  sourceLabel: string;
};

export function MarkdownDocument({
  canonicalSource,
  source,
  sourceLabel,
}: MarkdownDocumentProps) {
  const sourceHash = createHash("sha256")
    .update(canonicalSource ?? source)
    .digest("hex");
  return (
    <article
      data-content-source={sourceLabel}
      data-content-sha256={sourceHash}
    >
      <Markdown skipHtml components={components}>
        {source}
      </Markdown>
    </article>
  );
}
