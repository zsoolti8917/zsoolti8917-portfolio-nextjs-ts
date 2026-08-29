import { useTranslations } from 'next-intl';
import { SectionHeader } from "../util/SectionHeader";
import { ExperienceItem, Job } from "./ExperienceItem";

export const Experience = () => {
  const t = useTranslations('experience');
  const jobs = t.raw('jobs') as Job[];

  return (
    <section className="section-wrapper" id="experience">
      <SectionHeader title={t('title')} dir="l" />
      {jobs.map((job) => (
        <ExperienceItem key={job.companyName} job={job} />
      ))}
    </section>
  );
};
