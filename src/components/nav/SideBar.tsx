import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SideBarLink } from "./SideBarLink";
import { useTranslations } from 'next-intl';
import { scrollToTop } from "../ScrollToTopButton";
export const SideBar = () => {
  const [selected, setSelected] = useState("");
  const t = useTranslations('sidebar');

  useEffect(() => {
    const sections = document.querySelectorAll(".section-wrapper");

    const options = {
      threshold: 0.3,
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setSelected(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const links = [
    { value: "about", href: "#about", label: t('about') },
    { value: "projects", href: "#projects", label: t('projects') },
    { value: "experience", href: "#experience", label: t('experience') },
    { value: "contact", href: "#contact", label: t('contact') },
  ];

  return (
    <motion.nav
      initial={{ x: -70 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-950 h-screen sticky top-0 left-0 z-20 flex flex-col items-center   overflow-hidden"
    >
      <span 
      className=" w-full shrink-0 text-xl font-black leading-[1] h-10 flex items-center justify-center my-4 cursor-pointer"
      onClick={scrollToTop}
      >
        {t('logo')}<span className="text-indigo-500">.</span>
      </span>
      <div className="flex flex-col items-center w-full overflow-y-auto scrollbar-hide">
        {links.map((link) => (
          <SideBarLink
            key={link.value}
            selected={selected}
            setSelected={setSelected}
            value={link.value}
            href={link.href}
          >
            {link.label}
          </SideBarLink>
        ))}
      </div>
    </motion.nav>
  );
};