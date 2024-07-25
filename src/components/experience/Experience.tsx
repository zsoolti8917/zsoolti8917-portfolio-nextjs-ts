import { useTranslations } from 'next-intl';
import { SectionHeader } from "../util/SectionHeader";
import { ExperienceItem } from "./ExperienceItem";

export const Experience = () => {
  const t = useTranslations('experience');

  return (
    <section className="section-wrapper" id="experience">
      <SectionHeader title={t('title')} dir="l" />
      <ExperienceItem />
    </section>
  );
};