"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/utils";

/** Animated number count-up for metric cards. Respects reduced motion. */
export function CountUp({
  value,
  decimals = 2,
  duration = 900,
}: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return <span>{formatNumber(display, decimals)}</span>;
}
