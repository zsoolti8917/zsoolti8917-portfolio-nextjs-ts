import { useTranslations } from "next-intl";
import { AiOutlineArrowRight } from "react-icons/ai";
import Reveal from "../../util/Reveal";
import { MyLinks } from "../../nav/Header";

interface Props {
  /** Constrain the measure. Prose is unreadable much past ~75ch. */
  className?: string;
  withLinks?: boolean;
  withDropCap?: boolean;
}

export const AboutProse = ({
  className = "",
  withLinks = true,
  withDropCap = true,
}: Props) => {
  const t = useTranslations("About");

  return (
    <div className={`space-y-4 ${className}`}>
      <Reveal width="w-full">
        <p className="leading-relaxed text-zinc-300">
          {withDropCap && (
            <span className="float-left mr-1 rounded bg-indigo-500 px-3 py-2 text-2xl font-bold text-white">
              {t("firstLetter")}
            </span>
          )}
          {t("intro")}
        </p>
      </Reveal>
      <Reveal width="w-full">
        <p className="leading-relaxed text-zinc-300">{t("currentWork")}</p>
      </Reveal>
      <Reveal width="w-full">
        <p className="leading-relaxed text-zinc-300">
          {t("quote", { author: "Seneca" })}
          {t("connect")}
        </p>
      </Reveal>
      {withLinks && (
        <Reveal width="w-full">
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-4 text-sm text-indigo-300">
              <span>{t("myLinks")}</span>
              <AiOutlineArrowRight />
            </div>
            <MyLinks />
          </div>
        </Reveal>
      )}
    </div>
  );
};
