import {
  About,
  Achievements,
  BrushDivider,
  BurnTransition,
  Contact,
  Experience,
  Eyecatch,
  Footer,
  RipDivider,
  ShatterDivider,
  Skills,
  SwordsmanDivider,
  TrainingLog,
  Work,
} from "@/components/sections/lazy";
import { Hero } from "@/components/sections/Hero";
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
