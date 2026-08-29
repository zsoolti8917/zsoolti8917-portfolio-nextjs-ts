import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { useOverlayOpen } from './util/overlayState';

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
 * It is rendered by _app.tsx, i.e. OUTSIDE <TerminalBusProvider> and the
 * page's own message tree, so it reads the overlay store instead of the bus
 * to hide itself while the palette or a project modal is open, and it cannot
 * carry a translated `aria-label` (`useTranslations()` here would also run
 * on /404, which has no messages and would log MISSING_MESSAGE per prerender).
 */
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const overlayOpen = useOverlayOpen();
  const shown = isVisible && !overlayOpen;

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
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      aria-label="Scroll to top"
      className={`fixed bottom-4 right-4 z-20 rounded-full border border-hairline bg-surface-2 p-3 text-fg-2 transition duration-200 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent active:scale-95 ${
        shown ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <FiArrowUp size={20} />
    </button>
  );
};

export default ScrollToTopButton;
