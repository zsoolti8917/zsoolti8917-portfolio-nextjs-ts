import type { HeroCommonCopy, HeroVariantCopy } from "../types";
import { Eyebrow } from "./Eyebrow";

/**
 * The plain-language layer, above the terminal in every variant.
 *
 * It exists because of two hard constraints that the shell cannot satisfy on
 * its own: a recruiter decides whether to keep reading in about seven seconds,
 * and AI crawlers do not execute JavaScript. Name, role and one-sentence
 * summary are therefore ordinary server-rendered text, legible before anything
 * is typed and present in the HTML for anything that never types at all.
 */
export const ReadableBand = ({
  common,
  copy,
  className = "",
}: {
  common: HeroCommonCopy;
  copy: HeroVariantCopy;
  className?: string;
}) => (
  <div className={className}>
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="text-3xl font-black leading-tight text-zinc-100 sm:text-4xl md:text-5xl">
      {copy.headline}
    </h1>
    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
      <span className="font-semibold text-zinc-100">{common.name}</span>
      <span className="text-zinc-500"> — {common.role}. </span>
      {common.tagline}
    </p>
    <p className="mt-2 text-xs tracking-wide text-zinc-500">{common.location}</p>
  </div>
);
