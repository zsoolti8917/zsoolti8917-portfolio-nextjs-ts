import { useTranslations } from "next-intl";
import { AiOutlineArrowRight } from "react-icons/ai";
import Reveal from "../../util/Reveal";
import { SocialLinks } from "../../nav/SocialLinks";

interface Props {
  /** Constrain the measure. Prose is unreadable much past ~75ch. */
  className?: string;
  withLinks?: boolean;
}

export const AboutProse = ({ className = "", withLinks = true }: Props) => {
  const t = useTranslations("About");

  return (
    <div className={`space-y-4 ${className}`}>
      <Reveal width="100%">
        <p className="leading-relaxed text-fg-2">
          {/* `firstLetter` is the intro's first character, split out back when
              the paragraph opened with an indigo drop-cap box. The box is
              gone; the key stays, because scripts/build-llm-assets.mjs and
              hero/terminal/useTerminalData.ts both reassemble the sentence
              from the two halves. Rendered as plain text, no separator. */}
          {t("firstLetter")}
          {t("intro")}
        </p>
      </Reveal>
      <Reveal width="100%">
        <p className="leading-relaxed text-fg-2">{t("currentWork")}</p>
      </Reveal>
      <Reveal width="100%">
        <p className="leading-relaxed text-fg-2">
          {t("quote", { author: "Seneca" })}
          {t("connect")}
        </p>
      </Reveal>
      {withLinks && (
        <Reveal width="100%">
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-3 text-sm text-fg-3">
              <span>{t("myLinks")}</span>
              <AiOutlineArrowRight />
            </div>
            <SocialLinks />
          </div>
        </Reveal>
      )}
    </div>
  );
};
