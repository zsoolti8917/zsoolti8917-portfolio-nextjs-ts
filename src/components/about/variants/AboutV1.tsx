import { useTranslations } from "next-intl";
import { AboutProse } from "../parts/AboutProse";
import { CertificationList } from "../parts/CertificationList";
import { CurrentlyCard } from "../parts/CurrentlyCard";
import { FactsRow } from "../parts/FactsRow";
import { LanguageList } from "../parts/LanguageList";
import { SkillGroup } from "../parts/SkillGroup";
import { useAboutData } from "../parts/useAboutData";

/**
 * V1 — Balanced rail (conservative).
 * Keeps the original two-column shape and fixes the height imbalance by
 * sticking the shorter prose column while the taller rail scrolls past.
 */
export const AboutV1 = () => {
  const t = useTranslations("About");
  const { stack, aiLlm, triedOut, certifications, languages } = useAboutData();

  return (
    // items-start is load-bearing: grid children default to `stretch`, which
    // makes the sticky child as tall as the row and stops it sticking at all.
    <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-8 md:sticky md:top-24 md:self-start">
        <AboutProse />
        <div className="border-t border-zinc-800 pt-6">
          <FactsRow />
        </div>
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t("languagesLabel")}
          </h4>
          <LanguageList items={languages} layout="inline" />
        </div>
      </div>

      <div className="space-y-8">
        <CurrentlyCard />
        {stack.map((group) => (
          <SkillGroup
            key={group.label}
            label={group.label}
            items={group.items}
            limit={8}
          />
        ))}
        <SkillGroup label={aiLlm.title} items={aiLlm.chips} limit={8} />
        <SkillGroup label={triedOut.title} items={triedOut.chips} />
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t("certificationsLabel")}
          </h4>
          <CertificationList items={certifications} />
        </div>
      </div>
    </div>
  );
};
