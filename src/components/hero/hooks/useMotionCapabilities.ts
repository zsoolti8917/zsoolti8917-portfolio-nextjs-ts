import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useMediaQuery } from "./useMediaQuery";

/**
 * The one rule that keeps every hero variant hydration-safe: these values may
 * gate `useEffect` bodies ONLY, never a JSX branch. The reduced-motion form is
 * always what renders; effects upgrade it after mount.
 */
export const useMotionCapabilities = () => {
  const framerReduced = useReducedMotion();
  const reducedMotion = framerReduced ?? false;
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return {
    mounted,
    reducedMotion,
    coarsePointer,
    isDesktop,
    canAnimate: mounted && !reducedMotion,
    canRunPhysics: mounted && !reducedMotion && isDesktop && !coarsePointer,
  };
};
