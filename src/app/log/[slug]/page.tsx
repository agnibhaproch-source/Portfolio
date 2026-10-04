import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { logCopy, publishedPosts } from "@/content";
import { Footer } from "@/components/sections/Footer";
import { TransitionLink } from "@/components/ui/TransitionLink";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/log/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = publishedPosts.find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function LogPostPage({ params }: PageProps<"/log/[slug]">) {
  const { slug } = await params;
  const post = publishedPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <main id="main" data-mode="print" className="min-h-svh px-4 pt-32 pb-24 md:px-10">
        <article className="mx-auto max-w-prose">
          <p className="text-14 text-muted">
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-2 text-56">{post.title}</h1>
          <div className="mt-10 space-y-6 text-18">
            {post.body.map((b, i) =>
              b.type === "h2" ? (
                <h2 key={i} className="pt-4 text-36">
                  {b.text}
                </h2>
              ) : b.type === "list" ? (
                <ul key={i} className="list-disc space-y-2 pl-6">
                  {b.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              ) : (
                <p key={i}>{b.text}</p>
              ),
            )}
          </div>
          <TransitionLink href="/log" className="mt-14 inline-block ink-link text-18">
            {logCopy.back}
          </TransitionLink>
        </article>
      </main>
      <Footer />
    </>
  );
}
