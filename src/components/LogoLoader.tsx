"use client";

import type { CSSProperties } from "react";
import styles from "./LogoLoader.module.css";

export type LogoLoaderProps = {
  src?: string;
  size?: number | string;
  duration?: number;
  label?: string;
  fullscreen?: boolean;
  className?: string;
};

type LoaderVariables = CSSProperties & {
  "--loader-size": string;
  "--duration": string;
  "--logo-image": string;
};

export default function LogoLoader({
  src = "/images/logo.webp",
  size = 280,
  duration = 3.5,
  label = "Loading",
  fullscreen = false,
  className = "",
}: LogoLoaderProps) {
  const variables: LoaderVariables = {
    "--loader-size": typeof size === "number" ? `${size}px` : size,
    "--duration": `${duration}s`,
    "--logo-image": `url(${JSON.stringify(src)})`,
  };

  return (
    <div
      className={[
        styles.loader,
        fullscreen ? styles.fullscreen : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={variables}
      role="status"
      aria-label={label}
    >
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.fragments}>
          {Array.from({ length: 16 }, (_, index) => (
            <span
              key={index}
              className={`${styles.fragment} ${styles[`piece${index + 1}`]}`}
            />
          ))}
        </div>

        <div className={styles.shine} />
      </div>

      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}

