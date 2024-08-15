import React from "react";
import { useTranslations } from 'next-intl';
import { SectionHeader } from "../util/SectionHeader";
import { Project } from "./Project";

export const Projects = () => {
  const t = useTranslations('projects');

  const projects = [
    {
      title: t('infoMapSK.title'),
      imgSrc: "/project-imgs/Infomap.png",
      code: "https://github.com/zsoolti8917/InfoMapSK-frontend",
      projectLink: "https://infomap.sk",
      tech: t('infoMapSK.tech').split(','),
      description: t('infoMapSK.description'),
      modalContent: (
        <>
          <p className="mb-4">{t('infoMapSK.modalContent.para1')}</p>
          <p className="mb-4">
            {t('infoMapSK.modalContent.keyFeatures')}
            <ul className="list-disc list-inside ml-4">
              {t('infoMapSK.modalContent.featuresList').split('|').map((feature, index) => (
                <li key={index}>{feature.trim()}</li>
              ))}
            </ul>
          </p>
          <p className="mb-4">{t('infoMapSK.modalContent.para2')}</p>
          <p className="mb-4">
            {t('infoMapSK.modalContent.technologiesList')}
            <ul className="list-disc list-inside ml-4">
              {t('infoMapSK.modalContent.techList').split('|').map((tech, index) => (
                <li key={index}>{tech.trim()}</li>
              ))}
            </ul>
          </p>
          <p>{t('infoMapSK.modalContent.para3')}</p>
        </>
      ),
    },
    {
      title: t('gardenBros.title'),
      imgSrc: "project-imgs/GardenBros.png",
      code: "https://github.com/zsoolti8917/garden-bros-frontend",
      projectLink: "https://www.gardenbros.sk",
      tech: t('gardenBros.tech').split(','),
      description: t('gardenBros.description'),
      modalContent: (
        <>
          <p className="mb-4">{t('gardenBros.modalContent.para1')}</p>
          <p className="mb-4">
            {t('gardenBros.modalContent.keyFeatures')}
            <ul className="list-disc list-inside ml-4">
              {t('gardenBros.modalContent.featuresList').split('|').map((feature, index) => (
                <li key={index}>{feature.trim()}</li>
              ))}
            </ul>
          </p>
          <p className="mb-4">{t('gardenBros.modalContent.para2')}</p>
          <p className="mb-4">{t('gardenBros.modalContent.para3')}</p>
          <p className="mb-4">{t('gardenBros.modalContent.para4')}</p>
          <p>{t('gardenBros.modalContent.para5')}</p>
        </>
      ),
    },
    {
      title: t('portfolio.title'),
      imgSrc: "/project-imgs/Portfolio.png",
      code: "https://github.com/zsoolti8917/Portfolio",
      projectLink: "https://zsoltvarjuold.netlify.app/",
      tech: t('portfolio.tech').split(','),
      description: t('portfolio.description'),
      modalContent: (
        <>
          <p className="mb-4">{t('portfolio.modalContent.para1')}</p>
          <p className="mb-4">
            {t('portfolio.modalContent.keyFeatures')}
            <ul className="list-disc list-inside ml-4">
              {t('portfolio.modalContent.featuresList').split('|').map((feature, index) => (
                <li key={index}>{feature.trim()}</li>
              ))}
            </ul>
          </p>
          <p className="mb-4">{t('portfolio.modalContent.para2')}</p>
          <p className="mb-4">{t('portfolio.modalContent.para3')}</p>
          <p>{t('portfolio.modalContent.para4')}</p>
        </>
      ),
    },
    {
      title: t('scoot.title'),
      imgSrc: "project-imgs/Scoot.png",
      code: "https://github.com/zsoolti8917/scoot-multi-page-website",
      projectLink: "https://scoot-multi-page-website-six.vercel.app/",
      tech: t('scoot.tech').split(','),
      description: t('scoot.description'),
      modalContent: (
        <>
          <p className="mb-4">{t('scoot.modalContent.para1')}</p>
          <p className="mb-4">
            {t('scoot.modalContent.keyFeatures')}
            <ul className="list-disc list-inside ml-4">
              {t('scoot.modalContent.featuresList').split('|').map((feature, index) => (
                <li key={index}>{feature.trim()}</li>
              ))}
            </ul>
          </p>
          <p className="mb-4">{t('scoot.modalContent.para2')}</p>
          <p className="mb-4">{t('scoot.modalContent.para3')}</p>
          <p>{t('scoot.modalContent.para4')}</p>
        </>
      ),
    },
    {
      title: t('alza.title'),
      imgSrc: "project-imgs/Main.png",
      code: "https://github.com/zsoolti8917/Alza",
      projectLink: "https://github.com/zsoolti8917/Alza",
      tech: t('alza.tech').split(','),
      description: t('alza.description'),
      modalContent: (
        <>
          <p className="mb-4">{t('alza.modalContent.para1')}</p>
          <p className="mb-4">
            {t('alza.modalContent.keyFeatures')}
            <ul className="list-disc list-inside ml-4">
              {t('alza.modalContent.featuresList').split('|').map((feature, index) => (
                <li key={index}>{feature.trim()}</li>
              ))}
            </ul>
          </p>
          <p className="mb-4">{t('alza.modalContent.para2')}</p>
          <p className="mb-4">{t('alza.modalContent.para3')}</p>
          <p className="mb-4">{t('alza.modalContent.para4')}</p>
          <p>{t('alza.modalContent.para5')}</p>
        </>
      ),
    },
    {
      title: t('github.title'),
      imgSrc: "project-imgs/Github.png",
      code: "https://github.com/zsoolti8917/github-user-search-app",
      projectLink: "https://tubular-entremet-9586f7.netlify.app/",
      tech: t('github.tech').split(','),
      description: t('github.description'),
      modalContent: (
        <>
          <p className="mb-4">{t('github.modalContent.para1')}</p>
          <p className="mb-4">
            {t('github.modalContent.keyFeatures')}
            <ul className="list-disc list-inside ml-4">
              {t('github.modalContent.featuresList').split('|').map((feature, index) => (
                <li key={index}>{feature.trim()}</li>
              ))}
            </ul>
          </p>
          <p className="mb-4">{t('github.modalContent.para2')}</p>
          <p className="mb-4">{t('github.modalContent.para3')}</p>
          <p>{t('github.modalContent.para4')}</p>
        </>
      ),
    },
  ];

  return (
    <section className="section-wrapper" id="projects">
      <SectionHeader title={t('sectionTitle')} dir="r" />

      <div className="grid gap-12 grid-cols-1 md:grid-cols-2">
        {projects.map((project) => {
          return <Project key={project.title} {...project} />;
        })}
      </div>
    </section>
  );
};