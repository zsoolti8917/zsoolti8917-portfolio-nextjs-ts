import React from "react";
import { TerminalBusProvider } from "./bus/TerminalBus";
import { TopNav } from "./nav/TopNav";
import Hero from "./hero/Hero";
import { About } from "./about/About";
import { Projects } from "./projects/Projects";
import { Experience } from "./experience/Experience";
import { Contact } from "./contact/Contact";
import { Footer } from "./footer/Footer";
import { ProjectModalHost } from "./projects/ProjectModalHost";
import { CommandPalette } from "./palette/CommandPalette";

/**
 * The whole page.
 *
 * Hero sits outside the `max-w-5xl` wrapper so the terminal window can run
 * edge-to-edge; the sections keep the narrower measure. Note that `space-y-32`
 * only sets margin-top on `* + *`, so the first child (About) gets nothing —
 * Hero supplies its own bottom margin (see hero/parts/HeroSection).
 *
 * The modal host and the palette are siblings of <main>, not children: both
 * portal into <body> and neither belongs to the document outline.
 */
export const HomPage = () => {
  return (
    <TerminalBusProvider>
      <TopNav />
      <main>
        <Hero />
        <div className="mx-auto max-w-5xl px-4 md:px-8 space-y-32 pb-24">
          <About />
          <Projects />
          <Experience />
          <Contact />
        </div>
        <Footer />
      </main>
      <ProjectModalHost />
      <CommandPalette />
    </TerminalBusProvider>
  );
};
