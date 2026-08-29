import type { LanguageEntry } from "../types";

interface Props {
  items: LanguageEntry[];
  layout?: "list" | "inline";
  className?: string;
}

export const LanguageList = ({
  items,
  layout = "list",
  className = "",
}: Props) => {
  if (layout === "inline") {
    return (
      <p className={`text-sm text-fg-2 ${className}`}>
        {items.map((lang, i) => (
          <span key={lang.name}>
            {i > 0 && <span className="text-fg-3"> · </span>}
            {lang.name}
            <span className="text-fg-3"> ({lang.level})</span>
          </span>
        ))}
      </p>
    );
  }

  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((lang) => (
        <li key={lang.name} className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-fg-2">{lang.name}</span>
          <span className="text-xs text-fg-3">{lang.level}</span>
        </li>
      ))}
    </ul>
  );
};
