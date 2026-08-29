import { useEffect } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import { AiFillGithub, AiOutlineExport } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import { useTranslations } from 'next-intl';
import { ProjectCover } from "./ProjectCover";

interface Props {
  isOpen: boolean;
  setIsOpen: Function;
  title: string;
  imgSrc?: string;
  code?: string;
  projectLink?: string;
  tech: string[];
  modalContent: JSX.Element;
}

export const ProjectModal = ({
  modalContent,
  projectLink,
  setIsOpen,
  imgSrc,
  isOpen,
  title,
  code,
  tech,
}: Props) => {
  const t = useTranslations('projectModal');

  useEffect(() => {
    const body = document.querySelector("body");

    if (isOpen) {
      body!.style.overflowY = "hidden";
    } else {
      body!.style.overflowY = "scroll";
    }
  }, [isOpen]);

  const content = (
    <div
      className="fixed inset-0 z-50 flex cursor-pointer justify-center overflow-y-scroll bg-canvas/70 px-4 py-12 backdrop-blur"
      onClick={() => setIsOpen(false)}
    >
      <button className="absolute right-4 top-4 text-xl text-fg-2 transition-colors hover:text-fg md:top-6">
        <MdClose />
      </button>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
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
            className="rounded-none border-x-0 border-t-0"
          />
        )}
        <div className="p-8">
          <h4 className="mb-2 text-3xl font-bold tracking-[-0.02em] text-fg">{title}</h4>
          <div className="flex flex-wrap gap-2 font-mono mono-1 text-xs text-fg-3">
            {tech.join(" - ")}
          </div>

          <div className="my-6 space-y-4 text-sm leading-relaxed text-fg-2">
            {modalContent}
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

  if (!isOpen) return <></>;

  // @ts-ignore
  return ReactDOM.createPortal(content, document.getElementById("root"));
};