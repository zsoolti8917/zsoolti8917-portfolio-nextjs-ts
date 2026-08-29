import { SHIPPED_VARIANT_ID } from "../variants/shipped";
import { HERO_VARIANTS, useHeroVariant } from "./HeroVariantContext";

/**
 * Development-only picker. Anchored bottom-LEFT: `ScrollToTopButton` occupies
 * bottom-right (`fixed bottom-4 right-4`), and `left-[66px]` clears the 54px
 * sidebar rail with a 12px gutter.
 */
export const HeroVariantSwitcher = () => {
  const { variant, setVariant } = useHeroVariant();
  const active = HERO_VARIANTS.find((v) => v.id === variant);

  return (
    <div className="fixed bottom-4 left-[66px] z-50 flex flex-col items-start gap-2">
      <span className="rounded-full bg-zinc-800/90 px-3 py-1 text-[11px] font-medium text-zinc-300 shadow-lg backdrop-blur">
        Hero: {active?.name}
        {variant === SHIPPED_VARIANT_ID && (
          <span className="ml-1 text-indigo-300">(ships)</span>
        )}
      </span>
      <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/90 p-1 shadow-xl backdrop-blur">
        {HERO_VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            title={v.name}
            aria-label={`Hero layout ${v.id}: ${v.name}`}
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
