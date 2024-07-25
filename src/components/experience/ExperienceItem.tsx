import { useTranslations } from 'next-intl';
import { Chip } from "../util/Chip";
import Reveal from "../util/Reveal";

export const ExperienceItem = () => {
  const t = useTranslations('experience');

  const responsibilities = Array.from({ length: 6 }, (_, i) => ({
    title: t(`responsibilities.${i}.title`),
    description: t(`responsibilities.${i}.description`),
  }));

  const skills = Array.from({ length: 7 }, (_, i) => t(`skills.${i}`));

  return (
    <div className="mb-6 border-b pb-6 border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <Reveal>
          <span className="font-bold text-xl">{t('companyName')}</span>
        </Reveal>
        <Reveal>
          <span>{t('dates')}</span>
        </Reveal>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Reveal>
          <span className="text-indigo-300 font-bold">{t('jobTitle')}</span>
        </Reveal>
        <Reveal>
          <span>{t('location')}</span>
        </Reveal>
      </div>

      <Reveal>
        <div className="mb-6 text-zinc-300 leading-relaxed">
          {responsibilities.map((item, index) => (
            <div key={index} className="mb-4 flex items-start">
              <span className="mr-2 text-gray-500">&#8226;</span>
              <div>
                <span className="font-bold">{item.title}</span>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Chip key={index}>{skill}</Chip>
          ))}
        </div>
      </Reveal>
    </div>
  );
};