import { useEffect, useId, useState } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import { AiFillGithub, AiOutlineExport } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import { useTranslations } from 'next-intl';
import { useDialogKeys } from "../util/useDialogKeys";
import { useOverlay } from "../util/overlayState";
import { useScrollLock } from "../util/useScrollLock";

export interface ProjectModalData {
  title: string;
  imgSrc?: string;
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
  const { content, projectLink, imgSrc, title, code, tech } = project;
  const t = useTranslations('projectModal');
  const titleId = useId();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useScrollLock(true);
  useDialogKeys({ open: true, onClose });
  useOverlay(true);

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 px-4 py-12 bg-zinc-950/50 backdrop-blur overflow-y-scroll flex justify-center cursor-pointer"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label={t('close')}
        onClick={onClose}
        className="absolute top-4 md:top-6 text-xl right-4"
      >
        <MdClose />
      </button>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl h-fit rounded-lg overflow-hidden bg-zinc-900 shadow-lg cursor-auto"
      >
        {imgSrc ? (
          <img
            className="w-full"
            src={imgSrc}
            alt={`An image of the ${title} project.`}
          />
        ) : (
          <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-700 to-indigo-950">
            <span className="bg-indigo-500 text-white font-black text-3xl py-2 px-4 rounded">
              {title.charAt(0)}
            </span>
          </div>
        )}
        <div className="p-8">
          <h4 id={titleId} className="text-3xl font-bold mb-2">{title}</h4>
          <div className="flex flex-wrap gap-2 text-sm text-indigo-300">
            {tech.join(" - ")}
          </div>

          <div className="space-y-4 my-6 leading-relaxed text-sm text-zinc-300">
            {content}
          </div>

          {(code || projectLink) && (
            <div>
              <p className="font-bold mb-2 text-xl">
                {t('projectLinks')}<span className="text-indigo-500">.</span>
              </p>
              <div className="flex items-center gap-4 text-sm">
                {code && (
                  <Link
                    target="_blank"
                    rel="nofollow"
                    className="text-zinc-300 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    href={code}
                  >
                    <AiFillGithub /> {t('sourceCode')}
                  </Link>
                )}
                {projectLink && (
                  <Link
                    target="_blank"
                    rel="nofollow"
                    className="text-zinc-300 hover:text-indigo-300 transition-colors flex items-center gap-1"
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
