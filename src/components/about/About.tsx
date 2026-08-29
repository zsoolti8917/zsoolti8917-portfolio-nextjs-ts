import { useTranslations } from "next-intl";
import { SectionHeader } from "../util/SectionHeader";
import { AboutV1 } from "./variants/AboutV1";

export const About = () => {
  const t = useTranslations("About");
  // Kicker reuses the nav label so the two never drift apart.
  const nav = useTranslations("nav");

  return (
    // `section-wrapper` + `id` are what the nav scroll-spy observes
    // (nav/useScrollSpy.ts); `scroll-mt-16` clears the 56px sticky nav when an
    // anchor link jumps here.
    <section id="about" className="section-wrapper scroll-mt-16">
      <SectionHeader index="01" kicker={nav("about").toLowerCase()} title={t("title")} />
      <AboutV1 />
    </section>
  );
};
