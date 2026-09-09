"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Depth and 3D helpers.
 *
 * Everything here uses CSS 3D transforms rather than WebGL: real perspective
 * and real z-depth, but no extra runtime, no canvas, and text stays selectable
 * and accessible. Pointer maths is written straight to CSS custom properties or
 * motion values so moving the mouse never re-renders React.
 */

// ---------------------------------------------------------------------------
// Tilt3D — card that leans toward the cursor
// ---------------------------------------------------------------------------

export function Tilt3D({
  children,
  className,
  max = 9,
  lift = 14,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees on each axis. */
  max?: number;
  /** How far the content pops toward the viewer, in px. */
  lift?: number;
  glare?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useMotionValue(0);

  const spring = { stiffness: 220, damping: 24, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const glareOpacity = useSpring(active, { stiffness: 180, damping: 26 });

  const glareBg = useTransform(
    [px, py] as never,
    ([x, y]: number[]) =>
      `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.35), transparent 60%)`,
  );

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div className={cn("[perspective:1200px]", className)}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={() => active.set(1)}
        onPointerLeave={() => {
          active.set(0);
          px.set(0.5);
          py.set(0.5);
        }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {/* Children are pushed forward in Z so they visibly sit above the
            card face as it rotates — this is what sells the depth. */}
        <div style={{ transform: `translateZ(${lift}px)`, transformStyle: "preserve-3d" }} className="h-full">
          {children}
        </div>

        {glare && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
            style={{ background: glareBg, opacity: glareOpacity, transform: "translateZ(1px)" }}
          />
        )}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PointerGlow — soft light that follows the cursor across a section
// ---------------------------------------------------------------------------

export function PointerGlow({
  className,
  size = 560,
  color = "var(--brand)",
  strength = 0.16,
}: {
  className?: string;
  size?: number;
  color?: string;
  strength?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = host.getBoundingClientRect();
        el.style.setProperty("--gx", `${e.clientX - r.left}px`);
        el.style.setProperty("--gy", `${e.clientY - r.top}px`);
        el.style.setProperty("--on", "1");
      });
    };
    const onLeave = () => el.style.setProperty("--on", "0");

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={
        {
          "--gx": "50%",
          "--gy": "40%",
          "--on": "0",
          opacity: "var(--on)",
          transition: "opacity 450ms ease",
          background: `radial-gradient(${size}px circle at var(--gx) var(--gy), color-mix(in oklab, ${color} ${strength * 100}%, transparent), transparent 70%)`,
        } as React.CSSProperties
      }
    />
  );
}

// ---------------------------------------------------------------------------
// FloatingShapes — parallax depth layer
// ---------------------------------------------------------------------------

/**
 * Soft blurred shapes at three depths. Each layer takes a different parallax
 * factor from the section's own scroll progress, so the background gains real
 * perceptible depth without a single image.
 *
 * Takes a plain 0..1 number rather than a MotionValue so it shares the
 * scroll-listener path used elsewhere instead of framer's rAF loop.
 */
