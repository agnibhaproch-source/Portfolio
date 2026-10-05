import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/content";
import { Footer } from "@/components/sections/Footer";
import { ProjectDetail } from "@/components/sections/work/ProjectDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.name, description: project.pitch };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) notFound();
  const next = projects[(index + 1) % projects.length] ?? null;

  return (
    <>
      <ProjectDetail project={project} index={index} next={next} />
      <Footer />
    </>
  );
}
