"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = 72;
const EASE_OUT = "expo.out";

/** `d2`/`d3`/`d4` classes nudge a sibling's trigger window later so rows cascade. */
function delayIndex(el: Element) {
  for (let n = 4; n >= 2; n--) if (el.classList.contains(`d${n}`)) return n - 1;
  return 0;
}

function scrubbed(trigger: Element, start: string, end: string): ScrollTrigger.Vars {
  return { trigger, start, end, scrub: 0.5 };
}

/**
 * Scroll choreography for the home page. Everything is visible by default; effects are only
 * attached when the visitor has not asked for reduced motion (see the matching @media block in
 * globals.css, which lands the static end-states).
 */
export function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* ---------- Smooth scroll, driven by GSAP's ticker so triggers stay in sync ---------- */
      const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -HEADER_OFFSET } });
      lenis.on("scroll", ScrollTrigger.update);
      if (process.env.NODE_ENV !== "production") (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const all = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);

      /* ---------- Header progress hairline ---------- */
      gsap.fromTo(
        ".progress",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } },
      );

      /* ---------- Hero: both columns lift away as the next chapter arrives ---------- */
      const hero = document.getElementById("top");
      if (hero) {
        gsap.to(all(".hero-out"), {
          y: -80,
          scale: 0.96,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
        });
      }

      /* ---------- Text blocks and cards rise in ---------- */
      all(".reveal").forEach((el) => {
        const n = delayIndex(el);
        gsap.from(el, {
          y: 64,
          opacity: 0,
          ease: "none",
          scrollTrigger: scrubbed(el, `top ${96 - n * 4}%`, `top ${70 - n * 4}%`),
        });
      });

      /* ---------- Large panels scale up out of the page ---------- */
      all(".reveal-zoom").forEach((el) => {
        gsap.from(el, {
          scale: 0.88,
          opacity: 0,
          ease: "none",
          scrollTrigger: scrubbed(el, "top 98%", "top 55%"),
        });
      });

      /* ---------- Range rows: image panels open like a window ---------- */
      all(".clip-in").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(18% 12% 18% 12% round 32px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 24px)",
            ease: "none",
            scrollTrigger: scrubbed(el, "top 95%", "top 45%"),
          },
        );
      });

      all(".parallax").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, rotate: -6 },
          { y: -60, rotate: 4, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      all(".big-num").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 30 },
          { yPercent: -30, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      all(".scroll-x").forEach((el) => {
        gsap.fromTo(
          el,
          { xPercent: 4 },
          { xPercent: -34, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      /* ---------- Focal moment: the Signature box comes apart while pinned ---------- */
      const pin = document.querySelector<HTMLElement>("[data-sig-pin]");
      if (pin) {
        const q = gsap.utils.selector(pin);
        const callouts = q("[data-sig-callout]");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "center center",
            end: "+=150%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        tl.fromTo(q("[data-sig-disc]"), { scale: 0.84 }, { scale: 1, duration: 3 }, 0)
          .fromTo(q("[data-sig-box]"), { scale: 0.92 }, { scale: 1.04, duration: 10 }, 0)
          .fromTo(q("[data-sig-lid]"), { yPercent: 0 }, { yPercent: -38, ease: "power2.out", duration: 4 }, 0.5);

        callouts.forEach((c, i) => {
          const line = c.querySelector("[data-sig-line]");
          const fromRight = c.hasAttribute("data-sig-right");
          const at = 3.2 + i * 1.3;
          tl.fromTo(c, { opacity: 0, x: fromRight ? 24 : -24 }, { opacity: 1, x: 0, duration: 1, ease: EASE_OUT }, at);
          if (line) {
            tl.fromTo(
              line,
              { scaleX: 0, transformOrigin: fromRight ? "0% 50%" : "100% 50%" },
              { scaleX: 1, duration: 1 },
              at,
            );
          }
        });
        tl.to({}, { duration: 1.2 }); // hold on the finished composition before releasing the pin
      }

      // Late layout shifts (fonts, images) move trigger positions.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);

      return () => {
        window.removeEventListener("load", refresh);
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });

    return () => mm.revert();
  }, [pathname]); // each page has its own set of animated elements

  return null;
}
