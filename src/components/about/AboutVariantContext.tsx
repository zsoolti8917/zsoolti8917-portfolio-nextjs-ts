import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export const ABOUT_VARIANTS = [
  { id: 1, name: "Balanced rail" },
  { id: 2, name: "Toolbox band" },
  { id: 3, name: "Bento grid" },
  { id: 4, name: "Dossier" },
  { id: 5, name: "Marquee" },
];

const STORAGE_KEY = "about-variant";

interface AboutVariantValue {
  variant: number;
  setVariant: (id: number) => void;
}

const AboutVariantContext = createContext<AboutVariantValue>({
  variant: 1,
  setVariant: () => {},
});

export const AboutVariantProvider = ({ children }: { children: ReactNode }) => {
  // Always 1 on the server and on the first client render. Reading
  // localStorage during render would make the two disagree and trigger a
  // hydration mismatch, so the stored choice is applied after mount.
  const [variant, setVariantState] = useState(1);

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(STORAGE_KEY));
      if (ABOUT_VARIANTS.some((v) => v.id === stored)) setVariantState(stored);
    } catch {
      /* storage unavailable (private mode) — keep the default */
    }
  }, []);

  const setVariant = useCallback((id: number) => {
    setVariantState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AboutVariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </AboutVariantContext.Provider>
  );
};

export const useAboutVariant = () => useContext(AboutVariantContext);
