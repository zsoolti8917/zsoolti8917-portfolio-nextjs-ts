import { useTranslations } from 'next-intl';
import { SectionHeader } from "../util/SectionHeader";
import { ExperienceItem, Job } from "./ExperienceItem";

export const Experience = () => {
  const t = useTranslations('experience');
  const nav = useTranslations('nav');
  const jobs = t.raw('jobs') as Job[];

  return (
    <section className="section-wrapper scroll-mt-16" id="experience">
      <SectionHeader index="03" kicker={nav('experience').toLowerCase()} title={t('title')} />
      {jobs.map((job) => (
        <ExperienceItem key={job.companyName} job={job} />
      ))}
    </section>
  );
};
