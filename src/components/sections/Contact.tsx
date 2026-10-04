"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { sound } from "@/lib/sound";
import { contactCopy, profile, sections, sfxCopy } from "@/content";
import { MangaBackdrop } from "@/components/motion/MangaBackdrop";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { ImpactWord, type ImpactWordHandle } from "@/components/motion/ImpactWord";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { Grimoire } from "./contact/Grimoire";
import { buttonClass } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BASE_FOCUS = 0.18;

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
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [turn, setTurn] = useState(0);
  const [cast, setCast] = useState(0);
  const typed = useRef(0);
  const scene = useRef<HTMLDivElement>(null);
  const [focusLines, setFocusLines] = useState(BASE_FOCUS);

  // Manga focus lines surge on a hit, then settle.
  const surge = (level: number) => setFocusLines((f) => Math.max(f, level));
  useEffect(() => {
    if (focusLines <= BASE_FOCUS) return;
    const t = window.setTimeout(() => setFocusLines(BASE_FOCUS), 420);
    return () => window.clearTimeout(t);
  }, [focusLines]);

  // Panel shake on impacts (skipped under reduced motion).
  const shake = (strength = 1) => {
    if (prefersReducedMotion() || !scene.current) return;
    const a = 6 * strength;
    gsap.fromTo(
      scene.current,
      { x: a, y: -a * 0.6 },
      { x: 0, y: 0, duration: 0.45, ease: "elastic.out(1.2, 0.25)", clearProps: "transform" },
    );
  };
  const word = useRef<ImpactWordHandle>(null);
  const lastBurst = useRef(0);
  const charge =
    Number(!!values.name.trim()) +
    Number(EMAIL.test(values.email.trim())) +
    Number(values.message.trim().length >= 10);
  const bookOpen = focused || sent || Object.values(values).some((v) => v.trim());

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
    const split = heading ? SplitText.create(heading, { type: "words,chars" }) : null;
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
      .call(() => {
        surge(0.85);
        shake(1);
        word.current?.play(sfxCopy.slam, 32, 16);
      })
      .from(
        q("[data-contact-rise]"),
        { y: 30, opacity: 0, duration: 0.6, stagger: 0.07, ease: "ink" },
        "-=0.1",
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

  // A dimension slash cuts across the form panel when the message is sent.
  const cut = () => {
    if (prefersReducedMotion()) return;
    const line = formRef.current?.parentElement?.querySelector("[data-cut]");
    if (!line) return;
    gsap
      .timeline()
      .fromTo(
        line,
        { drawSVG: "0% 0%", opacity: 1 },
        { drawSVG: "0% 100%", duration: 0.22, ease: "power2.in" },
      )
      .to(line, { drawSVG: "100% 100%", opacity: 0, duration: 0.35, ease: "power2.out" });
  };

  // Finishing move: a slash across the whole battlefield, the flame side wins.
  const finisher = () => {
    surge(1);
    shake(1.2);
    word.current?.play(sfxCopy.strike, 62, 40);
    if (prefersReducedMotion()) return;
    const line = scene.current?.querySelector("[data-finisher]");
    if (!line) return;
    gsap
      .timeline()
      .fromTo(
        line,
        { drawSVG: "0% 0%", opacity: 1 },
        { drawSVG: "0% 100%", duration: 0.18, ease: "power3.in" },
      )
      .to(line, { drawSVG: "100% 100%", opacity: 0, duration: 0.45, ease: "power2.out" });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setFailed(false);
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
    setSending(true);
    try {
      const trap =
        formRef.current?.querySelector<HTMLInputElement>('[name="company"]')?.value ?? "";
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: trap }),
      });
      if (!res.ok) throw new Error(String(res.status));
      burst();
      setCast((c) => c + 1);
      cut();
      window.setTimeout(() => sound.play("stamp"), 450);
      finisher();
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    // The moment the circle becomes fully charged, the focus lines surge.
    const chargeOf = (v: Record<Field, string>) =>
      Number(!!v.name.trim()) +
      Number(EMAIL.test(v.email.trim())) +
      Number(v.message.trim().length >= 10);
    if (chargeOf(next) === 3 && chargeOf(values) < 3) {
      surge(0.7);
      word.current?.play(sfxCopy.clash, 50, 30);
    }
    setValues(next);
    // flip a page of the grimoire every dozen characters
    const total = Object.values(next).join("").length;
    if (Math.floor(total / 12) > typed.current) setTurn((t) => t + 1);
    typed.current = Math.floor(total / 12);
    if (tried) setErrors(validate(next));
    // typing pulls the focus lines in
    lastBurst.current += 1;
    if (lastBurst.current % 2 === 0) surge(0.42);
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
      {/* A manga page: ruled panel gutters, developing screentone, focus lines on the form */}
      <MangaBackdrop layout="contact" className="absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-full text-washi/25 lg:w-[62%]"
      >
        <SpeedLines variant="radial" intensity={focusLines} />
      </div>

      <div ref={scene} className="relative [text-shadow:0_2px_14px_var(--sumi)]">
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -inset-10 z-30 h-[calc(100%+5rem)] w-[calc(100%+5rem)] overflow-visible"
        >
          <line
            data-finisher
            x1="-5"
            y1="95"
            x2="105"
            y2="5"
            stroke="var(--washi)"
            strokeWidth="6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0"
            className="[filter:drop-shadow(0_0_10px_var(--kiln))_drop-shadow(0_0_24px_var(--agni))]"
          />
        </svg>
        <ImpactWord ref={word} className="text-96" />
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

            <div data-contact-rise className="my-6 md:my-10">
              <Grimoire
                open={bookOpen}
                charge={charge}
                turn={turn}
                cast={cast}
                className="h-80 md:h-96"
              />
              <p className="text-center text-14 text-muted">{contactCopy.charge(charge)}</p>
            </div>

            <p data-contact-rise className="text-14 text-muted">
              {contactCopy.directLabel}
            </p>
            <ul className="mt-3 divide-y-2 divide-washi/15 border-y-2 border-washi/15">
              {links.map((l) => (
                <li key={l.href} data-contact-rise>
                  <a
                    href={l.href}
                    className="group/link relative flex items-center gap-4 overflow-hidden py-3 font-display text-18 break-all transition-colors hover:text-kiln sm:text-24 2xl:text-36"
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rotate-45 border-2 border-aura transition-[background-color,rotate] duration-300 group-hover/link:rotate-[225deg] group-hover/link:bg-aura"
                    />
                    <span className="relative group-hover/link:animate-[ink-jitter_0.18s_steps(2)_2]">
                      {l.label}
                    </span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 -right-2 -left-2 h-[2px] origin-left scale-x-0 -rotate-[4deg] bg-kiln opacity-0 shadow-[0_0_6px_var(--kiln)] group-hover/link:animate-[slash-through_0.5s_var(--ease-snap)_forwards]"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-contact-rise
            className="relative self-start border-[3px] border-washi bg-[linear-gradient(160deg,var(--twilight),var(--sumi)_70%)] p-6 md:p-10"
          >
            {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
              <span
                key={pos}
                aria-hidden
                className={cn("absolute size-2.5 rotate-45 border-2 border-aura", pos)}
              />
            ))}
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
            >
              <line
                data-cut
                x1="-8"
                y1="92"
                x2="108"
                y2="8"
                stroke="var(--kiln)"
                strokeWidth="4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity="0"
                className="[filter:drop-shadow(0_0_8px_var(--kiln))]"
              />
            </svg>
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
                <p
                  aria-hidden
                  className="absolute -top-2 right-0 sfx animate-[stamp-in_0.5s_steps(4)_both] border-[3px] border-kiln px-3 py-1 text-36 text-kiln [-webkit-text-stroke:0]"
                >
                  {contactCopy.stamp}
                </p>
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
              <form
                ref={formRef}
                noValidate
                onSubmit={onSubmit}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
                }}
                className="relative space-y-7"
              >
                <p className="font-display text-24">{contactCopy.formTitle}</p>
                {Object.keys(errors).length > 0 && (
                  <p role="alert" className="text-18 text-kiln">
                    {contactCopy.errorSummary}
                  </p>
                )}
                {failed && (
                  <p role="alert" className="text-18 text-kiln">
                    {contactCopy.failed}{" "}
                    <a href={`mailto:${profile.email}`} className="ink-link">
                      {profile.email}
                    </a>
                    .
                  </p>
                )}
                {/* Honeypot: hidden from people, filled by bots. */}
                <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
                  <label>
                    Company
                    <input name="company" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
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
                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className={buttonClass("primary", "group overflow-hidden disabled:opacity-70")}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 origin-left scale-x-0 bg-aura/40 transition-transform duration-700 ease-linear group-hover:scale-x-100 group-focus-visible:scale-x-100 group-active:scale-x-100"
                  />
                  <span className="relative">
                    {sending ? contactCopy.sending : contactCopy.send}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
