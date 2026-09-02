import React from "react";
import { useTranslations } from "next-intl";
import { PROJECTS } from "./Projects";

/** One entry of the curated `PROJECTS` list. */
export type ProjectDef = (typeof PROJECTS)[number];

/**
 * The body of a project modal.
 *
 * Lifted out of `Projects.tsx`, where it was built for every project on every
 * render of the section and handed down through two components. Only the modal
 * host calls it now, and only for the project actually open — so the section no
 * longer pays for a dozen modal bodies nobody is looking at.
 */
export const useProjectModalContent = ({
  key,
  paras = 3,
  techList,
}: ProjectDef): JSX.Element => {
  const t = useTranslations("projects");

  const bulletList = (listKey: string) => (
    <ul className="list-disc list-inside ml-4">
      {t(`${key}.modalContent.${listKey}`)
        .split("|")
        .map((item, index) => (
          <li key={index}>{item.trim()}</li>
        ))}
    </ul>
  );

  return (
    <>
      <p className="mb-4">{t(`${key}.modalContent.para1`)}</p>
      <div className="mb-4">
        {t(`${key}.modalContent.keyFeatures`)}
        {bulletList("featuresList")}
      </div>
      <p className="mb-4">{t(`${key}.modalContent.para2`)}</p>
      {techList && (
        <div className="mb-4">
          {t(`${key}.modalContent.technologiesList`)}
          {bulletList("techList")}
        </div>
      )}
      {Array.from({ length: paras - 2 }, (_, i) => {
        const n = i + 3;
        const last = n === paras;
        return (
          <p key={n} className={last ? undefined : "mb-4"}>
            {t(`${key}.modalContent.para${n}`)}
          </p>
        );
      })}
    </>
  );
};
