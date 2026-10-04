import { About } from "@/components/sections/About";
import { Achievements } from "@/components/sections/Achievements";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { Work } from "@/components/sections/Work";

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Work />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
