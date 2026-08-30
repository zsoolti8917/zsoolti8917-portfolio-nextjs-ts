import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { FiMenu, FiSearch } from "react-icons/fi";
import { OutlineButton } from "../buttons/OutlineButton";
import { useTerminalBus } from "../bus/TerminalBus";
import { scrollToTop } from "../ScrollToTopButton";
import { cvUmamiEvent, getCVUrl } from "@/lib/cv";
import { LocaleMenu } from "./LocaleMenu";
import { useScrollSpy } from "./useScrollSpy";

/** The sticky bar's height. Anything computing `100svh - nav` imports this. */
export const NAV_HEIGHT = 56;

const SECTIONS = ["about", "projects", "experience", "contact"] as const;

export const TopNav = () => {
  const t = useTranslations();
  const router = useRouter();
  const { openPalette } = useTerminalBus();
  const active = useScrollSpy([...SECTIONS]);

  // Rendered empty on the server: the platform is unknowable there, and a
  // guess that flips on hydration is a visible label swap. Never read
  // `navigator` during render.
  const [shortcut, setShortcut] = useState("");
  useEffect(() => {
    setShortcut(/Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "⌘K" : "Ctrl K");
  }, []);

  const locale = router.locale || "en";

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-hairline bg-canvas/70 backdrop-blur-md">
      {/* Three cells from lg, not justify-between: the links must sit at the
          exact centre of the page however wide the actions cluster is (with
          justify-between they sat centred in the GAP, ~130px left of centre).
          Only from lg — below 1024px the two side clusters plus the links do
          not fit on one line around a true centre, so the bar stays flex and
          the links keep their old position. `minmax(0,1fr)` rather than `1fr`:
          a bare 1fr track refuses to shrink below its content, and a long
          locale label would give the whole page a horizontal scrollbar. The
          `justify-self-*` classes are ignored in flex layout, so they need no
          breakpoint prefix. */}
      <nav className="mx-auto flex h-full items-center justify-between gap-4 px-4 md:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label={t("nav.home")}
          // justify-self-start: a grid item stretches by default, which would
          // turn this button into an invisible hit target across the left third
          // of the bar.
          className="justify-self-start rounded font-mono mono-1 text-xl font-bold leading-none text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          V<span className="text-accent">.</span>
        </button>

        {/* Hidden below md — the palette lists the same sections there. */}
        <div className="hidden min-w-0 items-center gap-6 justify-self-center md:flex">
          {SECTIONS.map((id) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                className={`relative rounded py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  isActive ? "text-fg" : "text-fg-2 hover:text-fg"
                }`}
              >
                {t(`nav.${id}`)}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-accent"
                  />
                )}
              </a>
            );
          })}
        </div>

        <div className="flex min-w-0 items-center gap-2 justify-self-end md:gap-3">
          {/* Two buttons rather than one with a responsive label: aria-label
              cannot follow a media query, and `hidden` takes the other out of
              the accessibility tree entirely. */}
          <button
            type="button"
            onClick={openPalette}
            aria-label={t("nav.menu")}
            className="flex items-center rounded-md border border-hairline bg-surface-2 p-2 text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:hidden"
          >
            <FiMenu />
          </button>
          <button
            type="button"
            onClick={openPalette}
            aria-label={t("nav.palette")}
            className="hidden items-center gap-2 rounded-md border border-hairline bg-surface-2 px-2.5 py-1.5 text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:flex"
          >
            <FiSearch />
            <span className="font-mono mono-1 min-w-[3.5rem] text-xs">{shortcut}</span>
          </button>

          <LocaleMenu />

          <OutlineButton
            data-umami-event={cvUmamiEvent(locale)}
            onClick={() => window.open(getCVUrl(locale))}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {t("nav.cv")}
          </OutlineButton>
        </div>
      </nav>
    </header>
  );
};
