import { useTranslations } from "next-intl";

/**
 * One line. The year comes from the build stamp, not from `new Date()`: the
 * page is statically generated, so a client-side year would disagree with the
 * server's HTML on any New Year's Eve between deploys.
 */
export const Footer = () => {
  const t = useTranslations("footer");
  const year = (process.env.NEXT_PUBLIC_BUILD_TIME ?? "").slice(0, 4) || "2026";

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-8 text-sm text-fg-3 md:px-8">
        <span>© {year} Zsolt Varjú</span>
        <span aria-hidden>·</span>
        <span>{t("builtWith")}</span>
        <span aria-hidden>·</span>
        <a
          href="https://github.com/zsoolti8917"
          target="_blank"
          rel="noreferrer"
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
      </div>
    </footer>
  );
};
