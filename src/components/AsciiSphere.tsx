"use client";

import { useEffect, useRef } from "react";

export default function AsciiSphere({
  radius = 12,
  size,
  className = "",
}: {
  radius?: number;
  size?: number;
  speed?: number;
  interactive?: boolean;
  className?: string;
}) {
  const effectiveRadius = radius ?? (size ? Math.round(size / 18) : 12);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const chars = " .:-=+*#%@";
    let angle = 0.4;
    let animId: number;
    let lastTime = 0;

    const render = (time: number) => {
      // Run at ~24 FPS for retro terminal feel
      if (time - lastTime < 42) {
        animId = requestAnimationFrame(render);
        return;
      }
      lastTime = time;
      angle += 0.015;

      const lines: string[] = [];
      const aspect = 1.9; // Font glyph height / width compensation
      const lightX = Math.cos(angle * 0.7) * 0.8 - 0.3;
      const lightY = -0.5;
      const lightZ = 0.9;
      const lLen = Math.hypot(lightX, lightY, lightZ);
      const lx = lightX / lLen;
      const ly = lightY / lLen;
      const lz = lightZ / lLen;

      const r = effectiveRadius;
      for (let y = -r; y <= r; y++) {
        let line = "";
        for (let x = -Math.round(r * aspect); x <= Math.round(r * aspect); x++) {
          const nx = x / (r * aspect);
          const ny = y / r;
          const distSq = nx * nx + ny * ny;

          if (distSq <= 1.0) {
            const nz = Math.sqrt(Math.max(0, 1.0 - distSq));

            // Sphere normal
            // Rotate around Y axis slightly
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const rx = nx * cosA - nz * sinA;
            const rz = nx * sinA + nz * cosA;

            // Dot product with directional light
            const dot = rx * lx + ny * ly + rz * lz;
            const ambient = 0.08;
            const lum = Math.max(0, dot) * 0.92 + ambient;

            // Subtle crater/surface noise
            const noise = Math.sin(rx * 9.0 + rz * 7.0) * Math.cos(ny * 8.0) * 0.12;
            const finalLum = Math.min(1, Math.max(0, lum + noise));

            const charIdx = Math.floor(finalLum * (chars.length - 1));
            line += chars[charIdx];
          } else {
            line += " ";
          }
        }
        lines.push(line);
      }

      if (preRef.current) {
        preRef.current.textContent = lines.join("\n");
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [effectiveRadius]);

  return (
    <pre
      ref={preRef}
      aria-hidden="true"
      className={`font-mono text-[9px] sm:text-[11px] leading-[1.0] text-neutral-400/80 select-none pointer-events-none drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] ${className}`}
    />
  );
}
