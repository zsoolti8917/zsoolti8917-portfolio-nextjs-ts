import { useAnimation, useInView, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AiFillGithub, AiOutlineExport } from "react-icons/ai";
import { useTerminalBus } from "../bus/TerminalBus";
import Reveal from "../util/Reveal";

interface Props {
  /** Key into `PROJECTS` — what the modal host resolves to a project. */
  projectKey: string;
  description: string;
  projectLink?: string;
  imgSrc?: string;
  tech: string[];
  title: string;
  code?: string;
}

export const Project = ({
  projectKey,
  projectLink,
  description,
  imgSrc,
  title,
  code,
  tech,
}: Props) => {
  const [hovered, setHovered] = useState(false);

  // One modal for the whole page, opened by key: the card, the palette and the
  // terminal's `open <project>` all reach the same dialog through the bus.
  const { openProject } = useTerminalBus();

  const controls = useAnimation();

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);

  return (
    <>
      <motion.div
        ref={ref}
        variants={{
          hidden: { opacity: 0, y: 100 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={controls}
        transition={{ duration: 0.75 }}
      >
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => openProject(projectKey)}
          className="w-full aspect-video bg-zinc-700 cursor-pointer relative rounded-lg overflow-hidden"
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={`An image of the ${title} project.`}
              style={{
                width: hovered ? "90%" : "85%",
                rotate: hovered ? "2deg" : "0deg",
              }}
              className="w-[85%] absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 transition-all rounded"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-700 to-indigo-950">
              <span
                style={{
                  scale: hovered ? "1.1" : "1",
                  rotate: hovered ? "2deg" : "0deg",
                }}
                className="bg-indigo-500 text-white font-black text-4xl py-3 px-5 rounded transition-all"
              >
                {title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="mt-6">
          <Reveal width="w-full">
            <div className="flex items-center gap-2 w-full">
              <h4 className="font-bold text-lg shrink-0 max-w-[calc(100%_-_150px)]">
                {title}
              </h4>
              <div className="w-full h-[1px] bg-zinc-600" />

              {code && (
                <Link href={code} target="_blank" rel="nofollow">
                  <AiFillGithub className="text-xl text-zinc-300 hover:text-indigo-300 transition-colors" />
                </Link>
              )}

              {projectLink && (
                <Link href={projectLink} target="_blank" rel="nofollow">
                  <AiOutlineExport className="text-xl text-zinc-300 hover:text-indigo-300 transition-colors" />
                </Link>
              )}
            </div>
          </Reveal>
          <Reveal>
            <div className="flex flex-wrap gap-4 text-sm text-indigo-300 my-2">
              {tech.join(" - ")}
            </div>
          </Reveal>
          <Reveal>
            <p className="text-zinc-300 leading-relaxed">
              {description}{" "}
              <span
                className="inline-block text-sm text-indigo-300 cursor-pointer"
                onClick={() => openProject(projectKey)}
              >
                Learn more {">"}
              </span>
            </p>
          </Reveal>
        </div>
      </motion.div>
    </>
  );
};
