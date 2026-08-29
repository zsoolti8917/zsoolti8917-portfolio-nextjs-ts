/**
 * The scan layer. Recruiters keyword-match here before reading the headline,
 * so it must look identical across variants for the site to feel like one site.
 */
export const Eyebrow = ({ children }: { children: string }) => (
  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
    {children}
  </p>
);
