import Link from "next/link";
import React from "react";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { useTranslations } from "next-intl";

/**
 * The LinkedIn/GitHub pair. Lives in `nav/` because it used to be part of the
 * header; it is now only rendered inside the About prose, and the aria keys
 * stay under `header.*` so no translation is orphaned.
 */
export const SocialLinks: React.FC = () => {
  const t = useTranslations("header");

  return (
    <div className="flex items-center text-lg gap-4">
      <Link
        className="text-fg-2 hover:text-accent-hover transition-colors"
        href="https://www.linkedin.com/in/zsoltvarju/"
        target="_blank"
        rel="me noreferrer"
        aria-label={t("linkedinAria")}
      >
        <SiLinkedin />
      </Link>
      <Link
        className="text-fg-2 hover:text-accent-hover transition-colors"
        href="https://github.com/zsoolti8917"
        target="_blank"
        rel="me noreferrer"
        aria-label={t("githubAria")}
      >
        <SiGithub />
      </Link>
    </div>
  );
};
