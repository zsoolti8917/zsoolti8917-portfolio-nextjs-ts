import Link from "next/link";
import React, { useState } from "react";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import { OutlineButton } from "../buttons/OutlineButton";
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { motion, Variants } from "framer-motion";
import { useLanguage } from "../LanguageContext";

export const Header: React.FC = () => {
  const t = useTranslations('header');
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const { incrementLanguageChangeCount } = useLanguage();

  const changeLocale = (newLocale: string) => {
    router.push('/', '/', { locale: newLocale, scroll: false }).then(() => {
      window.scrollTo(0, 0);
      incrementLanguageChangeCount();
    });
    setOpen(false);
  };

  const getCVUrl = (locale: string) => {
    switch (locale) {
      case 'sk':
        return "/Varju-CV-SK.pdf";
      case 'hu':
        return "/Varju-CV-HU.pdf";
      default:
        return "/Varju-CV-EN.pdf";
    }
  };

  return (
    <header className="h-[72px] px-4 flex items-center justify-between sticky top-0 z-20 bg-zinc-900/50 backdrop-blur-md">
      <MyLinks />
      <div className="flex items-center gap-4">
        <motion.div animate={open ? "open" : "closed"} className="relative">
          <button
            onClick={() => setOpen((pv) => !pv)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <FiGlobe />
            <span className="font-medium text-sm">{t(`languages.${router.locale}`)}</span>
            <motion.span variants={iconVariants}>
              <FiChevronDown />
            </motion.span>
          </button>
          <motion.ul
  initial="closed"
  variants={wrapperVariants}
  animate={open ? "open" : "closed"}
  style={{ originY: "top", translateX: "-50%" }}
  className="flex flex-col gap-2 p-2 rounded-lg bg-zinc-800 shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden"
>
            <Option setOpen={setOpen} text={t('languages.en')} onClick={() => changeLocale('en')} />
            <Option setOpen={setOpen} text={t('languages.sk')} onClick={() => changeLocale('sk')} />
            <Option setOpen={setOpen} text={t('languages.hu')} onClick={() => changeLocale('hu')} />
          </motion.ul>
        </motion.div>
        <OutlineButton onClick={() => window.open(getCVUrl(router.locale || 'en'))}>
          {t('resumeButton')}
        </OutlineButton>
      </div>
    </header>
  );
};

interface OptionProps {
  text: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClick: () => void;
}

const Option: React.FC<OptionProps> = ({ text, setOpen, onClick }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md hover:bg-zinc-700 text-zinc-300 hover:text-indigo-300 transition-colors cursor-pointer"
    >
      <span>{text}</span>
    </motion.li>
  );
};

export const MyLinks: React.FC = () => {
  const t = useTranslations('header');

  return (
    <div className="flex items-center text-lg gap-4">
      <Link
        className="text-zinc-300 hover:text-indigo-300 transition-colors"
        href="https://www.linkedin.com/in/zsoltvarju/"
        target="_blank"
        rel="nofollow"
        aria-label={t('linkedinAria')}
      >
        <SiLinkedin />
      </Link>
      <Link
        className="text-zinc-300 hover:text-indigo-300 transition-colors"
        href="https://github.com/zsoolti8917"
        target="_blank"
        rel="nofollow"
        aria-label={t('githubAria')}
      >
        <SiGithub />
      </Link>
    </div>
  );
};

const wrapperVariants: Variants = {
  open: {
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
    },
  },
};

const iconVariants: Variants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
    },
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: "afterChildren",
    },
  },
};