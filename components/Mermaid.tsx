"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "base",
  themeVariables: {
    fontFamily: "inherit",
    primaryColor: "#ffffff",
    primaryTextColor: "#000000",
    primaryBorderColor: "#6366f1",
    lineColor: "#818cf8",
    secondaryColor: "#f3f4f6",
    tertiaryColor: "#ffffff",
    nodeTextColor: "#000000",
    textColor: "#000000",
    mainBkg: "#ffffff",
    nodeBorder: "#6366f1",
    clusterBkg: "#f8fafc",
    clusterBorder: "#cbd5e1",
    defaultLinkColor: "#818cf8",
    titleColor: "#ffffff",
    edgeLabelBackground: "#ffffff",
  },
  securityLevel: "loose",
});

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (ref.current && chart) {
        try {
          // Clean the chart string one more time
          const cleanChart = chart
            .replace(/```mermaid\n?/g, "")
            .replace(/```\n?/g, "")
            .replace(/^(mermaid\n?)/i, "")
            .trim();

          if (!cleanChart) return;

          // Generate a unique ID for each render to avoid conflicts
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

          const { svg } = await mermaid.render(id, cleanChart);
          if (ref.current && isMounted) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid Render Error:", error);
          if (ref.current && isMounted) {
            ref.current.innerHTML = `
              <div class="flex flex-col items-center justify-center p-8 text-center bg-red-950/20 rounded-2xl border border-red-500/20">
                <div class="text-red-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                </div>
                <p class="text-white/80 text-sm font-bold mb-1">Diagram Parser Error</p>
                <p class="text-white/40 text-xs mb-4">The AI generated an invalid diagram syntax.</p>
                <code class="p-3 bg-black/60 rounded-xl text-[10px] text-red-300/60 font-mono block max-w-full overflow-auto border border-white/5">
                  ${error instanceof Error ? error.message : "Syntax Error"}
                </code>
              </div>
            `;
          }
        }
      }
    };

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="flex justify-center p-8 bg-linear-to-br from-white/5 to-white/10 rounded-3xl overflow-hidden border border-white/10 min-h-[300px] shadow-2xl backdrop-blur-sm">
      <div
        ref={ref}
        className="w-full flex justify-center items-center transition-all duration-500 scale-[1.02]"
      />
    </div>
  );
}
