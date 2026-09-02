import React from "react";
import { useTranslations } from "next-intl";
import { useTerminalBus } from "../bus/TerminalBus";
import { ProjectModal } from "./ProjectModal";
import { PROJECTS } from "./Projects";
import { useProjectModalContent, type ProjectDef } from "./useProjectModalContent";

/**
 * The one project modal on the page, driven by `bus.projectKey`.
 *
 * Every card used to mount its own (a modal per card — a copy of the body and
 * a scroll-lock effect each), which also meant nothing outside the card could
 * open one. With a single host, the card, the ⌘K palette and the terminal's
 * `open <project>` all reach the same dialog by naming a key.
 */
export const ProjectModalHost = () => {
  const { projectKey, closeProject } = useTerminalBus();
  const index = PROJECTS.findIndex((p) => p.key === projectKey);
  const def = index >= 0 ? PROJECTS[index] : undefined;

  // Split so the hooks below only ever run for a project that exists — the
  // content hook reads a whole modal body out of the message catalogue.
  return def ? <OpenProject def={def} index={index} onClose={closeProject} /> : null;
};

const OpenProject = ({ def, index, onClose }: { def: ProjectDef; index: number; onClose: () => void }) => {
  const t = useTranslations("projects");
  const content = useProjectModalContent(def);

  return (
    <ProjectModal
      project={{
        title: t(`${def.key}.title`),
        imgSrc: def.imgSrc,
        index,
        code: def.code,
        projectLink: def.projectLink,
        ownSite: def.ownSite,
        tech: t(`${def.key}.tech`).split(","),
        content,
      }}
      onClose={onClose}
    />
  );
};
