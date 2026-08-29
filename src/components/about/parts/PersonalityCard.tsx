import { useTranslations } from "next-intl";

interface Props {
  className?: string;
  bare?: boolean;
}

export const PersonalityCard = ({ className = "", bare = false }: Props) => {
  const t = useTranslations("About");
  const items = t.raw("personality.items") as string[];

  return (
    <div className={className}>
      {!bare && (
        <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
          {t("personality.label")}
        </h4>
      )}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-500" />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
