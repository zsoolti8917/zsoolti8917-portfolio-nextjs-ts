import { useTranslations } from "next-intl";
import { SectionHeader } from "../util/SectionHeader";
import { AboutVariantProvider, useAboutVariant } from "./AboutVariantContext";
import { AboutVariantSwitcher } from "./AboutVariantSwitcher";
import { AboutV1 } from "./variants/AboutV1";
import { AboutV2 } from "./variants/AboutV2";
import { AboutV3 } from "./variants/AboutV3";
import { AboutV4 } from "./variants/AboutV4";
import { AboutV5 } from "./variants/AboutV5";

const AboutBody = () => {
  const { variant } = useAboutVariant();

  switch (variant) {
    case 2:
      return <AboutV2 />;
    case 3:
      return <AboutV3 />;
    case 4:
      return <AboutV4 />;
    case 5:
      return <AboutV5 />;
    default:
      return <AboutV1 />;
  }
};

export const About = () => {
  const t = useTranslations("About");

  return (
    <AboutVariantProvider>
      {/* `section-wrapper` is the sidebar scroll-spy marker (SideBar.tsx:11);
          it and the id must survive whichever variant is selected. */}
      <section id="about" className="section-wrapper">
        <SectionHeader title={t("title")} dir="l" />
        <AboutBody />
        <AboutVariantSwitcher />
      </section>
    </AboutVariantProvider>
  );
};
