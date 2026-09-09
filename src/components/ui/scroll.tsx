"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";

/** motion props with `children` narrowed back to plain ReactNode. */
type DivMotionProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
};

type Direction = "up" | "left" | "right" | "none";

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Scroll-triggered reveal.
 *
 * When reduced motion is on it renders a plain div rather than animating from
 * opacity 0 — an unconditional `initial={{opacity:0}}` leaves content
 * permanently invisible for those users if the animation is stripped.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
  ...props
}: DivMotionProps & { direction?: Direction; delay?: number; duration?: number }) {
  const reduced = useReducedMotion();
  const { x, y } = OFFSET[direction];

  if (reduced) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Staggers its <RevealItem> children as the group scrolls into view. */
export function RevealGroup({
  children,
  delay = 0,
  stagger = 0.07,
  className,
  ...props
}: DivMotionProps & { delay?: number; stagger?: number }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Reveal item with an optional 3D entrance: the card tips up from a reclined
 * position as it scrolls in. Needs a `perspective` on an ancestor to read as
 * depth rather than a vertical squash.
 */
export function RevealItem({
  children,
  className,
  depth = false,
  ...props
}: DivMotionProps & { depth?: boolean }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={
        depth
          ? {
              hidden: { opacity: 0, y: 40, rotateX: -22, z: -160 },
              show: {
                opacity: 1,
                y: 0,
                rotateX: 0,
                z: 0,
                transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
              },
            }
          : {
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }
      }
      style={depth ? { transformStyle: "preserve-3d" } : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Counts up to `to` when scrolled into view.
 * Reduced motion shows the final value immediately.
 */
export function CountUp({
  to,
  suffix = "",
  decimals = 0,
  className,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [value, setValue] = React.useState(0);

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });

  React.useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);

  React.useEffect(() => spring.on("change", (v) => setValue(v)), [spring]);

  const shown = reduced ? to : inView ? value : 0;
  const text = shown.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {text}
      {suffix}
    </span>
  );
}

/**
 * Seamless horizontal marquee. Children render twice and the track shifts by
 * exactly half its width, so the loop has no visible seam. Pauses on hover;
 * direction flips under RTL via globals.css.
 */
export function Marquee({
  children,
  speed = 40,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("marquee-host relative w-full overflow-hidden", className)}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="marquee-track flex w-max items-center"
        style={{ "--marquee-duration": `${speed}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
