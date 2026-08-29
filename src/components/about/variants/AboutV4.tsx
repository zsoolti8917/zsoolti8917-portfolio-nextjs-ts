import { useTranslations } from "next-intl";
import { AboutProse } from "../parts/AboutProse";
import { CertificationList } from "../parts/CertificationList";
import { PersonalityCard } from "../parts/PersonalityCard";
import { useAboutData } from "../parts/useAboutData";
import type { StackGroup } from "../types";

/**
 * V4 — Terminal / dossier (experimental).
 * The 59 stack entries read as a manifest in a uniform mono grid rather than a
 * pile of pill-shaped tags, and the facts become a key/value panel.
 */
export const AboutV4 = () => {
  const t = useTranslations("About");
  const { stack, aiLlm, triedOut, certifications, languages } = useAboutData();

  const rows: [string, string][] = [
    ["location", t("facts.basedValue")],
    ["origin", t("facts.fromValue")],
    ["role", t("currently.role")],
    ["since", t("facts.sinceValue")],
    ["langs", languages.map((lang) => lang.name).join(" · ")],
  ];

  const manifest: StackGroup[] = [
    ...stack,
    { label: aiLlm.title, items: aiLlm.chips },
    { label: triedOut.title, items: triedOut.chips },
  ];

  return (
    <div className="space-y-14">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="mb-4 font-mono text-xs text-indigo-400">{"// about"}</p>
          <AboutProse withDropCap={false} />
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 font-mono text-sm">
          <p className="mb-3 text-xs text-indigo-400">$ whoami</p>
          <dl>
            {rows.map(([key, value]) => (
              <div
                key={key}
                className="flex items-start gap-4 border-b border-zinc-800/60 py-2 last:border-0"
              >
                <dt className="w-16 shrink-0 text-zinc-500">{key}</dt>
                <dd className="min-w-0 break-words text-zinc-200">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div>
        <p className="mb-6 font-mono text-xs text-indigo-400">{"// stack"}</p>
        <div className="space-y-8">
          {manifest.map((group) => (
            <div
              key={group.label}
              className="grid grid-cols-1 gap-3 md:grid-cols-[170px_minmax(0,1fr)] md:gap-6"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 md:pt-2">
                {group.label}
              </p>
              {/* Four columns, not five: at five the longest entries
                  ("LangChain / LangSmith") no longer fit on one line. */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="flex items-center rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-xs leading-snug text-zinc-300 transition-colors hover:border-indigo-500/60 hover:text-indigo-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <p className="mb-6 font-mono text-xs text-indigo-400">
            {"// certifications"}
          </p>
          <CertificationList items={certifications} />
        </div>
        <div>
          <p className="mb-6 font-mono text-xs text-indigo-400">
            {"// off the clock"}
          </p>
          <PersonalityCard bare />
        </div>
      </div>
    </div>
  );
};
