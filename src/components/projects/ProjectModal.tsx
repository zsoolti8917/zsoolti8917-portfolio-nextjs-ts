import { useEffect, useId, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { AiFillGithub, AiOutlineExport } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import { useTranslations } from 'next-intl';
import { focusableStops, trapStop } from "../util/focusTrap";
import { useDialogKeys } from "../util/useDialogKeys";
import { useScrollLock } from "../util/useScrollLock";
import { ProjectCover } from "./ProjectCover";

export interface ProjectModalData {
  title: string;
  imgSrc?: string;
  /** Position in `PROJECTS`; drives the generated cover's hue. */
  index: number;
  code?: string;
  projectLink?: string;
  tech: string[];
  /** The modal body, built by `useProjectModalContent`. */
  content: JSX.Element;
}

interface Props {
  project: ProjectModalData;
  onClose: () => void;
}

/**
 * The project dialog. Rendered only while open, by `ProjectModalHost` — so
 * "open" is its mount, not a prop, and the scroll lock, the Escape handler and
 * the focus return are all just its lifetime.
 *
 * It no longer writes `body.overflowY` itself: the old effect set it back to
 * `"scroll"` on close, which left every page with a permanent scrollbar gutter
 * after the first modal. `useScrollLock` restores whatever was there.
 */
export const ProjectModal = ({ project, onClose }: Props) => {
  const { content, projectLink, imgSrc, index, title, code, tech } = project;
  const t = useTranslations('projectModal');
  const titleId = useId();
  const reduced = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useScrollLock(true);
  useDialogKeys({ open: true, onClose });

  // Two effects rather than one, as in `CommandPalette`: the button does not
  // exist until `mounted` has flipped and the portal has rendered. Opened from
  // the ⌘K palette, focus would otherwise be handed back to the nav behind an
  // `aria-modal` dialog — a keyboard user operating a page they cannot see.
  useEffect(() => {
    if (mounted) closeRef.current?.focus();
  }, [mounted]);

  /**
   * The trap. `aria-modal` tells a screen reader that nothing behind the dialog
   * is reachable; only this makes that true for Tab. The cycle covers the whole
   * dialog, not just the panel, so the close button stays in the tab order.
   */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const stops = focusableStops(dialogRef.current);
    const next = trapStop(stops.length, stops.indexOf(document.activeElement as HTMLElement), e.shiftKey);
    if (next >= 0) stops[next].focus();
  };

  const dialog = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex cursor-pointer justify-center overflow-y-scroll bg-canvas/70 px-4 py-12 backdrop-blur"
      onClick={onClose}
      onKeyDown={onKeyDown}
    >
      <button
        ref={closeRef}
        type="button"
        aria-label={t('close')}
        onClick={onClose}
        className="absolute right-4 top-4 rounded text-xl text-fg-2 transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:top-6"
      >
        <MdClose />
      </button>

      <motion.div
        // A 100px rise is exactly the vestibular trigger the preference is
        // there to switch off. Gated the way `util/Reveal` does it: no initial
        // offset at all, so the panel is simply there.
        initial={reduced ? false : { y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduced ? { duration: 0 } : undefined}
        onClick={(e) => e.stopPropagation()}
        className="h-fit w-full max-w-2xl cursor-auto overflow-hidden rounded-xl border border-hairline bg-surface-1"
      >
        {imgSrc ? (
          <img
            className="w-full border-b border-hairline"
            src={imgSrc}
            alt={`An image of the ${title} project.`}
          />
        ) : (
          // The same tile the card shows, flush with the panel edges.
          <ProjectCover
            title={title}
            tech={tech}
            index={index}
            className="rounded-none border-x-0 border-t-0"
          />
        )}
        <div className="p-8">
          <h4 id={titleId} className="mb-2 text-3xl font-bold tracking-[-0.02em] text-fg">{title}</h4>
          <div className="flex flex-wrap gap-2 font-mono mono-1 text-xs text-fg-3">
            {tech.join(" · ")}
          </div>

          <div className="my-6 space-y-4 text-sm leading-relaxed text-fg-2">
            {content}
          </div>

          {(code || projectLink) && (
            <div>
              <p className="mb-2 text-xl font-bold text-fg">
                {t('projectLinks')}<span className="text-accent">.</span>
              </p>
              <div className="flex items-center gap-4 text-sm">
                {code && (
                  <Link
                    target="_blank"
                    rel="nofollow"
                    className="flex items-center gap-1 text-fg-2 transition-colors hover:text-fg"
                    href={code}
                  >
                    <AiFillGithub /> {t('sourceCode')}
                  </Link>
                )}
                {projectLink && (
                  <Link
                    target="_blank"
                    rel="nofollow"
                    className="flex items-center gap-1 text-fg-2 transition-colors hover:text-fg"
                    href={projectLink}
                  >
                    <AiOutlineExport /> {t('liveProject')}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  const root = mounted ? document.getElementById("root") : null;
  return root ? ReactDOM.createPortal(dialog, root) : null;
};
