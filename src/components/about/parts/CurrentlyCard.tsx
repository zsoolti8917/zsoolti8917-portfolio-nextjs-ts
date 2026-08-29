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
          <AiOutlineRadarChart className="text-lg text-fg-3" />
          <span className="font-mono mono-1 text-[11px] uppercase tracking-widest text-fg-3">
            {t("currently.label")}
          </span>
        </h4>
      )}
      <p className="flex items-center gap-2 font-semibold text-fg">
        {/* The one animated thing in the section: a live status light. Green,
            not indigo — it reports a state, it is not an accent. */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        {t("currently.role")}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-fg-2">
        {t("currently.detail")}
      </p>
    </>
  );

  if (bare) return <div className={className}>{body}</div>;

  return (
    <div
      className={`rounded-xl border border-hairline bg-surface-1 p-6 ${className}`}
    >
      {body}
    </div>
  );
};
