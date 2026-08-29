import { useState } from "react";
import { useTranslations } from "next-intl";
import { Chip } from "../../util/Chip";

interface Props {
  label: string;
  items: string[];
  /** Show at most this many, then reveal the rest behind a "+N more" button. */
  limit?: number;
}

export const SkillGroup = ({ label, items, limit }: Props) => {
  const t = useTranslations("About");
  const [expanded, setExpanded] = useState(false);

  const capped = limit !== undefined && items.length > limit;
  const visible = capped && !expanded ? items.slice(0, limit) : items;
  const hidden = items.length - (limit ?? 0);

  return (
    <div>
      <h3 className="mb-3 font-mono mono-1 text-[11px] uppercase tracking-widest text-fg-3">
        {label}
      </h3>
      <div className="flex flex-wrap gap-2">
        {visible.map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
        {capped && (
          <button
            type="button"
            onClick={() => setExpanded((pv) => !pv)}
            className="rounded-md border border-hairline bg-surface-2 px-2 py-1 font-mono mono-1 text-xs text-accent-hover transition-colors hover:border-hairline-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {expanded ? t("showLess") : t("showMore", { count: hidden })}
          </button>
        )}
      </div>
    </div>
  );
};
