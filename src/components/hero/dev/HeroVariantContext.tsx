import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { HeroVariantId } from "../types";

export const HERO_VARIANTS: { id: HeroVariantId; name: string }[] = [
  { id: 1, name: "Mission control" },
  { id: 2, name: "Ragdoll stack" },
  { id: 3, name: "Dither field" },
  { id: 4, name: "Shell" },
  { id: 5, name: "Kinetic" },
];

const STORAGE_KEY = "hero-variant";

interface Ctx {
  variant: HeroVariantId;
  setVariant: (id: HeroVariantId) => void;
}

const HeroVariantContext = createContext<Ctx>({
  variant: 1,
  setVariant: () => {},
});

export const HeroVariantProvider = ({ children }: { children: ReactNode }) => {
  // Always 1 on the server and on the first client render. Reading
  // localStorage during render would make the two disagree and trigger a
  // hydration mismatch, so the stored choice is applied after mount.
  const [variant, setVariantState] = useState<HeroVariantId>(1);

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(STORAGE_KEY));
      if (HERO_VARIANTS.some((v) => v.id === stored)) {
        setVariantState(stored as HeroVariantId);
      }
    } catch {
      /* storage unavailable (private mode) — keep the default */
    }
  }, []);

  const setVariant = useCallback((id: HeroVariantId) => {
    setVariantState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <HeroVariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </HeroVariantContext.Provider>
  );
};

export const useHeroVariant = () => useContext(HeroVariantContext);
