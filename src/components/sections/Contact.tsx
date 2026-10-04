"use client";

import { useRef, useState, type FormEvent } from "react";
import { contactCopy, profile, sections } from "@/content";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { buttonClass } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Record<Field, string>): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = contactCopy.errors.name;
  if (!EMAIL.test(v.email.trim())) e.email = contactCopy.errors.email;
  if (v.message.trim().length < 10) e.message = contactCopy.errors.message;
  return e;
}

const RAYS = 14;

/**
 * "Next chapter" preview. Fields underline-draw on focus, errors say what to
 * fix, the send button charges on hover or hold, and a successful send fires
 * a flame burst and draws a magic circle. Delivery is a mailto link.
 */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);

  const links = [
    { label: profile.email, href: `mailto:${profile.email}` },
    profile.links.github,
    profile.links.linkedin,
    ...profile.links.others,
  ];

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    const heading = q("h2")[0];
    const split = heading ? SplitText.create(heading, { type: "chars" }) : null;
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true } })
      .from(split?.chars ?? [], {
        yPercent: 80,
        scale: 1.6,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "steps(4)",
      })
      .from(
        q("[data-contact-rise]"),
        { y: 30, opacity: 0, duration: 0.6, stagger: 0.07, ease: "ink" },
        0.3,
      );
    return () => split?.revert();
  }, ref);

  const burst = () => {
    if (prefersReducedMotion()) return;
    const form = formRef.current;
    const panel = form?.parentElement;
    const svg = panel?.querySelector<SVGSVGElement>("[data-burst]");
    const button = form?.querySelector("button[type=submit]");
    if (!panel || !svg || !button) return;
    // Fire from the centre of the send button.
    const b = button.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    gsap.set(svg, {
      left: b.left - p.left + b.width / 2,
      top: b.top - p.top + b.height / 2,
      xPercent: -50,
      yPercent: -50,
    });
    const rays = svg.querySelectorAll("[data-ray]");
    gsap.fromTo(
      rays,
      { drawSVG: "0% 0%", opacity: 1 },
      {
        keyframes: [
          { drawSVG: "0% 100%", duration: 0.25, ease: "power2.out" },
          { drawSVG: "100% 100%", opacity: 0, duration: 0.35, ease: "power2.in" },
        ],
        stagger: 0.01,
      },
    );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      if (!prefersReducedMotion()) {
        gsap.fromTo(
          formRef.current,
          { x: -6 },
          { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
        );
      }
      return;
    }
    const body = `${values.message.trim()}\n\n${values.name.trim()} (${values.email.trim()})`;
    const href = `mailto:${profile.email}?subject=${encodeURIComponent(contactCopy.subject)}&body=${encodeURIComponent(body)}`;
    const a = document.createElement("a");
    a.href = href;
    a.click();
    burst();
    setSent(true);
  };

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (tried) setErrors(validate(next));
  };

  const fieldCls =
    "w-full border-b-2 border-washi/30 bg-transparent py-3 text-18 outline-none placeholder:text-muted aria-[invalid=true]:border-kiln";

  return (
    <section
      ref={ref}
      id={sections.contact.id}
      data-mode="colour"
      aria-labelledby={`${sections.contact.id}-heading`}
      className="relative overflow-hidden px-4 py-24 md:px-10 md:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 text-washi/10">
        <SpeedLines variant="radial" intensity={0.3} />
      </div>

      <div className="relative">
        <SectionHeading copy={sections.contact} />

        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            {profile.availability && (
              <p
                data-contact-rise
                className="flex items-center gap-4 font-display text-36 md:text-56"
              >
                <span aria-hidden className="relative flex size-4 shrink-0">
                  <span className="absolute inset-0 animate-ping rounded-full bg-kiln opacity-60" />
                  <span className="relative size-4 rounded-full bg-kiln" />
                </span>
                {profile.availability}
              </p>
            )}
            <p data-contact-rise className="mt-10 text-14 text-muted">
              {contactCopy.directLabel}
            </p>
            <ul className="mt-3 space-y-3">
              {links.map((l) => (
                <li key={l.href} data-contact-rise>
                  <a
                    href={l.href}
                    className="ink-link font-display text-24 break-all md:text-36"
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div data-contact-rise className="relative border-[3px] border-washi p-6 md:p-10">
            <svg
              aria-hidden
              data-burst
              viewBox="-100 -100 200 200"
              className="pointer-events-none absolute top-0 left-0 z-10 size-[28rem] overflow-visible"
            >
              {Array.from({ length: RAYS }, (_, i) => {
                const a = (i / RAYS) * Math.PI * 2;
                return (
                  <line
                    key={i}
                    data-ray
                    x1={Math.cos(a) * 18}
                    y1={Math.sin(a) * 18}
                    x2={Math.cos(a) * (60 + (i % 3) * 18)}
                    y2={Math.sin(a) * (60 + (i % 3) * 18)}
                    stroke={i % 2 ? "var(--kiln)" : "var(--agni)"}
                    strokeWidth={i % 3 ? 2 : 4}
                    strokeLinecap="round"
                    opacity="0"
                  />
                );
              })}
            </svg>

            {sent ? (
              <div role="status" className="relative grid min-h-80 place-items-center text-center">
                <MagicCircle trigger="mount" className="absolute size-72 opacity-50" />
                <div className="relative">
                  <p className="font-display text-56">{contactCopy.successTitle}</p>
                  <p className="mx-auto mt-4 max-w-md text-18">
                    {contactCopy.successBody}{" "}
                    <a href={`mailto:${profile.email}`} className="ink-link">
                      {profile.email}
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setValues({ name: "", email: "", message: "" });
                      setTried(false);
                      setErrors({});
                    }}
                    className="mt-8 ink-link text-18"
                  >
                    {contactCopy.again}
                  </button>
                </div>
              </div>
            ) : (
              <form ref={formRef} noValidate onSubmit={onSubmit} className="relative space-y-7">
                <p className="font-display text-24">{contactCopy.formTitle}</p>
                {Object.keys(errors).length > 0 && (
                  <p role="alert" className="text-18 text-kiln">
                    {contactCopy.errorSummary}
                  </p>
                )}
                {(["name", "email", "message"] as Field[]).map((f) => (
                  <div key={f} className="group relative">
                    <label htmlFor={`contact-${f}`} className="text-14 text-muted">
                      {contactCopy[f]}
                    </label>
                    {f === "message" ? (
                      <textarea
                        id={`contact-${f}`}
                        name={f}
                        rows={4}
                        value={values[f]}
                        onChange={(e) => update(f, e.target.value)}
                        aria-invalid={!!errors[f]}
                        aria-describedby={errors[f] ? `contact-${f}-error` : undefined}
                        className={cn(fieldCls, "resize-y")}
                      />
                    ) : (
                      <input
                        id={`contact-${f}`}
                        name={f}
                        type={f === "email" ? "email" : "text"}
                        autoComplete={f === "email" ? "email" : "name"}
                        value={values[f]}
                        onChange={(e) => update(f, e.target.value)}
                        aria-invalid={!!errors[f]}
                        aria-describedby={errors[f] ? `contact-${f}-error` : undefined}
                        className={fieldCls}
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-kiln transition-transform duration-500 ease-ink group-focus-within:scale-x-100"
                    />
                    {errors[f] && (
                      <p id={`contact-${f}-error`} className="mt-2 text-14 text-kiln">
                        {errors[f]}
                      </p>
                    )}
                  </div>
                ))}
                <button type="submit" className={buttonClass("primary", "group overflow-hidden")}>
                  <span
                    aria-hidden
                    className="absolute inset-0 origin-left scale-x-0 bg-aura/40 transition-transform duration-700 ease-linear group-hover:scale-x-100 group-focus-visible:scale-x-100 group-active:scale-x-100"
                  />
                  <span className="relative">{contactCopy.send}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
