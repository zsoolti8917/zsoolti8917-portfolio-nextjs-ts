import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Appears once the hero is behind you. Deliberately quiet: the old version ran
 * an infinite box-shadow pulse on an indigo disc, which competed with the one
 * thing on the page that is allowed to pulse (the "currently" status dot).
 *
 * It is rendered by _app.tsx, i.e. OUTSIDE both <TerminalBusProvider> and the
 * page's own message tree, which costs it two things WP4 should fix by moving
 * it inside <HomPage>:
 *
 * - it cannot read `paletteOpen`/`projectKey` to hide itself while a dialog is
 *   open (`useTerminalBus()` throws outside the provider). `z-20` keeps it
 *   under the nav (z-30) and under both overlays (z-50) in the meantime.
 * - it cannot carry a translated `aria-label`: `useTranslations()` here also
 *   runs on /404, which has no `getStaticProps` and therefore no messages, and
 *   every prerender then logs MISSING_MESSAGE.
 */
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300);

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      // Hidden means unreachable, not just invisible: the old version faded to
      // opacity 0 and stayed in the tab order over the whole hero.
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      className={`fixed bottom-4 right-4 z-20 rounded-full border border-hairline bg-surface-2 p-3 text-fg-2 transition duration-200 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent active:scale-95 ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <FiArrowUp size={20} />
    </button>
  );
};

export default ScrollToTopButton;
