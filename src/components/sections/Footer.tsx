import { credits, profile } from "@/content";

export function Footer() {
  return (
    <footer data-mode="colour" className="border-t-[3px] border-washi px-4 py-16 md:px-10">
      {/* TODO(phase 8): scroll-driven credits roll */}
      <h2 className="text-24">{credits.heading}</h2>
      <dl className="mt-6 grid gap-3 text-14 sm:grid-cols-[10rem_1fr]">
        {credits.rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-muted">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-14 text-muted">
        <p>
          © {new Date().getFullYear()} {profile.name.full}
        </p>
        <a href="#top" className="ink-link">
          {credits.backToTop}
        </a>
      </div>
    </footer>
  );
}
