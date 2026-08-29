import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, Variants } from "framer-motion";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useDialogKeys } from "../util/useDialogKeys";

const LOCALES = ["en", "sk", "hu"] as const;

/**
 * Locale switcher. `router.push('/', '/', { scroll: false })` keeps the URL
 * clean while Next swaps the locale; the manual `scrollTo` afterwards is what
 * `scroll: false` gave up, and landing mid-page in a language you cannot read
 * is worse than a jump to the top.
 */
export const LocaleMenu: React.FC = () => {
  const t = useTranslations("header");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  const changeLocale = (locale: string) => {
    router.push("/", "/", { locale, scroll: false }).then(() => {
      window.scrollTo(0, 0);
    });
    setOpen(false);
  };

  useDialogKeys({ open, onClose: () => setOpen(false) });

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <motion.div
      ref={containerRef}
      animate={open ? "open" : "closed"}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen((pv) => !pv)}
        aria-label={t("languageSelector")}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-hairline bg-surface-2 px-2.5 py-1.5 text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <FiGlobe className="hidden sm:block" />
        <span className="text-sm font-medium uppercase">{router.locale}</span>
        <motion.span variants={iconVariants(reduced)}>
          <FiChevronDown />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={wrapperVariants(reduced)}
            style={{ originY: "top" }}
            className="absolute right-0 top-[120%] flex w-44 flex-col gap-1 overflow-hidden rounded-lg border border-hairline bg-surface-2 p-1.5 shadow-xl"
          >
            {LOCALES.map((locale) => (
              <motion.li key={locale} role="none" variants={itemVariants(reduced)}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => changeLocale(locale)}
                  className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap rounded-md p-2 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span>{t(`languages.${locale}`)}</span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Factories rather than constants so `prefers-reduced-motion` can switch the
 * motion off without a second copy of the menu. Under the preference the panel
 * does not unroll and the rows do not stagger in — they are simply there, which
 * is the whole point: the menu still opens and closes, it just does not move.
 * The chevron still turns, because its rotation is state, not decoration; only
 * its duration goes to zero.
 */
const wrapperVariants = (reduced: boolean): Variants =>
  reduced
    ? { open: { scaleY: 1 }, closed: { scaleY: 1 } }
    : {
        open: { scaleY: 1, transition: { when: "beforeChildren", staggerChildren: 0.06 } },
        closed: { scaleY: 0, transition: { when: "afterChildren", staggerChildren: 0.06 } },
      };

const iconVariants = (reduced: boolean): Variants => ({
  open: { rotate: 180, transition: reduced ? { duration: 0 } : undefined },
  closed: { rotate: 0, transition: reduced ? { duration: 0 } : undefined },
});

const itemVariants = (reduced: boolean): Variants =>
  reduced
    ? { open: { opacity: 1, y: 0 }, closed: { opacity: 1, y: 0 } }
    : {
        open: { opacity: 1, y: 0, transition: { when: "beforeChildren" } },
        closed: { opacity: 0, y: -12, transition: { when: "afterChildren" } },
      };