export function FloatingShapes({ progress = 0 }: { progress?: number }) {
  const reduced = useReducedMotion();
  const p = reduced ? 0 : progress;

  const layers = [
    { depth: 8, cls: "-left-32 top-[6%] h-[26rem] w-[26rem]", tint: "var(--brand-soft)", op: 0.9 },
    { depth: 22, cls: "right-[-12%] top-[28%] h-[20rem] w-[20rem]", tint: "var(--sand)", op: 0.8 },
    { depth: 40, cls: "left-[38%] bottom-[-14%] h-[16rem] w-[16rem]", tint: "var(--brand-soft)", op: 0.75 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {layers.map((l, i) => (
        <div
          key={i}
          className={cn("absolute rounded-full blur-[70px] will-change-transform", l.cls)}
          style={{
            opacity: l.op,
            background: `radial-gradient(circle, ${l.tint} 0%, transparent 70%)`,
            transform: `translate3d(0, ${p * l.depth}%, 0)`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScrollScrubbed helpers
// ---------------------------------------------------------------------------

/**
 * Reads a section's scroll progress with a plain scroll listener.
 *
 * framer's useScroll publishes inside a requestAnimationFrame loop, which the
 * browser suspends in background tabs; a listener plus one getBoundingClientRect
 * is synchronous and always reflects the true position.
 */
export function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let queued = false;
    const measure = () => {
      queued = false;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      if (travel <= 0) {
        setProgress(0);
        return;
      }
      const p = Math.min(1, Math.max(0, -r.top / travel));
      setProgress((prev) => (Math.abs(prev - p) < 0.002 ? prev : p));
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);

  return progress;
}

// ---------------------------------------------------------------------------
// MeshGradient — the banner's colour field
// ---------------------------------------------------------------------------

type Blob = {
  cls: string;
  tint: string;
  anim: string;
  /** Parallax weight: how strongly this blob answers the pointer. */
  depth: number;
  opacity: number;
};

const BLOBS: Blob[] = [
  { cls: "-left-[14%] -top-[22%] h-[46rem] w-[46rem]", tint: "var(--mesh-1)", anim: "mesh-a", depth: 1.0, opacity: 0.62 },
  { cls: "-right-[16%] -top-[14%] h-[42rem] w-[42rem]", tint: "var(--mesh-2)", anim: "mesh-b", depth: 1.5, opacity: 0.5 },
  { cls: "left-[24%] bottom-[-30%] h-[40rem] w-[40rem]", tint: "var(--mesh-3)", anim: "mesh-c", depth: 2.1, opacity: 0.42 },
  { cls: "right-[6%] bottom-[-24%] h-[34rem] w-[34rem]", tint: "var(--mesh-4)", anim: "mesh-d", depth: 1.7, opacity: 0.46 },
  { cls: "left-[42%] top-[-18%] h-[30rem] w-[30rem]", tint: "var(--mesh-5)", anim: "mesh-b", depth: 2.6, opacity: 0.4 },
];

/**
 * Animated, pointer-reactive colour mesh for the banner.
 *
 * Five vivid blooms drift on independent paths and each answers the pointer
 * with a different weight, so moving the mouse parallaxes the field rather
 * than sliding it as one sheet. The pointer position is written once to two
 * CSS custom properties on the container and the blobs read it from there —
 * React never re-renders, and the drift animations keep running because the
 * parallax lives inside the same `transform` the keyframes compose with.
 */
export function MeshGradient({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = host.getBoundingClientRect();
        // Normalised to -1..1 so blobs can lean either way from centre.
        el.style.setProperty("--px", String(((e.clientX - r.left) / r.width) * 2 - 1));
        el.style.setProperty("--py", String(((e.clientY - r.top) / r.height) * 2 - 1));
      });
    };
    const onLeave = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("mesh-grain pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ "--px": "0", "--py": "0" } as React.CSSProperties}
    >
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className={cn("absolute rounded-full blur-[90px] will-change-transform", b.cls, b.anim)}
          style={
            {
              // Each blob scales the shared pointer offset by its own depth,
              // which is what produces parallax instead of a flat shift.
              "--px": `calc(var(--px, 0) * ${b.depth})`,
              "--py": `calc(var(--py, 0) * ${b.depth})`,
              background: `radial-gradient(circle, ${b.tint} 0%, transparent 68%)`,
              opacity: b.opacity,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Softens the whole field into the page ground at the bottom edge. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--page)] to-transparent" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScrollStage — a viewport-pinned stage driven by scroll position
// ---------------------------------------------------------------------------

/**
 * A tall spacer whose inner stage pins to the viewport, so scrolling advances
 * the *content* rather than moving the page. The reference site does this with
 * `position: fixed` over a 38-viewport-tall document; sticky achieves the same
 * pinning while staying scoped to its own section, which keeps the rest of the
 * page (and the browser's scroll restoration) behaving normally.
 *
 * `pages` is how many viewport-heights of scroll the stage should consume.
 */
export function ScrollStage({
  pages = 3,
  className,
  children,
}: {
  pages?: number;
  className?: string;
  children: (progress: number) => React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(ref);

  return (
    <div ref={ref} style={{ height: `${pages * 100}vh` }} className={cn("relative", className)}>
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        {children(progress)}
      </div>
    </div>
  );
}

/**
 * Positions one item of a 3D coverflow.
 *
 * `offset` is the item's signed distance from the active index. Everything is
 * derived from it: lateral travel, depth, rotation, fade and stacking order —
 * so the whole arrangement stays consistent no matter how many items there are.
 */
export function coverflowStyle(
  offset: number,
  opts: { spacing?: number; depth?: number; angle?: number; dir?: 1 | -1 } = {},
): React.CSSProperties {
  const { spacing = 340, depth = 260, angle = 38, dir = 1 } = opts;
  const abs = Math.abs(offset);
  // Rotation eases off past the neighbours so distant cards don't end up
  // edge-on and invisible.
  const rot = Math.max(-1, Math.min(1, offset)) * angle;

  return {
    transform: [
      `translate3d(${dir * offset * spacing}px, 0, ${-abs * depth}px)`,
      `rotateY(${-dir * rot}deg)`,
      `scale(${Math.max(0.7, 1 - abs * 0.08)})`,
    ].join(" "),
    opacity: abs > 2.6 ? 0 : Math.max(0, 1 - abs * 0.3),
    zIndex: Math.round(100 - abs * 10),
    pointerEvents: abs < 0.5 ? "auto" : "none",
  };
}
