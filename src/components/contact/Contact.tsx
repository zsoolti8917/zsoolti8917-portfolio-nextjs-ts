import { useTranslations } from 'next-intl';
import { AiFillMail } from "react-icons/ai";
import Link from "next/link";
import Reveal from "../util/Reveal";

export const Contact = () => {
  const t = useTranslations('Contact');

  return (
    <section className="section-wrapper" id="contact">
      <div className="max-w-xl mx-auto bg-zinc-800 px-8 py-12 rounded-xl">
        <Reveal width="w-full">
          <h4 className="text-4xl md:text-5xl text-center font-black leading-tight pb-2">
            {t('title')}<span className="text-indigo-500">.</span>
          </h4>
        </Reveal>
        <Reveal width="w-full">
          <p className="text-center my-8 text-zinc-300 leading-relaxed">
            {t('message')}
            <Link
              href={t('linkedinUrl')}
              target="_blank"
              className="text-indigo-300 hover:underline"
            >
              {t('linkedin')}
            </Link>{" "}
            {t('or')}{" "}
            <Link
              href={t('githubUrl')}
              target="_blank"
              className="text-indigo-300 hover:underline"
            >
              {t('github')}
            </Link>{" "}
            {t('moreYourSpeed')}
          </p>
        </Reveal>
        <Reveal width="w-full">
          <Link href={`mailto:${t('email')}`}>
            <div className="flex items-center justify-center gap-2 w-fit text-lg md:text-2xl whitespace-normal mx-auto hover:text-indigo-300 transition-colors">
              <AiFillMail />
              <span>{t('email')}</span>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
};