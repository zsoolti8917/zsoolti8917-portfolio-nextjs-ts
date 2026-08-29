import { ABOUT_VARIANTS, useAboutVariant } from "./AboutVariantContext";

/**
 * Development-only picker for comparing the five About layouts.
 * `process.env.NODE_ENV` is inlined at build time, so this whole component is
 * dropped from the production bundle.
 */
export const AboutVariantSwitcher = () => {
  const { variant, setVariant } = useAboutVariant();

  if (process.env.NODE_ENV !== "development") return null;

  const active = ABOUT_VARIANTS.find((v) => v.id === variant);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      <span className="rounded-full bg-zinc-800/90 px-3 py-1 text-[11px] font-medium text-zinc-300 shadow-lg backdrop-blur">
        About: {active?.name}
      </span>
      <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/90 p-1 shadow-xl backdrop-blur">
        {ABOUT_VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            title={v.name}
            aria-label={`About layout ${v.id}: ${v.name}`}
            aria-pressed={v.id === variant}
            onClick={() => setVariant(v.id)}
            className={`h-8 w-8 rounded-full text-xs font-bold transition-colors ${
              v.id === variant
                ? "bg-indigo-500 text-white"
                : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            }`}
          >
            {v.id}
          </button>
        ))}
      </div>
    </div>
  );
};
