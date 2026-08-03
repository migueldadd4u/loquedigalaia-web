// Publica una representación Markdown de cada página española a partir del HTML
// estático recién horneado. El HTML y el Markdown nacen así de la misma fuente
// React/contenido, sin mantener copias editoriales en paralelo.

import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { parse } from "node-html-parser";

const OUT = resolve(process.argv[2] ?? "out");
const BASE_URL = "https://loquedigalaia.com";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG"]);

async function filesBelow(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(path)));
    else files.push(path);
  }
  return files;
}

function routeFromHtml(relativeHtml) {
  const unix = relativeHtml.split(sep).join("/");
  if (unix === "index.html") return "/";
  return `/${unix.replace(/\/index\.html$/, "").replace(/\.html$/, "")}/`;
}

function mirrorFromRoute(route) {
  if (route === "/") return "index.md";
  return `${route.replace(/^\//, "").replace(/\/$/, "")}.md`;
}

function markdownText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/([\\`*_\[\]])/g, "\\$1");
}

function inlineChildren(node) {
  let rendered = "";
  let previous = null;

  for (const child of node.childNodes) {
    const piece = inline(child);
    if (!piece) continue;
    const plain = child.text ?? child.textContent ?? "";
    const core = plain.trim();
    const current = {
      startsWord: /^[\p{L}\p{M}\p{N}]/u.test(core),
      endsWord: /[\p{L}\p{M}\p{N}]$/u.test(core),
      leadingSpace: /^\s/u.test(plain),
      trailingSpace: /\s$/u.test(plain),
    };
    // JSX suele expresar separación visual mediante spans/elementos hermanos y
    // no siempre deja un nodo de texto con espacio en el HTML. Se conserva una
    // frontera de palabra para que "La IA" + "multiplica" no se pegue.
    if (
      previous?.endsWord &&
      current.startsWord &&
      !previous.trailingSpace &&
      !current.leadingSpace
    ) rendered += " ";
    rendered += piece;
    previous = current;
  }

  return rendered;
}

function inline(node) {
  if (node.nodeType === 3) return markdownText(node.text ?? node.textContent ?? "");
  if (node.nodeType !== 1) return "";

  const tag = node.tagName;
  if (SKIP_TAGS.has(tag)) return "";
  const children = () => inlineChildren(node);

  if (tag === "BR") return "  \n";
  if (tag === "IMG") {
    const src = node.getAttribute("src") ?? "";
    const alt = markdownText(node.getAttribute("alt") ?? "");
    return src ? `![${alt}](${src})` : "";
  }
  if (tag === "A") {
    const label = children().trim();
    const href = node.getAttribute("href");
    return href && label ? `[${label}](${href})` : label;
  }
  if (tag === "STRONG" || tag === "B") return `**${children().trim()}**`;
  if (tag === "EM" || tag === "I") return `*${children().trim()}*`;
  if (tag === "CODE") return `\`${children().trim().replaceAll("`", "\\`")}\``;
  return children();
}

function cleanBlock(value) {
  return value
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function renderChildren(node) {
  return node.childNodes
    .map((child) => renderBlock(child))
    .map(cleanBlock)
    .filter(Boolean)
    .join("\n\n");
}

function renderList(node, ordered) {
  const items = node.childNodes.filter(
    (child) => child.nodeType === 1 && child.tagName === "LI",
  );
  return items
    .map((item, index) => {
      const marker = ordered ? `${index + 1}.` : "-";
      const body = cleanBlock(renderChildren(item) || inline(item));
      const indented = body.replace(/\n/g, "\n   ");
      return `${marker} ${indented}`;
    })
    .join("\n");
}

function renderBlock(node) {
  if (node.nodeType === 3) {
    const text = markdownText(node.text ?? node.textContent ?? "").trim();
    return text;
  }
  if (node.nodeType !== 1 || SKIP_TAGS.has(node.tagName)) return "";

  const tag = node.tagName;
  const heading = tag.match(/^H([1-6])$/);
  if (heading) return `${"#".repeat(Number(heading[1]))} ${inline(node).trim()}`;
  if (tag === "P" || tag === "FIGCAPTION" || tag === "ADDRESS") {
    return inline(node).trim();
  }
  if (tag === "UL") return renderList(node, false);
  if (tag === "OL") return renderList(node, true);
  if (tag === "BLOCKQUOTE") {
    return cleanBlock(renderChildren(node) || inline(node))
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  }
  if (tag === "DETAILS") {
    const summary = node.childNodes.find(
      (child) => child.nodeType === 1 && child.tagName === "SUMMARY",
    );
    const rest = node.childNodes
      .filter((child) => child !== summary)
      .map(renderBlock)
      .map(cleanBlock)
      .filter(Boolean)
      .join("\n\n");
    return [`## ${summary ? inline(summary).trim() : "Detalle"}`, rest]
      .filter(Boolean)
      .join("\n\n");
  }
  if (tag === "SUMMARY" || tag === "DT") return `**${inline(node).trim()}**`;
  if (tag === "DD") return inline(node).trim();
  if (["A", "STRONG", "B", "EM", "I", "CODE", "SPAN", "SMALL", "TIME"].includes(tag)) {
    return inline(node).trim();
  }
  if (tag === "IMG") return inline(node);
  if (tag === "HR") return "---";
  return renderChildren(node);
}

function contentMeta(root, selector, attribute = "content") {
  return root.querySelector(selector)?.getAttribute(attribute)?.trim() ?? "";
}

const allHtml = await filesBelow(OUT);
for (const path of allHtml) {
  if (!path.endsWith(".md")) continue;
  const markdown = await readFile(path, "utf8");
  if (markdown.startsWith("<!-- Generado desde ")) await unlink(path);
}
const pages = [];

for (const htmlPath of allHtml) {
  const rel = relative(OUT, htmlPath);
  const unixRel = rel.split(sep).join("/");
  if (!rel.endsWith(".html")) continue;
  if (
    unixRel === "404.html" ||
    unixRel === "404/index.html" ||
    rel.split(sep).some((part) => part.startsWith("_"))
  ) {
    continue;
  }

  const root = parse(await readFile(htmlPath, "utf8"), { comment: true });
  if (root.querySelector("html")?.getAttribute("lang") !== "es") continue;
  const main = root.querySelector("main#contenido");
  if (!main) continue;

  const route = routeFromHtml(rel);
  const mirror = mirrorFromRoute(route);
  const markdown = cleanBlock(renderChildren(main));
  const title = main.querySelector("h1")?.text.trim() || contentMeta(root, "meta[property='og:title']");
  if (!title || !markdown) {
    throw new Error(`agents-build: ${route} no tiene h1 o contenido publicable`);
  }

  const mirrorPath = join(OUT, mirror);
  await mkdir(dirname(mirrorPath), { recursive: true });
  await writeFile(
    mirrorPath,
    `<!-- Generado desde ${route} por scripts/agents-build.mjs; no editar a mano. -->\n\n${markdown}\n`,
  );
  pages.push({ route, mirror, title, root });
}

pages.sort((a, b) => (a.route === "/" ? -1 : b.route === "/" ? 1 : a.route.localeCompare(b.route)));
if (!pages.length || pages[0].route !== "/") {
  throw new Error("agents-build: no se encontró la portada canónica");
}

const home = pages[0];
const siteName = contentMeta(home.root, "meta[property='og:site_name']") || "Lo que diga la IA";
const description = contentMeta(home.root, "meta[name='description']");
const pageLines = pages.map(
  ({ mirror, route, title }) =>
    `- [${title}](${BASE_URL}/${mirror}) — [versión HTML](${new URL(route, `${BASE_URL}/`).toString()})`,
);
const pageMirrors = new Set(pages.map(({ mirror }) => mirror));
const resources = [];
for (const path of await filesBelow(OUT)) {
  const rel = relative(OUT, path).split(sep).join("/");
  if (!rel.endsWith(".md") || pageMirrors.has(rel)) continue;
  const markdown = await readFile(path, "utf8");
  // Un espejo generado que ya no corresponde a una página (por ejemplo, un
  // 404 de una salida anterior) nunca se promociona como recurso editorial.
  if (markdown.startsWith("<!-- Generado desde ")) continue;
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || rel;
  resources.push({ rel, title });
}
resources.sort((a, b) => a.rel.localeCompare(b.rel));
const resourcesBlock = resources.length
  ? `\n\n## Otros recursos públicos\n\n${resources
      .map(({ rel, title }) => `- [${title}](${BASE_URL}/${rel})`)
      .join("\n")}`
  : "";

const llms = `# ${siteName}

> ${description}

Este fichero es el mapa canónico del sitio para agentes. El contenido editorial vive en las páginas HTML y cada enlace Markdown se genera automáticamente desde ese mismo HTML durante el build.

## Contenidos

${pageLines.join("\n")}${resourcesBlock}

## Datos de El pulso

- Página: ${BASE_URL}/pulso/
- Espejo Markdown: ${BASE_URL}/pulso.md
- Datos JSON: ${BASE_URL}/pulso.json
- Contrato: cada indicador incluye identificador, etiqueta, valor, unidad, fecha del dato y fuente. La fecha global está en \`asOf\`.
- El HTML, el JSON-LD Dataset y \`pulso.json\` leen el mismo snapshot; si el valor publicado es de ejemplo, \`source\` lo declara como \`sample\`.

## Cómo citarnos

Cita «${siteName}», el título de la página concreta y su URL canónica. Para métricas, enlaza \`/pulso.json\` e incluye el \`asOf\` del indicador citado.
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

await writeFile(join(OUT, "llms.txt"), llms);
await writeFile(join(OUT, "robots.txt"), robots);

console.log(`agents-build · ${pages.length} espejos Markdown · llms.txt · robots.txt`);
