import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AiFillGithub, AiOutlineExport } from "react-icons/ai";
import { useTerminalBus } from "../bus/TerminalBus";
import { ProjectCover } from "./ProjectCover";
import Reveal from "../util/Reveal";

interface Props {
  /** Key into `PROJECTS` — what the modal host resolves to a project. */
  projectKey: string;
  /** Position in the curated list; drives the generated cover's hue. */
  index: number;
  description: string;
  projectLink?: string;
  imgSrc?: string;
  tech: string[];
  title: string;
  code?: string;
  /** Follow the live link — it is one of my own properties. */
  ownSite?: boolean;
}

export const Project = ({
  projectKey,
  index,
  projectLink,
  description,
  imgSrc,
  title,
  code,
  tech,
  ownSite,
}: Props) => {
  const t = useTranslations("projects");

  const [hovered, setHovered] = useState(false);

  // One modal for the whole page, opened by key: the card, the palette and the
  // terminal's `open <project>` all reach the same dialog through the bus.
  const { openProject } = useTerminalBus();

  return (
    <>
      {/* One Reveal for the whole card. The old version ran its own
          `useInView` + `useAnimation` with a 100px rise, which fought the
          shared 0.45s fade-up every other section uses. */}
      <Reveal width="100%">
        <div className="h-full rounded-lg border border-hairline bg-surface-1 p-3 transition-colors hover:border-hairline-strong">
          {/* A real <button>, not a div with an onClick: the cover was the
              card's primary action and a keyboard user could not reach it at
              all. The title row and "Learn more" below are siblings, never
              nested inside it — a button inside a button is invalid HTML and
              the inner one stops being operable. */}
          <button
            type="button"
            aria-label={`${title} — ${t("learnMore")}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => openProject(projectKey)}
            className="w-full cursor-pointer rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {imgSrc ? (
              <div className="relative aspect-video overflow-hidden rounded-lg border border-hairline bg-surface-2">
                <img
                  src={imgSrc}
                  alt={t("imageAlt", { title })}
                  // The screenshot floats out of the bottom of the tile and
                  // grows a little on hover. The 2 degree rotation is gone:
                  // the covers beside it are square-on windows, and one tilted
                  // tile in a grid of straight ones reads as a mistake.
                  style={{ width: hovered ? "88%" : "85%" }}
                  className="absolute bottom-0 left-1/2 w-[85%] -translate-x-1/2 translate-y-1/4 rounded-t border border-b-0 border-hairline transition-all"
                />
              </div>
            ) : (
              <ProjectCover title={title} tech={tech} index={index} />
            )}
          </button>
          <div className="mt-4">
            {/* The old row padded the title to `100% - 150px` and filled the
                gap with a rule; on any title that wrapped, the rule floated
                between the two lines. The card has a border of its own now,
                so the rule was buying nothing. */}
            <div className="flex w-full items-start justify-between gap-3">
              <h3 className="min-w-0 text-lg font-semibold text-fg">{title}</h3>

              <div className="flex shrink-0 items-center gap-3 pt-1">
                {code && (
                  <Link href={code} target="_blank" rel="noreferrer" aria-label={`${title} — GitHub`}>
                    <AiFillGithub className="text-xl text-fg-3 transition-colors hover:text-fg" />
                  </Link>
                )}

                {projectLink && (
                  <Link href={projectLink} target="_blank" rel={ownSite ? "noreferrer" : "nofollow noreferrer"} aria-label={`${title} — ${t("openSite")}`}>
                    <AiOutlineExport className="text-xl text-fg-3 transition-colors hover:text-fg" />
                  </Link>
                )}
              </div>
            </div>
            <p className="my-2 font-mono mono-1 text-xs leading-relaxed text-fg-3">
              {tech.join(" · ")}
            </p>
            <p className="text-sm leading-relaxed text-fg-2">
              {description}{" "}
              <button
                type="button"
                className="inline-block cursor-pointer rounded-sm text-sm text-accent-hover underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                onClick={() => openProject(projectKey)}
              >
                {t("learnMore")} →
              </button>
            </p>
          </div>
        </div>
      </Reveal>
    </>
  );
};
