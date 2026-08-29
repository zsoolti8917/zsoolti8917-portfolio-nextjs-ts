import { useTranslations } from "next-intl";

const FACTS = ["based", "from", "since"] as const;

interface Props {
  layout?: "row" | "column";
  className?: string;
}

/**
 * Three labelled facts. The icons are gone: a pin, a compass and a calendar
 * next to "Based / From / Since" said nothing the label did not already say,
 * and the mono kicker is the section's own way of marking a label.
 */
export const FactsRow = ({ layout = "row", className = "" }: Props) => {
  const t = useTranslations("About");

  return (
    <dl
      className={`${
        layout === "row"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-3"
          : "flex flex-col gap-4"
      } ${className}`}
    >
      {FACTS.map((key) => (
        <div key={key}>
          <dt className="font-mono mono-1 text-[11px] uppercase tracking-widest text-fg-3">
            {t(`facts.${key}Label`)}
          </dt>
          <dd className="mt-1 text-sm text-fg">{t(`facts.${key}Value`)}</dd>
        </div>
      ))}
    </dl>
  );
};
