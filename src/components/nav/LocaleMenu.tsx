import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

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

  const changeLocale = (locale: string) => {
    router.push("/", "/", { locale, scroll: false }).then(() => {
      window.scrollTo(0, 0);
    });
    setOpen(false);
  };

  return (
    <motion.div animate={open ? "open" : "closed"} className="relative">
      <button
        type="button"
        onClick={() => setOpen((pv) => !pv)}
        aria-label={t("languageSelector")}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-hairline bg-surface-2 px-2.5 py-1.5 text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg"
      >
        <FiGlobe className="hidden sm:block" />
        <span className="text-sm font-medium uppercase">{router.locale}</span>
        <motion.span variants={iconVariants}>
          <FiChevronDown />
        </motion.span>
      </button>
      <motion.ul
        initial="closed"
        variants={wrapperVariants}
        animate={open ? "open" : "closed"}
        style={{ originY: "top" }}
        className="absolute right-0 top-[120%] flex w-44 flex-col gap-1 overflow-hidden rounded-lg border border-hairline bg-surface-2 p-1.5 shadow-xl"
      >
        {LOCALES.map((locale) => (
          <motion.li
            key={locale}
            variants={itemVariants}
            onClick={() => changeLocale(locale)}
            className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap rounded-md p-2 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg"
          >
            <span>{t(`languages.${locale}`)}</span>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
};

const wrapperVariants: Variants = {
  open: { scaleY: 1, transition: { when: "beforeChildren", staggerChildren: 0.06 } },
  closed: { scaleY: 0, transition: { when: "afterChildren", staggerChildren: 0.06 } },
};

const iconVariants: Variants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants: Variants = {
  open: { opacity: 1, y: 0, transition: { when: "beforeChildren" } },
  closed: { opacity: 0, y: -12, transition: { when: "afterChildren" } },
};
