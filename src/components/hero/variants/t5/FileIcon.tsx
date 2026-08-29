import { VscFilePdf, VscFolderOpened, VscJson, VscMarkdown } from "react-icons/vsc";
import type { FileKind } from "./files";

const ICONS = {
  md: VscMarkdown,
  json: VscJson,
  pdf: VscFilePdf,
  folder: VscFolderOpened,
} as const;

/**
 * File-type glyphs, straight from the icon set the editor itself uses. Purely
 * a reading aid — the filename beside it is the accessible name — so every one
 * of them is hidden from assistive tech.
 */
export const FileIcon = ({
  kind,
  className = "",
}: {
  kind: FileKind;
  className?: string;
}) => {
  const Icon = ICONS[kind];
  return <Icon aria-hidden className={`h-3.5 w-3.5 shrink-0 ${className}`} />;
};
