import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRouter } from "next/router";

interface RevealProps {
  children: JSX.Element;
  /**
   * CSS width ("fit-content" | "100%"). Tailwind width classes ("w-full",
   * "w-fit") are also accepted — several call sites predate the token rework —
   * and are applied as a class instead of an inline style.
   */
  width?: "fit-content" | "100%" | (string & {});
}

/**
 * Fade-up on first sight. One element, no wrapper: the old version stacked an
 * indigo slab under `overflow-hidden`, which clipped focus rings on anything
 * revealed and made every heading a two-node animation.
 */
export const Reveal = ({ children, width = "fit-content" }: RevealProps) => {
  const router = useRouter();
  // Remount on a locale switch so freshly swapped copy animates in rather than
  // popping. `useInView({ once: true })` has no other way to re-fire.
  return (
    <RevealOnce key={router.locale} width={width}>
      {children}
    </RevealOnce>
  );
};

const RevealOnce = ({ children, width }: Required<RevealProps>) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const isClass = width.startsWith("w-");

  return (
    <motion.div
      ref={ref}
      className={isClass ? width : undefined}
      style={isClass ? undefined : { width }}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={reduced || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
