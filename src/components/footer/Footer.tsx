import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

const LOCALES = ["en", "sk", "hu"] as const; // mirrors next.config.mjs i18n.locales

/**
 * One line. The year comes from the build stamp, not from `new Date()`: the
 * page is statically generated, so a client-side year would disagree with the
 * server's HTML on any New Year's Eve between deploys.
 */
export const Footer = () => {
  const t = useTranslations("footer");
  // Not hardcoded: Hungarian puts the family name first, and the footer must
  // agree with the <h1> the hero prints for the same locale.
  const hero = useTranslations("hero.common");
  const header = useTranslations("header");
  const { locale = "en" } = useRouter();
  const year = (process.env.NEXT_PUBLIC_BUILD_TIME ?? "").slice(0, 4) || "2026";

  return (
    <footer className="mt-16 border-t border-hairline">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-8 font-mono mono-1 text-xs text-fg-3 md:px-8">
        <span>© {year} {hero("name")}</span>
        <span aria-hidden>·</span>
        <span>{t("builtWith")}</span>
        <span aria-hidden>·</span>
        <a
          href="https://github.com/zsoolti8917"
          target="_blank"
          rel="me noreferrer"
          className="rounded transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {t("source")} ↗
        </a>
        <span aria-hidden>·</span>
        {/* The machine-readable copy of this site — see scripts/build-llm-assets.mjs. */}
        <a
          href="/llms.txt"
          className="rounded transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {t("llms")}
        </a>
        <span aria-hidden>·</span>
        {/* Real <a href="/sk"> links: the nav's locale menu is a JS-only
            button, so without these a non-JS reader has no in-page path
            between the language versions. */}
        {LOCALES.map((code) =>
          code === locale ? (
            <span key={code} aria-current="true">
              {header(`languages.${code}`)}
            </span>
          ) : (
            <Link
              key={code}
              href="/"
              locale={code}
              className="rounded transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {header(`languages.${code}`)}
            </Link>
          )
        )}
      </div>
    </footer>
  );
};
