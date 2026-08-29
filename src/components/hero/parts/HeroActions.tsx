import { useRouter } from "next/router";
import { OutlineButton } from "@/components/buttons/OutlineButton";
import { cvUmamiEvent, getCVUrl } from "@/lib/cv";
import type { HeroCommonCopy } from "../types";

/**
 * Soft primary CTA above the fold, per the research: a high-intent "hire me"
 * before the visitor has seen any work reliably bounces them. The CV is the
 * quiet secondary — recruiters want the PDF and shouldn't have to hunt.
 */
export const HeroActions = ({ common }: { common: HeroCommonCopy }) => {
  const router = useRouter();
  const locale = router.locale || "en";

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView();

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <OutlineButton
        onClick={() => scrollTo("projects")}
        className="border-indigo-500 bg-indigo-500 text-zinc-100 before:bg-indigo-700 hover:border-indigo-700 hover:text-white"
      >
        {common.ctaWork}
      </OutlineButton>

      <OutlineButton
        data-umami-event={cvUmamiEvent(locale)}
        onClick={() => window.open(getCVUrl(locale))}
      >
        {common.ctaCv}
      </OutlineButton>

      <button
        type="button"
        onClick={() => scrollTo("contact")}
        className="text-sm text-zinc-400 underline-offset-4 transition-colors hover:text-indigo-300 hover:underline"
      >
        {common.ctaContact}
      </button>
    </div>
  );
};
