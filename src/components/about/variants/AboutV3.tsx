import { useTranslations } from "next-intl";
import {
  AiFillCode,
  AiFillRobot,
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
 * V3 — Bento grid (bold).
 * Short prose plus many small discrete facts is exactly the content profile
 * the bento pattern is for: each fact gets its own tile instead of being
 * queued behind the others in one tall rail.
 */
export const AboutV3 = () => {
  const t = useTranslations("About");
  const { stack, aiLlm, triedOut, certifications, languages } = useAboutData();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
      <Tile className="md:col-span-4 md:row-span-2">
        <AboutProse />
      </Tile>

      <CurrentlyCard className="md:col-span-2" />

      <Tile className="md:col-span-2">
        <FactsRow layout="column" />
      </Tile>

      <Tile className="md:col-span-6" label={t("stackLabel")} Icon={AiFillCode}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map((group) => (
            <div key={group.label}>
              <h5 className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
                {group.label}
              </h5>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Tile>

      <Tile className="md:col-span-3" label={aiLlm.title} Icon={AiFillRobot}>
        <div className="flex flex-wrap gap-2">
          {aiLlm.chips.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </div>
      </Tile>

      <Tile
        className="md:col-span-3"
        label={t("certificationsLabel")}
        Icon={AiFillSafetyCertificate}
      >
        <CertificationList items={certifications} />
      </Tile>

      <Tile
        className="md:col-span-2"
        label={t("languagesLabel")}
        Icon={AiOutlineGlobal}
      >
        <LanguageList items={languages} />
      </Tile>

      <Tile className="md:col-span-2" label={triedOut.title} Icon={AiFillSmile}>
        <div className="flex flex-wrap gap-2">
          {triedOut.chips.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </div>
      </Tile>

      <Tile className="md:col-span-2" label={t("personality.label")}>
        <PersonalityCard bare />
      </Tile>
    </div>
  );
};
