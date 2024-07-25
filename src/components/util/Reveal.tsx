import { useEffect, useRef, useState } from "react";
import { useAnimation, useInView, motion } from "framer-motion";
import { useRouter } from 'next/router';

interface RevealProps {
  children: JSX.Element;
  width?: string;
}

export const Reveal = ({ children, width = "w-fit" }: RevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const router = useRouter();
  const [shouldAnimate, setShouldAnimate] = useState(true);

  const mainControls = useAnimation();
  const slideControls = useAnimation();

  useEffect(() => {
    if (isInView && shouldAnimate) {
      mainControls.start("visible");
      slideControls.start("visible");
    }
  }, [isInView, shouldAnimate]);

  useEffect(() => {
    // Trigger animation when language changes
    if (!isInView) return;
    
    setShouldAnimate(false);
    mainControls.set("hidden");
    slideControls.set("hidden");
    
    // Use a short timeout to ensure the "hidden" state is applied before animating again
    setTimeout(() => {
      setShouldAnimate(true);
      mainControls.start("visible");
      slideControls.start("visible");
    }, 50);
  }, [router.locale]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${width}`}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{
          hidden: { left: 0 },
          visible: { left: "100%" },
        }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: 0.5, ease: "easeIn" }}
        className="absolute bottom-1 left-0 right-0 top-1 z-20 bg-indigo-500"
      />
    </div>
  );
};

export default Reveal;