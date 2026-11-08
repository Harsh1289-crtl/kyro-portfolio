/* eslint-disable */
// Encrypt Button — Originkit

"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

const DEFAULTS = {
  label: "Hover Me",
  font: {
    fontSize: "14px",
    textAlign: "left" as const,
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: 600,
    lineHeight: "1.2em",
    letterSpacing: "0.04em",
  },
  fill: "#FFFFFF",
  textColor: "#000000",
  hoverTextColor: "#000000",
  paddingX: 28,
  paddingY: 14,
  rounded: 9999, // Pill shape by default
  scrambleOptions: {
    speed: 60,
    cycles: 4,
    chars: "!@#$%^&*():{};|,.<>/?",
  },
  sweep: true,
  sweepOptions: {
    color: "#38BDF8", // Cyan matching KyRo aesthetic
    speed: 7,
    count: 2,
    width: 8,
  },
  border: false,
  borderOptions: { color: "#737373", width: 1 },
  transition: {
    type: "tween",
    stiffness: 800,
    damping: 60,
    mass: 1,
    duration: 0.3,
    ease: "easeInOut",
  },
};

const MIN_STEP_MS = 16;
const SWEEP_SECONDS_SLOW = 2;
const SWEEP_SECONDS_FAST = 0.15;
const TRAIL_SHORT = 6;
const TRAIL_LONG = 50;
const FACE_AT = 50;
const FACE_EDGE = 1.5;
const BAND_SCALE = 1.25;
const FLIP_SHARE = 0.001;

const mapSlider = (value: number, atOne: number, atTen: number) => {
  const t = (Math.min(10, Math.max(1, value)) - 1) / 9;
  return atOne + (atTen - atOne) * t;
};

export interface ScrambleOptions {
  speed: number;
  cycles: number;
  chars: string;
}

export interface SweepOptions {
  color: string;
  speed: number;
  count: number;
  width: number;
}

export interface BorderOptions {
  color: string;
  width: number;
}

export interface EncryptButtonProps {
  label?: string;
  font?: CSSProperties;
  fill?: string;
  textColor?: string;
  hoverTextColor?: string;
  paddingX?: number;
  paddingY?: number;
  rounded?: number | string;
  scrambleOptions?: ScrambleOptions;
  sweep?: boolean;
  sweepOptions?: SweepOptions;
  border?: boolean;
  borderOptions?: BorderOptions;
  transition?: any;
  style?: CSSProperties;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  icon?: ReactNode;
}

