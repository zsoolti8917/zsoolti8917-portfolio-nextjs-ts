import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import {
  AiFillSafetyCertificate,
  AiFillSmile,
  AiOutlineGlobal,
} from "react-icons/ai";
import { AboutProse } from "../parts/AboutProse";
import { CertificationList } from "../parts/CertificationList";
import { FactsRow } from "../parts/FactsRow";
import { LanguageList } from "../parts/LanguageList";
import { PersonalityCard } from "../parts/PersonalityCard";
import { Tile } from "../parts/Tile";
import { useAboutData } from "../parts/useAboutData";

interface RowProps {
  items: string[];
  duration: string;
  reverse?: boolean;
}

const MarqueeRow = ({ items, duration, reverse = false }: RowProps) => (
  <div className="about-marquee-track">
    <div
      className={`about-marquee ${reverse ? "about-marquee-reverse" : ""}`}
      style={{ "--marquee-duration": duration } as CSSProperties}
    >
      {[false, true].map((isDuplicate) => (
        <div
          key={String(isDuplicate)}
          aria-hidden={isDuplicate}
          className={`flex shrink-0 gap-3 pr-3 ${
            isDuplicate ? "about-marquee-duplicate" : ""
          }`}
        >
          {items.map((item) => (
            <span
              key={item}
              className="whitespace-nowrap rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300"
            >
              {item}
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * V5 — Marquee stack band (bold).
 * Turns the size of the tool list into the point of the section. Motion is
 * disabled and the rows wrap statically under prefers-reduced-motion.
 */
export const AboutV5 = () => {
  const t = useTranslations("About");
  const { stack, aiLlm, triedOut, certifications, languages } = useAboutData();

  const rows: RowProps[] = [
    { items: [...stack[0].items, ...stack[1].items], duration: "55s" },
    {
      items: [...stack[2].items, ...stack[3].items],
      duration: "46s",
      reverse: true,
    },
    { items: [...aiLlm.chips, ...triedOut.chips], duration: "62s" },
  ];

  return (
    <div className="space-y-12">
      <AboutProse className="max-w-3xl" />

      <div className="border-y border-zinc-800 py-6">
        <FactsRow />
      </div>

      <div>
        <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-400">
          {t("stackLabel")}
        </h4>
        {/* Bleeds past the 1024px container so the rows run edge to edge. */}
        <div className="-mx-4 space-y-3 md:-mx-8">
          {rows.map((row) => (
            <MarqueeRow key={row.duration} {...row} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Tile label={t("certificationsLabel")} Icon={AiFillSafetyCertificate}>
          <CertificationList items={certifications} />
        </Tile>
        <Tile label={t("languagesLabel")} Icon={AiOutlineGlobal}>
          <LanguageList items={languages} />
        </Tile>
        <Tile label={t("personality.label")} Icon={AiFillSmile}>
          <PersonalityCard bare />
        </Tile>
      </div>
    </div>
  );
};
