interface Props {
  /** Two-digit ordinal, "01".."04". */
  index: string;
  /** Lowercase section name, e.g. "about". */
  kicker: string;
  title: string;
}

/** Mono kicker over an Inter heading — the numbering is what gives the page
 *  its table-of-contents feel without a second navigation element. */
export const SectionHeader = ({ index, kicker, title }: Props) => (
  <div className="mb-12">
    <p className="font-mono mono-1 text-xs tracking-widest text-fg-3">
      {index} / {kicker}
    </p>
    <h2 className="mt-2 text-3xl md:text-5xl font-black tracking-[-0.02em] text-fg">
      {title}
    </h2>
  </div>
);
