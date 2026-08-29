import { twMerge } from "tailwind-merge";

/**
 * The generated tile for a project with no screenshot.
 *
 * Six of the eleven projects are private, offline or headless, so a "no image"
 * placeholder would be the most common state on the page. Instead of a grey
 * box this draws a miniature of the same window chrome the hero uses — faux
 * title bar, path, prompt — so a cover reads as a deliberate object rather
 * than as a missing asset.
 */

/**
 * Slug rule duplicated from `hero/terminal/useTerminalData.ts` (its private
 * `slug`), with two deliberate differences:
 *
 * - no `.split("-")[0]`: that helper wants one short word a visitor can type
 *   (`open coffece`), while a path segment reads better whole.
 * - NFKD + combining-mark strip first, so the SK/HU titles do not shatter into
 *   dashes ("vyhľadávanie" → "vyhladavanie", not "vyhl-ad-vanie").
 */
export const projectSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Stable 32-bit string hash, used only to stand in for a grid position when
 * the caller has none. See `index` below.
 */
const hashOf = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
};

interface Props {
  title: string;
  /**
   * Position in the grid — the only input to the hue, so two neighbouring
   * tiles never land on the same colour.
   *
   * Optional because neither call site can currently supply one: `Projects.tsx`
   * is frozen for WP2's modal rework and `ProjectModal` renders a single
   * project out of context. Without it the hue falls back to a hash of the
   * slug, which is just as deterministic but locale-dependent (the titles are
   * translated). WP4 should pass the real index from the `PROJECTS.map`.
   */
  index?: number;
  tech?: string[];
  className?: string;
}

export const ProjectCover = ({ title, index, tech = [], className = "" }: Props) => {
  const slug = projectSlug(title);
  // 47 is coprime with 360, so consecutive indexes never repeat a hue; +230
  // starts the run at indigo, next to the accent.
  const hue = (((index ?? hashOf(slug)) * 47 + 230) % 360 + 360) % 360;

  return (
    // twMerge, not concatenation: the modal header drops the rounding and the
    // side borders, and a plain `${className}` would leave that to the mercy of
    // Tailwind's own rule order.
    <div
      className={twMerge(
        "relative aspect-video overflow-hidden rounded-lg border border-hairline bg-surface-2",
        className
      )}
    >
      {/* Two flat layers, no shadows: the tint carries the identity and the
          dot grid ties the tile to the backdrop behind the hero. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(${hue} 60% 12%), hsl(${hue} 50% 6%))`,
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-dots" />

      {/* `border-hairline/[0.05]` and not `/60`: Tailwind's alpha modifier
          *replaces* the alpha baked into the token rather than scaling it, so
          `/60` would paint a 60%-white line here. */}
      <div className="relative flex h-6 items-center gap-1.5 border-b border-hairline/[0.05] px-3">
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-fg-3/40" />
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-fg-3/40" />
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-fg-3/40" />
        <span className="truncate font-mono mono-1 text-[10px] text-fg-3">
          ~/projects/{slug}
        </span>
      </div>

      <div className="relative flex h-[calc(100%-1.5rem)] flex-col justify-end gap-1 p-4">
        <p aria-hidden className="truncate font-mono mono-1 text-[11px] text-fg-3">
          ❯ open {slug}
        </p>
        {/* Not a heading: the card already names the project in its own <h4>,
            and the modal in its <h4> — this is decoration of that name. */}
        <p className="font-mono mono-1 text-lg font-bold leading-tight text-fg md:text-xl">
          {title}
        </p>
        {tech.length > 0 && (
          <p className="truncate font-mono mono-1 text-[11px] text-fg-3">
            {tech.slice(0, 3).map((item) => item.trim()).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
};
