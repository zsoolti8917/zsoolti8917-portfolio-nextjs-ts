import dynamic from "next/dynamic";
import { ShippedHero } from "./variants/shipped";

/**
 * `process.env.NODE_ENV` is substituted by DefinePlugin *before* webpack
 * parses this file, so in a production build the import() below sits in a
 * provably dead branch and webpack never collects it as a dependency. The
 * entire `hero/dev/` subtree — registry, context, switcher and the four
 * variants that aren't shipping — is therefore absent from the production
 * bundle, not merely unreachable at runtime.
 *
 * (The old About switcher used `if (NODE_ENV !== "development") return null`,
 * which left all five variants in the module graph and shipped them anyway.)
 */
const HeroDevHarness =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./dev/HeroDevHarness"), { ssr: true })
    : null;

const Hero = () => (HeroDevHarness ? <HeroDevHarness /> : <ShippedHero />);

export default Hero;
