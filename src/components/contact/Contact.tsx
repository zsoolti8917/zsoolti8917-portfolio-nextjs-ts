import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AiFillMail } from "react-icons/ai";
import Link from "next/link";
import Reveal from "../util/Reveal";
import { SectionHeader } from "../util/SectionHeader";

export const Contact = () => {
  const t = useTranslations('Contact');
  const nav = useTranslations('nav');
  const email = t('email');

  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Insecure origin, or the permission was refused. Say nothing and leave
      // the label alone — the mailto: link next to it still works.
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [email]);

  return (
    <section className="section-wrapper scroll-mt-16" id="contact">
      <SectionHeader index="04" kicker={nav('contact').toLowerCase()} title={t('title')} />

      <div className="mx-auto max-w-xl rounded-xl border border-hairline bg-surface-1 px-8 py-12">
        <Reveal width="100%">
          <p className="text-center leading-relaxed text-fg-2">
            {t('message')}
            <Link
              href={t('linkedinUrl')}
              target="_blank"
              rel="me noreferrer"
              className="text-accent-hover underline-offset-4 hover:underline"
            >
              {t('linkedin')}
            </Link>{" "}
            {t('or')}{" "}
            <Link
              href={t('githubUrl')}
              target="_blank"
              rel="me noreferrer"
              className="text-accent-hover underline-offset-4 hover:underline"
            >
              {t('github')}
            </Link>{" "}
            {t('moreYourSpeed')}
          </p>
        </Reveal>

        <Reveal width="100%">
          <div className="mt-8 flex items-center justify-center gap-2">
            {/* The address is a button first: copying it is what a recruiter
                on a desktop actually wants. `aria-label` is the stable name,
                so the announcement of the swap comes from the live region
                inside and not from the button renaming itself. */}
            <button
              type="button"
              onClick={copyEmail}
              aria-label={t('copy')}
              className="rounded-md border border-hairline bg-surface-2 px-3 py-1.5 font-mono mono-1 text-sm text-fg transition-colors hover:border-accent/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span aria-live="polite">{copied ? t('copied') : email}</span>
            </button>
            <Link
              href={`mailto:${email}`}
              aria-label={t('sendEmail')}
              className="rounded-md border border-hairline bg-surface-2 p-2 text-fg-2 transition-colors hover:border-accent/60 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <AiFillMail />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
