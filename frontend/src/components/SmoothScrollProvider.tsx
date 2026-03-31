"use client";
import { useEffect, useRef } from "react";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<unknown>(null);

  useEffect(() => {
    let raf: number;

    const initLenis = async () => {
      const Lenis = (await import("lenis")).default;

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      lenisRef.current = lenis;

      function onRaf(time: number) {
        lenis.raf(time);
        raf = requestAnimationFrame(onRaf);
      }

      raf = requestAnimationFrame(onRaf);
    };

    initLenis();

    return () => {
      cancelAnimationFrame(raf);
      if (lenisRef.current) {
        (lenisRef.current as { destroy: () => void }).destroy();
      }
    };
  }, []);

  return <>{children}</>;
}
