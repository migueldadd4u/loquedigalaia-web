import { promises as fs } from "node:fs";
import path from "node:path";
import { NAV_ITEMS, SITE } from "@/lib/site";

type BuildStamp = {
  builtAt?: string;
  commit?: string;
};

/** Lee el sello de build generado por scripts/build-stamp.mjs (best effort). */
async function readBuildStamp(): Promise<BuildStamp | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "public", "build-stamp.json"),
      "utf8",
    );
    return JSON.parse(raw) as BuildStamp;
  } catch {
    return null;
  }
}

export async function SiteFooter() {
  const stamp = await readBuildStamp();
  const builtAt = stamp?.builtAt ? stamp.builtAt.slice(0, 10) : null;

  return (
    <footer className="mt-16 border-t border-petrol/20 dark:border-ivory/20">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-6">
          © {new Date().getFullYear()} {SITE.name}.
        </p>
        {builtAt ? (
          <p className="mt-1">
            <span>Última compilación: </span>
            <time dateTime={stamp?.builtAt}>{builtAt}</time>
          </p>
        ) : null}
      </div>
    </footer>
  );
}
