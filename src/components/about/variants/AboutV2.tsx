import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AiFillSafetyCertificate,
  AiFillSmile,
  AiOutlineGlobal,
} from "react-icons/ai";
import { Chip } from "../../util/Chip";
import { AboutProse } from "../parts/AboutProse";
import { CertificationList } from "../parts/CertificationList";
import { CurrentlyCard } from "../parts/CurrentlyCard";
import { FactsRow } from "../parts/FactsRow";
import { LanguageList } from "../parts/LanguageList";
import { PersonalityCard } from "../parts/PersonalityCard";
import { Tile } from "../parts/Tile";
import { useAboutData } from "../parts/useAboutData";

/**
 * V2 — Prose + full-width toolbox band (conservative).
 * The chips get the page's full 1024px instead of a 300px rail, so the long
 * lists take ~3 rows instead of ~8 and the columns end at the same place.
 */
export const AboutV2 = () => {
  const t = useTranslations("About");
  const { stack, aiLlm, triedOut, certifications, languages } = useAboutData();
  const [tab, setTab] = useState(0);

  const tabs = [t("stackLabel"), aiLlm.title, triedOut.title];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
        <AboutProse className="max-w-2xl" />
        <CurrentlyCard />
      </div>

      <div className="border-y border-zinc-800 py-6">
        <FactsRow />
      </div>

      <div>
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(i)}
              aria-pressed={i === tab}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                i === tab
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          {tab === 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stack.map((group) => (
                <div key={group.label}>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                    {group.label}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Chip key={item}>{item}</Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 1 && (
            <div className="flex flex-wrap gap-2">
              {aiLlm.chips.map((item) => (
                <Chip key={item}>{item}</Chip>
              ))}
            </div>
          )}
          {tab === 2 && (
            <div className="flex flex-wrap gap-2">
              {triedOut.chips.map((item) => (
                <Chip key={item}>{item}</Chip>
              ))}
            </div>
          )}
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
