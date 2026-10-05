import { Eyecatch } from "@/components/motion/Eyecatch";
import { SwordsmanDivider } from "@/components/motion/SwordsmanDivider";
import { BrushDivider, RipDivider, ShatterDivider } from "@/components/motion/PageTransitions";
import { About } from "@/components/sections/About";
import { Achievements } from "@/components/sections/Achievements";
import { BurnTransition } from "@/components/sections/BurnTransition";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { TrainingLog } from "@/components/sections/TrainingLog";
import { Work } from "@/components/sections/Work";
import { sections } from "@/content";
import { getGithubStats, getLeetcodeStats } from "@/lib/stats";

export default async function Home() {
  const [github, leetcode] = await Promise.all([getGithubStats(), getLeetcodeStats()]);
  return (
    <>
      <main id="main">
        <Hero />
        <About />
        <BurnTransition />
        <Skills />
        <TrainingLog github={github} leetcode={leetcode} />
        <RipDivider label={sections.experience.heading} />
        <Experience />
        <ShatterDivider label={sections.work.heading} />
        <Work />
        <SwordsmanDivider label={sections.achievements.heading} />
        <Achievements />
        <BrushDivider label={sections.contact.heading} />
        <Contact />
      </main>
      <Footer />
      {/* Segment cards for the sections without a page transition of their own */}
      <Eyecatch items={[sections.about, sections.skills, sections.stats]} />
    </>
  );
}
