import React from "react";
import { SideBar } from "./nav/SideBar";
import { Header } from "./nav/Header";
import Hero from "./hero/Hero";
import { About } from "./about/About";
import { Projects } from "./projects/Projects";
import { Experience } from "./experience/Experience";
import { Contact } from "./contact/Contact";

export const HomPage = () => {
  return (
    <div className="grid grid-cols-[54px_minmax(0,1fr)]">
      <SideBar />
      <main>
        <Header />
        {/* Hero sits OUTSIDE the max-w-5xl wrapper so a variant can go
            full-bleed with plain `w-full`. Negative margins can't do this —
            they cancel padding but not max-width — and 100vw overflows,
            because the viewport is 54px wider than this column.
            Consequence: `space-y-32` sets margin-top on `* + *`, so the first
            child never gets it. That used to be Hero; it is now About. Hero
            therefore supplies its own bottom margin (see parts/HeroSection). */}
        <Hero />
        <div className="mx-auto max-w-5xl px-4  md:px-8 space-y-32 pb-24">
          <About />
          <Projects />
          <Experience />
          <Contact />
        </div>
      </main>
    </div>
  );
};
