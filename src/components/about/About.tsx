import { useTranslations } from 'next-intl';
import { AiOutlineArrowRight } from "react-icons/ai";
import { SectionHeader } from "../util/SectionHeader";
import Reveal from "../util/Reveal";
import { MyLinks } from "../nav/Header";
import { Stats } from "./Stats";

export const About = () => {
  const t = useTranslations('About');

  return (
    <section id="about" className="section-wrapper">
      <SectionHeader title={t('title')} dir="l" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4">
          <Reveal>
            <p className="leading-relaxed text-zinc-300">
              <span className="bg-indigo-500 text-white py-2 px-3 rounded font-bold mr-1 float-left text-2xl">
                {t('firstLetter')}
              </span>
              {t('intro')}
            </p>
          </Reveal>
          <Reveal>
            <p className="leading-relaxed text-zinc-300">
              {t('currentWork')}
            </p>
          </Reveal>
          <Reveal>
            <p className="leading-relaxed text-zinc-300">
              {t('jobSearch')}
            </p>
          </Reveal>
          <Reveal>
            <p className="leading-relaxed text-zinc-300">
              {t('quote', { author: 'Seneca' })} 
              {t('connect')}
            </p>
          </Reveal>
          <Reveal>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm text-indigo-300">
                <span>{t('myLinks')}</span>
                <AiOutlineArrowRight />
              </div>
              <MyLinks />
            </div>
          </Reveal>
        </div>
        <Stats />
      </div>
    </section>
  );
};