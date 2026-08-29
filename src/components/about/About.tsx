import { useTranslations } from "next-intl";
import { SectionHeader } from "../util/SectionHeader";
import { AboutV1 } from "./variants/AboutV1";

export const About = () => {
  const t = useTranslations("About");

  return (
    // `section-wrapper` is the sidebar scroll-spy marker (SideBar.tsx:11);
    // it and the id are what the IntersectionObserver keys off.
    <section id="about" className="section-wrapper">
      <SectionHeader title={t("title")} dir="l" />
      <AboutV1 />
    </section>
  );
};
