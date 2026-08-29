import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { motion, Variants } from 'framer-motion';
import { useOverlayOpen } from './util/overlayState';

export const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  // Mounted in _app, above the bus provider, so it reads the overlay store
  // instead: while the palette or a project modal is open this button would
  // otherwise float in the blurred backdrop, still tabbable.
  const overlayOpen = useOverlayOpen();
  const shown = isVisible && !overlayOpen;

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const pulseVariants: Variants = {
    initial: { 
      scale: 1,
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)'
    },
    pulse: { 
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0 0 rgba(255, 255, 255, 0.7)',
        '0 0 0 10px rgba(255, 255, 255, 0)',
        '0 0 0 0 rgba(255, 255, 255, 0.7)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
      }
    }
  };

  return (
    <motion.button
      className="fixed bottom-4 right-4 bg-indigo-500 text-white p-3 rounded-full shadow-lg"
      onClick={scrollToTop}
      initial="initial"
      animate={shown ? "pulse" : "initial"}
      variants={pulseVariants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        opacity: shown ? 1 : 0,
        pointerEvents: shown ? 'auto' : 'none',
        transition: 'opacity 0.2s'
      }}
    >
      <FiArrowUp size={24} />
    </motion.button>
  );
};

export default ScrollToTopButton;