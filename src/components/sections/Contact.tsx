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
import { haptic } from "@/lib/haptics";
import { impactFrame } from "@/lib/impact";
import { Magnetic } from "@/components/motion/Magnetic";
import {
  BrushLine,
  EmailCopy,
  FieldCrack,
  inkDrop,
  LinkScroll,
  OrbitSocials,
  PowerMeter,
  Radar,
  RuneSeal,
} from "./contact/ContactParts";
import { Crow, DriftingLetters, Envelope, Feathers, Pillar, SuccessComic } from "./contact/SendFx";

/** Round to 2 decimals so server and browser render identical SVG numbers. */
const r2 = (n: number) => Math.round(n * 100) / 100;

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
  const drops = useRef<HTMLDivElement>(null);
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

  const socials = [profile.links.github, profile.links.linkedin, ...profile.links.others];

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    const heading = q("h2")[0];
    const split = heading ? SplitText.create(heading, { type: "words,chars" }) : null;
    const seen = el.getBoundingClientRect().top < window.innerHeight * 0.7;
    if (!seen) gsap.set(q("[data-final]"), { autoAlpha: 1 });
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true } })
      // "Final chapter" title card, then it turns away like a page
      .fromTo(
        q("[data-final-text]"),
        { scale: 1.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "steps(4)" },
      )
      .to(
        q("[data-final]"),
        {
          rotationX: -100,
          transformOrigin: "50% 0%",
          transformPerspective: 1600,
          duration: 0.6,
          ease: "power2.in",
        },
        "+=0.5",
      )
      .set(q("[data-final]"), { autoAlpha: 0 })
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
      )
      // the speech bubble types itself out
      .from(q("[data-bubble-ch]"), { opacity: 0, duration: 0.01, stagger: 0.035 }, "-=0.2");
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

  const deliver = () => {
    const el = ref.current;
    const form = formRef.current;
    const done = () => {
      setSent(true);
      window.setTimeout(() => {
        sound.play("stamp");
        finisher();
        impactFrame(1);
      }, 60);
    };
    if (!el || !form || prefersReducedMotion()) return done();
    const q = gsap.utils.selector(el);
    const env = q("[data-envelope]")[0] as HTMLElement | undefined;
    const crow = q("[data-crow]")[0] as HTMLElement | undefined;
    if (!env || !crow) return done();
    const flap = gsap.to(q("[data-wing]"), {
      rotation: (i: number) => (i ? -28 : 24),
      duration: 0.12,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    const tl = gsap.timeline({
      onComplete: () => {
        flap.kill();
        gsap.set([env, crow, ...q("[data-feather]")], { clearProps: "all" });
        gsap.set(q("[data-pillar]"), { scaleY: 0, opacity: 0 });
        done();
      },
    });
    tl.to(form, {
      scaleX: 0.55,
      scaleY: 0.25,
      opacity: 0,
      duration: 0.45,
      ease: "power2.in",
      transformOrigin: "50% 50%",
    })
      .fromTo(
        env,
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" },
        0.35,
      )
      .fromTo(
        q("[data-wax]"),
        { scale: 2.4, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.2,
          ease: "steps(3)",
          onStart: () => sound.play("stamp"),
        },
        0.75,
      )
      .fromTo(
        q("[data-pillar]"),
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
        0.6,
      )
      .to(q("[data-pillar]"), { opacity: 0, duration: 0.6 }, 1.8)
      .call(
        () => {
          // the crow swoops in from the top-left to the letter
          const r = env.getBoundingClientRect();
          gsap.set(crow, { x: -220, y: r.top - 260, opacity: 1, rotation: 12 });
          gsap.to(crow, {
            x: r.left + r.width / 2 - 90,
            y: r.top - 70,
            rotation: 0,
            duration: 0.55,
            ease: "power2.in",
          });
        },
        [],
        1.0,
      )
      .call(
        () => {
          // grab: feathers fall, then both fly off to the top-right
          const r = env.getBoundingClientRect();
          q("[data-feather]").forEach((f, k) => {
            gsap.fromTo(
              f,
              {
                x: r.left + r.width / 2 + (k - 1.5) * 18,
                y: r.top - 10,
                opacity: 0.9,
                rotation: k * 40,
              },
              {
                y: `+=${120 + k * 30}`,
                x: `+=${(k % 2 ? 1 : -1) * 30}`,
                rotation: `+=${180}`,
                opacity: 0,
                duration: 1.4,
                ease: "power1.in",
              },
            );
          });
          sound.play("slash");
          const dx = window.innerWidth;
          const dy = -window.innerHeight * 0.9;
          gsap.to(crow, {
            x: `+=${dx}`,
            y: `+=${dy}`,
            scale: 0.5,
            duration: 0.85,
            ease: "power2.in",
          });
          gsap.to(env, {
            x: dx,
            y: dy,
            scale: 0.35,
            rotation: -20,
            duration: 0.85,
            ease: "power2.in",
          });
        },
        [],
        1.6,
      )
      .to({}, { duration: 0.9 }, 1.6);
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
        (Object.keys(found) as Field[]).forEach((f) => {
          const wrap = formRef.current?.querySelector<HTMLElement>(`[data-field="${f}"]`);
          if (!wrap) return;
          gsap.fromTo(
            wrap.querySelectorAll("[data-field-crack]"),
            { drawSVG: "0%", opacity: 1 },
            {
              keyframes: [
                { drawSVG: "100%", duration: 0.25 },
                { opacity: 0, duration: 0.5, delay: 1.2 },
              ],
              stagger: 0.08,
            },
          );
          wrap.animate(
            [
              { translate: "0 0" },
              { translate: "-5px 0" },
              { translate: "5px 0" },
              { translate: "-3px 0" },
              { translate: "0 0" },
            ],
            { duration: 380 },
          );
        });
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
      // The send button fires and the panel is cut; the form folds into a
      // sealed letter, a pillar of light rises from the grimoire and a crow
      // carries the letter away; then the success strip plays.
      burst();
      setCast((c) => c + 1);
      cut();
      haptic("send");
      deliver();
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
      <DriftingLetters />
      {/* "Final chapter" title card that turns away as the section opens */}
      <div
        aria-hidden
        data-final
        className="pointer-events-none invisible absolute inset-x-0 top-0 z-40 grid h-[100svh] place-items-center bg-[#ebdcb9] text-[#1d1614]"
      >
        <div className="absolute inset-4 border-[3px] border-[#1d1614] md:inset-8" />
        <p data-final-text className="font-display text-[clamp(3rem,11vw,9rem)] leading-none">
          {contactCopy.finalChapter}
        </p>
      </div>
      <Crow />
      <Feathers />
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
                <Radar />
                {profile.availability}
              </p>
            )}

            <div data-contact-rise className="relative my-6 md:my-10">
              <Pillar />
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
            <div data-contact-rise className="mt-3 border-y-2 border-washi/15">
              <EmailCopy />
            </div>
            <div className="mt-4 grid items-center gap-6 sm:grid-cols-[1fr_auto]">
              <ul className="space-y-1">
                {socials.map((l) => (
                  <li key={l.href} data-contact-rise>
                    <LinkScroll label={l.label} href={l.href} />
                  </li>
                ))}
              </ul>
              <div data-contact-rise>
                <OrbitSocials links={socials} />
              </div>
            </div>
          </div>

          <div className="self-start">
            <div data-contact-rise className="relative mb-8 ml-auto w-fit max-w-sm">
              <p className="relative rounded-[50%] border-[3px] border-[#1d1614] bg-[#ebdcb9] px-7 py-4 text-center text-18 font-bold text-[#1d1614] [text-shadow:none]">
                <span className="sr-only">{contactCopy.bubble}</span>
                <span aria-hidden>
                  {Array.from(contactCopy.bubble).map((ch, i) => (
                    <span key={i} data-bubble-ch>
                      {ch}
                    </span>
                  ))}
                </span>
              </p>
              <svg aria-hidden viewBox="0 0 20 18" className="absolute -bottom-[13px] left-12 w-5">
                <path d="M1 0 L19 0 L5 17 Z" fill="#ebdcb9" />
                <path d="M1 1 L5 17 L19 1" fill="none" stroke="#1d1614" strokeWidth="3" />
              </svg>
            </div>
            <div
              data-contact-rise
              className="relative border-[3px] border-washi bg-[linear-gradient(160deg,var(--twilight),var(--sumi)_70%)] p-6 md:p-10"
            >
              <Envelope />
              <div ref={drops} aria-hidden className="pointer-events-none absolute inset-0 z-20" />
              {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map(
                (pos) => (
                  <span
                    key={pos}
                    aria-hidden
                    className={cn("absolute size-2.5 rotate-45 border-2 border-aura", pos)}
                  />
                ),
              )}
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
                      x1={r2(Math.cos(a) * 18)}
                      y1={r2(Math.sin(a) * 18)}
                      x2={r2(Math.cos(a) * (60 + (i % 3) * 18))}
                      y2={r2(Math.sin(a) * (60 + (i % 3) * 18))}
                      stroke={i % 2 ? "var(--kiln)" : "var(--agni)"}
                      strokeWidth={i % 3 ? 2 : 4}
                      strokeLinecap="round"
                      opacity="0"
                    />
                  );
                })}
              </svg>

              {sent ? (
                <div
                  role="status"
                  className="relative grid min-h-80 place-items-center text-center"
                >
                  <MagicCircle trigger="mount" className="absolute size-72 opacity-50" />
                  <p
                    aria-hidden
                    className="absolute -top-2 right-0 sfx animate-[stamp-in_0.5s_steps(4)_both] border-[3px] border-kiln px-3 py-1 text-36 text-kiln [-webkit-text-stroke:0]"
                  >
                    {contactCopy.stamp}
                  </p>
                  <div className="relative">
                    <SuccessComic />
                    <p className="mt-6 font-display text-56">{contactCopy.successTitle}</p>
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
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                      setFocused(false);
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
                    <div key={f} data-field={f} className="group relative">
                      <label htmlFor={`contact-${f}`} className="text-14 text-muted">
                        {contactCopy[f]}
                      </label>
                      <RuneSeal
                        i={["name", "email", "message"].indexOf(f)}
                        on={
                          f === "name"
                            ? !!values.name.trim()
                            : f === "email"
                              ? EMAIL.test(values.email.trim())
                              : values.message.trim().length >= 10
                        }
                      />
                      {f === "message" ? (
                        <textarea
                          id={`contact-${f}`}
                          name={f}
                          rows={4}
                          value={values[f]}
                          onChange={(e) => {
                            update(f, e.target.value);
                            inkDrop(e.target, drops.current);
                          }}
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
                          onChange={(e) => {
                            update(f, e.target.value);
                            inkDrop(e.target, drops.current);
                          }}
                          aria-invalid={!!errors[f]}
                          aria-describedby={errors[f] ? `contact-${f}-error` : undefined}
                          className={fieldCls}
                        />
                      )}
                      <div className="relative">
                        <BrushLine
                          length={values[f].trim().length}
                          target={f === "message" ? 10 : f === "email" ? 24 : 12}
                        />
                        <FieldCrack />
                      </div>
                      {f === "message" && <PowerMeter length={values.message.trim().length} />}
                      {errors[f] && (
                        <p id={`contact-${f}-error`} className="mt-2 text-14 text-kiln">
                          {errors[f]}
                        </p>
                      )}
                    </div>
                  ))}
                  <Magnetic strength={charge === 3 ? 0.45 : 0} radius={120}>
                    <button
                      type="submit"
                      disabled={sending}
                      aria-busy={sending}
                      className={buttonClass(
                        "primary",
                        cn(
                          "group overflow-hidden disabled:opacity-70",
                          charge === 3 && "shadow-[0_0_18px_var(--aura),5px_5px_0_0_var(--agni)]",
                        ),
                      )}
                    >
                      {charge === 3 && (
                        <svg
                          aria-hidden
                          viewBox="0 0 100 40"
                          preserveAspectRatio="none"
                          className="pointer-events-none absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] animate-[bolt-flicker_0.18s_steps(2)_infinite] overflow-visible motion-reduce:animate-none"
                        >
                          <polyline
                            points="2,8 12,14 8,20 18,30"
                            fill="none"
                            stroke="var(--aura)"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                          />
                          <polyline
                            points="98,6 88,16 94,22 84,34"
                            fill="none"
                            stroke="var(--aura)"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                          />
                          <polyline
                            points="40,0 46,6 52,2"
                            fill="none"
                            stroke="var(--kiln)"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      )}
                      <span
                        aria-hidden
                        className="absolute inset-0 origin-left scale-x-0 bg-aura/40 transition-transform duration-700 ease-linear group-hover:scale-x-100 group-focus-visible:scale-x-100 group-active:scale-x-100"
                      />
                      <span className="relative">
                        {sending ? contactCopy.sending : contactCopy.send}
                      </span>
                    </button>
                  </Magnetic>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
