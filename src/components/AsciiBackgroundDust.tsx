"use client";

import { useEffect, useState } from "react";

type Marker = {
  id: number;
  char: string;
  x: number;
  y: number;
  opacity: number;
  pulseSpeed: number;
  size: string;
};

const MARKER_CHARS = ["+", "·", "::", "x", "xx", ":", "*", "•", "++"];

export default function AsciiBackgroundDust({
  className = "absolute inset-0",
}: {
  className?: string;
} = {}) {
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    // Generate ~45 ambient background glyphs distributed across the screen
    const count = 45;
    const items: Marker[] = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        char: MARKER_CHARS[Math.floor(Math.random() * MARKER_CHARS.length)],
        x: Math.random() * 96 + 2, // 2% to 98%
        y: Math.random() * 94 + 3,
        opacity: Math.random() * 0.45 + 0.15,
        pulseSpeed: Math.random() * 3 + 2.5,
        size: Math.random() > 0.8 ? "text-xs" : "text-[10px]",
      });
    }
    const raf = requestAnimationFrame(() => {
      setMarkers(items);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`${className} pointer-events-none select-none z-0 overflow-hidden`}
    >
      {markers.map((m) => (
        <span
          key={m.id}
          className={`absolute font-mono text-neutral-500/40 transition-opacity duration-1000 ${m.size}`}
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            opacity: m.opacity,
            animation: `pulseGlow ${m.pulseSpeed}s ease-in-out infinite alternate`,
          }}
        >
          {m.char}
        </span>
      ))}
      <style jsx>{`
        @keyframes pulseGlow {
          0% {
            opacity: 0.12;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.48;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.18;
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
