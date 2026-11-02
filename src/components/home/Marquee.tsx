"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductShape } from "@/components/ui/ProductShape";
import { MARQUEE_SLIDES } from "@/lib/content";
import type { MarqueeSlide } from "@/lib/content";
import styles from "./Marquee.module.css";

/** Constant drift in px/s, and how quickly velocity eases toward its target (1/s). */
const SPEED = 46;
const EASE_RATE = 3.5;
const MAX_FLICK = 3200;
/** Pointer travel before a press becomes a drag, so taps on a slide still navigate. */
const DRAG_SLOP = 6;
/** Three copies: one visible set can be shorter than a wide screen, and the seam stays off-screen. */
const COPIES = 3;

function ServiceIcon({ name }: { name: NonNullable<MarqueeSlide["icon"]> }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "pack" && (
        <>
          <path d="M4 8l8-4 8 4-8 4-8-4z" />
          <path d="M4 8v8l8 4 8-4V8" />
          <path d="M12 12v8" />
        </>
      )}
      {name === "bulk" && (
        <>
          <rect x="3" y="14" width="8" height="6" rx="1" />
          <rect x="13" y="14" width="8" height="6" rx="1" />
          <rect x="8" y="5" width="8" height="6" rx="1" />
        </>
      )}
      {name === "truck" && (
        <>
          <path d="M3 6h11v10H3z" />
          <path d="M14 10h4l3 3v3h-7" />
          <circle cx="7.5" cy="17.5" r="1.8" />
          <circle cx="17.5" cy="17.5" r="1.8" />
        </>
      )}
    </svg>
  );
}

function Slide({ slide, index, clone }: { slide: MarqueeSlide; index: number; clone: boolean }) {
  const body = (
    <>
      <span className={`${styles.thumb} ${slide.icon ? styles.thumbIcon : ""}`}>
        {slide.kind ? <ProductShape kind={slide.kind} /> : slide.icon ? <ServiceIcon name={slide.icon} /> : null}
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{slide.label}</span>
        {slide.sub && <span className={styles.sub}>{slide.sub}</span>}
      </span>
    </>
  );

  return (
    <li
      className={styles.slide}
      {...(clone ? {} : { role: "group", "aria-roledescription": "slide", "aria-label": `${index + 1} of ${MARQUEE_SLIDES.length}` })}
    >
      {slide.href ? (
        <Link href={slide.href} className={styles.chip} tabIndex={clone ? -1 : undefined} draggable={false}>
          {body}
        </Link>
      ) : (
        <span className={`${styles.chip} ${styles.static}`}>{body}</span>
      )}
    </li>
  );
}

export function Marquee() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const set = setRef.current;
    if (!viewport || !track || !set) return;
    // Reduced motion: no autoplay. CSS turns the band into a plain swipeable row.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let setWidth = set.getBoundingClientRect().width;
    const ro = new ResizeObserver(() => {
      setWidth = set.getBoundingClientRect().width;
    });
    ro.observe(set);

    let x = 0; // track offset, always within (-setWidth, 0]
    let v = -SPEED; // current velocity, px/s
    let hover = false;
    let focus = false;
    let raf = 0;
    let last = 0;
    let suppressClick = false;
    let drag: { id: number; startX: number; lastX: number; lastT: number; active: boolean } | null = null;

    const wrap = () => {
      x %= setWidth;
      if (x > 0) x -= setWidth;
    };
    const paint = () => {
      track.style.transform = `translate3d(${x}px,0,0)`;
    };

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!drag?.active && setWidth > 0) {
        const target = pausedRef.current || hover || focus ? 0 : -SPEED;
        // Ease toward the target instead of snapping: a flick glides, hover settles, resume ramps up.
        v += (target - v) * (1 - Math.exp(-dt * EASE_RATE));
        x += v * dt;
        wrap();
        paint();
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Only animate while the band is on screen.
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(viewport);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, startX: e.clientX, lastX: e.clientX, lastT: e.timeStamp, active: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.active) {
        if (Math.abs(e.clientX - drag.startX) < DRAG_SLOP) return;
        drag.active = true;
        viewport.setPointerCapture(e.pointerId); // capture only once it is a real drag, so taps still reach the link
        viewport.dataset.dragging = "true";
      }
      const dx = e.clientX - drag.lastX;
      const dts = Math.max(0.001, (e.timeStamp - drag.lastT) / 1000);
      x += dx;
      wrap();
      paint();
      v = v * 0.7 + (dx / dts) * 0.3; // smoothed release velocity
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.active) {
        suppressClick = true;
        setTimeout(() => (suppressClick = false), 0);
        v = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, v));
        viewport.releasePointerCapture(e.pointerId);
        delete viewport.dataset.dragging;
      }
      drag = null;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hover = true;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hover = false;
    };
    const onFocusIn = (e: FocusEvent) => {
      focus = true;
      const li = (e.target as HTMLElement).closest("li");
      if (!li) return;
      // Keyboard moves are instant (no animation): bring the focused slide to the centre.
      x = -(li.offsetLeft - (viewport.clientWidth - li.offsetWidth) / 2);
      v = 0;
      wrap();
      paint();
      viewport.scrollLeft = 0; // the browser may have scrolled the clipped viewport to reveal focus
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!viewport.contains(e.relatedTarget as Node | null)) focus = false;
    };

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    viewport.addEventListener("click", onClickCapture, true);
    viewport.addEventListener("pointerenter", onEnter);
    viewport.addEventListener("pointerleave", onLeave);
    viewport.addEventListener("focusin", onFocusIn);
    viewport.addEventListener("focusout", onFocusOut);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("click", onClickCapture, true);
      viewport.removeEventListener("pointerenter", onEnter);
      viewport.removeEventListener("pointerleave", onLeave);
      viewport.removeEventListener("focusin", onFocusIn);
      viewport.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <section className={styles.band} aria-roledescription="carousel" aria-label="Our range">
      <button
        type="button"
        className={styles.pause}
        aria-pressed={paused}
        aria-label={paused ? "Play carousel" : "Pause carousel"}
        onClick={() => {
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
        }}
      >
        {paused ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M4 2.5v11l9.5-5.5z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="3" y="2.5" width="3.4" height="11" rx="1" />
            <rect x="9.6" y="2.5" width="3.4" height="11" rx="1" />
          </svg>
        )}
      </button>
      <div ref={viewportRef} className={styles.viewport}>
        <div ref={trackRef} className={styles.track}>
          {Array.from({ length: COPIES }, (_, copy) => (
            <ul key={copy} ref={copy === 0 ? setRef : undefined} className={styles.set} {...(copy > 0 ? { "aria-hidden": true } : {})}>
              {MARQUEE_SLIDES.map((slide, i) => (
                <Slide key={slide.label} slide={slide} index={i} clone={copy > 0} />
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
