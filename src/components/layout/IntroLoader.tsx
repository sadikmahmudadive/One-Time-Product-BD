"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import styles from "./IntroLoader.module.css";

type Phase = "on" | "leaving" | "gone";

const LEAVE_MS = 1000;
const HOLD_MS = 1200;

function setIntro(value: "on" | "go") {
  document.documentElement.dataset.intro = value;
}

export function IntroLoader() {
  const [phase, setPhase] = useState<Phase>("on");
  const [pct, setPct] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const leave = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const phaseRef = useRef<Phase>("on");

  const enter = useCallback(() => {
    if (phaseRef.current !== "on") return;
    phaseRef.current = "leaving";
    clearInterval(tick.current);
    clearTimeout(hold.current);
    setPhase("leaving");
    setIntro("go");
    leave.current = setTimeout(() => {
      phaseRef.current = "gone";
      setPhase("gone");
    }, LEAVE_MS);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      phaseRef.current = "gone";
      setPhase("gone");
      setPct(100);
      setIntro("go");
      return;
    }
    let value = 0;
    tick.current = setInterval(() => {
      value = Math.min(100, value + 2 + Math.round(Math.random() * 5));
      setPct(value);
      if (value >= 100) {
        clearInterval(tick.current);
        hold.current = setTimeout(enter, HOLD_MS);
      }
    }, 40);
    return () => {
      clearInterval(tick.current);
      clearTimeout(hold.current);
      clearTimeout(leave.current);
    };
  }, [enter]);

  if (phase === "gone") return null;

  const loaded = pct >= 100;

  return (
    <div
      className={`loader ${styles.loader} ${phase === "leaving" ? styles.out : ""}`}
      role="status"
      aria-label="Loading"
    >
      <div className={styles.top}>
        <Logo tone="dark" knockout="var(--brand-950)" size={26} />
        <button type="button" className={`btn btn-ghost ${styles.skip}`} onClick={enter}>
          Skip the introduction
        </button>
      </div>
      <div>
        <p className="eyebrow" style={{ color: "var(--accent-500)" }}>
          Food packaging · Bangladesh
        </p>
        <p className={styles.tagline}>
          Packaging that lets your food{" "}
          <span className="it" style={{ color: "var(--accent-500)" }}>
            do the talking.
          </span>
        </p>
      </div>
      <div>
        <div className={styles.meterRow}>
          <p className={styles.pct}>
            {pct < 10 ? "0" : ""}
            {pct}
            <span>%</span>
          </p>
          {loaded && (
            <button type="button" className="btn btn-lime" onClick={enter}>
              Enter site
              <ArrowRightIcon />
            </button>
          )}
        </div>
        <div className={styles.track}>
          <div className={styles.bar} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