function __OriginkitBase_EncryptButton(props: EncryptButtonProps) {
  const {
    label = DEFAULTS.label,
    font = DEFAULTS.font,
    fill = DEFAULTS.fill,
    textColor = DEFAULTS.textColor,
    hoverTextColor = DEFAULTS.hoverTextColor,
    paddingX = DEFAULTS.paddingX,
    paddingY = DEFAULTS.paddingY,
    rounded = DEFAULTS.rounded,
    scrambleOptions = DEFAULTS.scrambleOptions,
    sweep = DEFAULTS.sweep,
    sweepOptions = DEFAULTS.sweepOptions,
    border = DEFAULTS.border,
    borderOptions = DEFAULTS.borderOptions,
    transition = DEFAULTS.transition,
    style,
    className = "",
    onClick,
    type = "button",
    disabled = false,
    href,
    target,
    rel,
    icon,
  } = props;

  const [text, setText] = useState(label);
  const [hover, setHover] = useState(false);
  const rafRef = useRef<number | null>(null);

  const configRef = useRef<any>(null);
  configRef.current = { label, scrambleOptions };

  const borderColor = borderOptions?.color ?? DEFAULTS.borderOptions.color;
  const borderWidth = border ? (borderOptions?.width ?? 0) : 0;
  const sweepColor = sweepOptions?.color ?? DEFAULTS.sweepOptions.color;
  const sweepSeconds = mapSlider(
    sweepOptions?.speed ?? DEFAULTS.sweepOptions.speed,
    SWEEP_SECONDS_SLOW,
    SWEEP_SECONDS_FAST
  );
  const sweepCount = Math.max(
    1,
    Math.round(sweepOptions?.count ?? DEFAULTS.sweepOptions.count)
  );
  const trail = mapSlider(
    sweepOptions?.width ?? DEFAULTS.sweepOptions.width,
    TRAIL_SHORT,
    TRAIL_LONG
  );

  const yKeyframes: string[] = ["-100%"];
  const yTimes: number[] = [0];
  const flipKeyframes: number[] = [];
  const flipTimes: number[] = [];
  for (let i = 0; i < sweepCount; i++) {
    const downward = i % 2 === 0;
    const start = i / sweepCount;
    const end = (i + 1) / sweepCount;
    yKeyframes.push(downward ? "100%" : "-100%");
    yTimes.push(end);
    const facing = downward ? BAND_SCALE : -BAND_SCALE;
    flipKeyframes.push(facing, facing);
    flipTimes.push(
      start,
      i === sweepCount - 1 ? end : end - FLIP_SHARE / sweepCount
    );
  }

  const stopScramble = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setText(configRef.current.label);
  };

  const startScramble = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const { label: target, scrambleOptions: opts } = configRef.current;
    const chars = opts?.chars?.length
      ? opts.chars
      : DEFAULTS.scrambleOptions.chars;
    const cycles = Math.max(
      1,
      opts?.cycles ?? DEFAULTS.scrambleOptions.cycles
    );
    const speed = Math.max(1, opts?.speed ?? DEFAULTS.scrambleOptions.speed);
    const stepMs = Math.max(MIN_STEP_MS, 1000 / speed);
    const letters = [...target];
    const total = letters.length * cycles;

    let step = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      if (now - last >= stepMs) {
        last = now;
        const scrambled = letters
          .map((char, index) => {
            if (step / cycles > index) return char;
            if (!char.trim()) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
        setText(scrambled);
        step++;
        if (step >= total) {
          rafRef.current = null;
          setText(target);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (rafRef.current == null) setText(label);
  }, [label]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const buttonContent = (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      initial={false}
      onHoverStart={() => {
        if (!disabled) {
          setHover(true);
          startScramble();
        }
      }}
      onHoverEnd={() => {
        setHover(false);
        stopScramble();
      }}
      className={`group ${className}`}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        width: "fit-content",
        padding: `${paddingY}px ${paddingX}px`,
        borderRadius: typeof rounded === "number" ? `${rounded}px` : rounded,
        background: fill,
        border:
          borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        overflow: "hidden",
        textDecoration: "none",
        whiteSpace: "nowrap",
        userSelect: "none",
        ...style,
      }}
    >
      {sweep && hover && !disabled ? (
        <motion.span
          aria-hidden
          initial={{ y: "-100%", scaleY: BAND_SCALE }}
          animate={{ y: yKeyframes, scaleY: flipKeyframes }}
          transition={{
            y: {
              duration: sweepSeconds * sweepCount,
              ease: "linear",
              times: yTimes,
            },
            scaleY: {
              duration: sweepSeconds * sweepCount,
              ease: "linear",
              times: flipTimes,
            },
          }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            scaleX: BAND_SCALE,
            background: `linear-gradient(to bottom, transparent ${FACE_AT - trail}%, ${sweepColor} ${FACE_AT}%, transparent ${FACE_AT + FACE_EDGE}%)`,
            pointerEvents: "none",
          }}
        />
      ) : null}

      <motion.span
        initial={false}
        animate={{ color: hover ? hoverTextColor : textColor }}
        transition={transition}
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          ...font,
        }}
      >
        <span style={{ position: "relative", display: "inline-block" }}>
          <span style={{ visibility: "hidden" }}>{label}</span>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {text}
          </span>
        </span>
        {icon && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              transform: hover ? "translate(2px, -2px)" : "translate(0, 0)",
              transition: "transform 0.2s ease",
            }}
          >
            {icon}
          </span>
        )}
      </motion.span>
    </motion.button>
  );

  // If href is specified and not external, wrap with Next.js Link
  if (href) {
    if (href.startsWith("http") || target === "_blank") {
      return (
        <a
          href={href}
          target={target ?? "_blank"}
          rel={rel ?? "noopener noreferrer"}
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          {buttonContent}
        </a>
      );
    }
    return (
      <Link href={href} style={{ textDecoration: "none", display: "inline-block" }}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}

export default function EncryptButton(props: EncryptButtonProps) {
  return <__OriginkitBase_EncryptButton {...props} />;
}

