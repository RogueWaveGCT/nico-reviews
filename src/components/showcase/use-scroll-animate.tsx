"use client";

import { useEffect, useRef } from "react";

export function useScrollAnimate<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function AnimateOnScroll({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useScrollAnimate<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="animate-on-scroll"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
