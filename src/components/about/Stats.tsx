import { useTranslations } from 'next-intl';
import { Chip } from "../util/Chip";
import Reveal from "../util/Reveal";
import { AiFillCode, AiFillSmile } from "react-icons/ai";

export const Stats = () => {
  const t = useTranslations('Stats');

  const renderChips = (key: string) => {
    const chipsCount = t.raw(`${key}.chips.length`);
    return Array.from({ length: chipsCount }, (_, i) => (
      <Chip key={i}>{t(`${key}.chips.${i}`)}</Chip>
    ));
  };

  return (
    <div className="relative">
      <Reveal>
        <div>
          <h4 className="flex items-center mb-6">
            <AiFillCode className="text-indigo-500 text-2xl" />
            <span className="font-bold ml-2">{t('useInProjects.title')}</span>
          </h4>
          <div className="flex flex-wrap gap-2 mb-12">
            {renderChips('useInProjects')}
          </div>
        </div>
      </Reveal>
      <Reveal>
        <div>
          <h4 className="flex items-center mb-6">
            <AiFillSmile className="text-indigo-500 text-2xl" />
            <span className="font-bold ml-2">{t('triedOut.title')}</span>
          </h4>
          <div className="flex flex-wrap gap-2 mb-12">
            {renderChips('triedOut')}
          </div>
        </div>
      </Reveal>
      <Reveal>
        <div>
          <h4 className="flex items-center mb-6">
            <AiFillSmile className="text-indigo-500 text-2xl" />
            <span className="font-bold ml-2">{t('myLanguages.title')}</span>
          </h4>
          <div className="flex flex-wrap gap-2 mb-12">
            {renderChips('myLanguages')}
          </div>
        </div>
      </Reveal>
    </div>
  );
};