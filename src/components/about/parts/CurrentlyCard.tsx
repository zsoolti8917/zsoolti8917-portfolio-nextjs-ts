import { useTranslations } from "next-intl";
import { AiOutlineRadarChart } from "react-icons/ai";

interface Props {
  className?: string;
  /** Drop the card chrome when the caller already provides a Tile. */
  bare?: boolean;
}

export const CurrentlyCard = ({ className = "", bare = false }: Props) => {
  const t = useTranslations("About");

  const body = (
    <>
      {!bare && (
        <h4 className="mb-4 flex items-center gap-2">
          <AiOutlineRadarChart className="text-lg text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t("currently.label")}
          </span>
        </h4>
      )}
      <p className="flex items-center gap-2 font-bold text-zinc-100">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
        </span>
        {t("currently.role")}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        {t("currently.detail")}
      </p>
    </>
  );

  if (bare) return <div className={className}>{body}</div>;

  return (
    <div
      className={`rounded-xl border border-zinc-800 border-l-2 border-l-indigo-500 bg-zinc-900/60 p-6 ${className}`}
    >
      {body}
    </div>
  );
};
