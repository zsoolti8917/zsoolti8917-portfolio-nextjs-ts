import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import anime from 'animejs';
import Reveal from "../util/Reveal";
import DotGrid from "./DotGrid";
import { OutlineButton } from "../buttons/OutlineButton";

const Hero = () => {
  const t = useTranslations('hero');
  const pulsateRef = useRef(null);

  useEffect(() => {
    anime({
      targets: pulsateRef.current,
      scale: [1, 1.1],
      opacity: [0.5, 1],
      duration: 1000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutQuad'
    });
  }, []);

  return (
    <section className="text-slate-100 overflow-hidden py-24 md:py-32">
      <div className="relative">
        <div className="pointer-events-none relative z-10">
          <Reveal>
            <h1 className="pointer-events-auto text-4xl sm:text-6xl font-black text-zinc-100 md:text-8xl leading-tight sm:leading-tight md:leading-tight pb-2">
              {t('greeting')}<span className="text-indigo-500">.</span>
            </h1>
          </Reveal>
          <Reveal>
            <h2 className="pointer-events-auto my-2 text-xl sm:text-2xl text-zinc-300 md:my-4 md:text-4xl">
              {t('title')}{" "}
              <span className="font-semibold text-indigo-500">
                {t('profession')}
              </span>
            </h2>
          </Reveal>
          <Reveal>
            <p className="pointer-events-auto leading-relaxed md:leading-relaxed max-w-xl text-sm text-zinc-300 md:text-base">
              {t('description')}
            </p>
          </Reveal>
          <Reveal>
            <OutlineButton
              onClick={() => {
                document.getElementById("contact")?.scrollIntoView();
              }}
              className="pointer-events-auto before:bg-indigo-700 hover:text-white hover:border-indigo-700 mt-4 bg-indigo-500 text-zinc-100 border-indigo-500 md:mt-6"
            >
              {t('buttonText')}
            </OutlineButton>
          </Reveal>
        </div>
        <DotGrid />
        
        <div className="absolute -top-[90px] left-[260px] hidden lg:flex items-center transform rotate-[30deg] z-20">
          <span ref={pulsateRef} className="mr-2 text-sm font-bold text-white whitespace-nowrap">{t('clickMe')}</span>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;