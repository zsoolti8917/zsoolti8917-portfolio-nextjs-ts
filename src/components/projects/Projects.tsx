import React from "react";
import { useTranslations } from 'next-intl';
import { SectionHeader } from "../util/SectionHeader";
import { Project } from "./Project";

interface ProjectDef {
  /** translation key under `projects` */
  key: string;
  imgSrc?: string;
  code?: string;
  projectLink?: string;
  /** number of `paraN` keys this project has (default 3) */
  paras?: number;
  /** infoMapSK is the only project with a second bulleted list */
  techList?: boolean;
}

export const PROJECTS: ProjectDef[] = [
  { key: "ragSystem" },
  {
    key: "coffece",
    imgSrc: "/project-imgs/Coffece.png",
    projectLink: "https://coffece.sk",
  },
  {
    key: "idtPlusStav",
    imgSrc: "/project-imgs/IdtPlusStav.png",
    projectLink: "https://idtplusstav.sk",
  },
  { key: "b2bPortal" },
  { key: "lemma" },
  { key: "homelab" },
  { key: "photoCropper" },
  { key: "municipalMigrations" },
  {
    // Public site is offline; the source stays available.
    key: "infoMapSK",
    imgSrc: "/project-imgs/Infomap.png",
    code: "https://github.com/zsoolti8917/InfoMapSK-frontend",
    techList: true,
  },
  {
    // gardenbros.sk currently errors, so no live link.
    key: "gardenBros",
    imgSrc: "/project-imgs/GardenBros.png",
    code: "https://github.com/zsoolti8917/garden-bros-frontend",
    paras: 5,
  },
  {
    key: "alza",
    imgSrc: "/project-imgs/Main.png",
    code: "https://github.com/zsoolti8917/Alza",
    projectLink: "https://github.com/zsoolti8917/Alza",
    paras: 5,
  },
];

export const Projects = () => {
  const t = useTranslations('projects');
  const nav = useTranslations('nav');

  return (
    <section className="section-wrapper scroll-mt-16" id="projects">
      <SectionHeader index="02" kicker={nav('projects').toLowerCase()} title={t('sectionTitle')} />

      <div className="grid gap-12 grid-cols-1 md:grid-cols-2">
        {PROJECTS.map((def) => (
          <Project
            key={def.key}
            title={t(`${def.key}.title`)}
            imgSrc={def.imgSrc}
            code={def.code}
            projectLink={def.projectLink}
            tech={t(`${def.key}.tech`).split(',')}
            description={t(`${def.key}.description`)}
            projectKey={def.key}
          />
        ))}
      </div>
    </section>
  );
};
