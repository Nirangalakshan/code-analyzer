"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "inherit",
});

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      mermaid.contentLoaded();
      mermaid.render("mermaid-diagram", chart).then((result) => {
        if (ref.current) {
          ref.current.innerHTML = result.svg;
        }
      });
    }
  }, [chart]);

  return (
    <div className="flex justify-center p-4 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
      <div
        key={chart}
        ref={ref}
        className="mermaid w-full flex justify-center"
      />
    </div>
  );
}
