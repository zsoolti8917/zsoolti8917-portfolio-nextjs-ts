import { useTranslations } from "next-intl";
import { IconType } from "react-icons";
import {
  AiOutlineEnvironment,
  AiOutlineCompass,
  AiOutlineCalendar,
} from "react-icons/ai";

const FACTS: { key: string; Icon: IconType }[] = [
  { key: "based", Icon: AiOutlineEnvironment },
  { key: "from", Icon: AiOutlineCompass },
  { key: "since", Icon: AiOutlineCalendar },
];

interface Props {
  layout?: "row" | "column";
  className?: string;
}

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
      {FACTS.map(({ key, Icon }) => (
        <div key={key} className="flex items-start gap-3">
          <Icon className="mt-[2px] shrink-0 text-base text-indigo-500" />
          <div>
            <dt className="text-xs uppercase tracking-widest text-zinc-500">
              {t(`facts.${key}Label`)}
            </dt>
            <dd className="text-sm font-medium text-zinc-200">
              {t(`facts.${key}Value`)}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
};
