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
      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {visible.map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
        {capped && (
          <button
            type="button"
            onClick={() => setExpanded((pv) => !pv)}
            className="rounded bg-zinc-800 px-2 py-1 text-xs text-indigo-300 transition-colors hover:bg-zinc-700"
          >
            {expanded ? t("showLess") : t("showMore", { count: hidden })}
          </button>
        )}
      </div>
    </div>
  );
};
