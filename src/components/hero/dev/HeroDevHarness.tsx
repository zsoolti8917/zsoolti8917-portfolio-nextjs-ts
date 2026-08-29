import { HERO_VARIANT_COMPONENTS } from "./variantRegistry";
import { HeroVariantProvider, useHeroVariant } from "./HeroVariantContext";
import { HeroVariantSwitcher } from "./HeroVariantSwitcher";

const HeroDevBody = () => {
  const { variant } = useHeroVariant();
  const Variant = HERO_VARIANT_COMPONENTS[variant];
  return <Variant />;
};

const HeroDevHarness = () => (
  <HeroVariantProvider>
    <HeroDevBody />
    <HeroVariantSwitcher />
  </HeroVariantProvider>
);

export default HeroDevHarness;
