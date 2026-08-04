import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) inView.current = true;
      },
      { threshold: 0.3 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Animate whenever the value changes; if not yet in view, snap immediately.
    let raf = 0;
    const from = 0;
    const to = value;
    const dur = 1400;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    if (inView.current || typeof IntersectionObserver === "undefined") {
      raf = requestAnimationFrame(tick);
    } else {
      // Poll for visibility briefly so first render animates when it scrolls in.
      const id = window.setInterval(() => {
        if (inView.current) {
          window.clearInterval(id);
          raf = requestAnimationFrame(tick);
        }
      }, 100);
      return () => {
        window.clearInterval(id);
        if (raf) cancelAnimationFrame(raf);
      };
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}
