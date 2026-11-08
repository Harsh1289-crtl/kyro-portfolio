"use client";

import { useState } from "react";
import EncryptButton from "@/components/EncryptButton";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    project: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch transmission.");
      }

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setFormData({ name: "", email: "", project: "" });
      }, 4000);
    } catch (err: unknown) {
      console.error("Submission error:", err);
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to dispatch. Please try again."
      );
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 5000);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col z-20 relative text-left">
      {/* 🟢 Status Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-neutral-400 uppercase select-none">
          OPEN FOR WORK APPROXIMATELY NOW
        </span>
      </div>

      {/* 🌟 Main Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white leading-[1.08] select-none font-sans">
        Queueing the <br />
        next compile.
      </h1>

      {/* 📝 Subtitle */}
      <p className="mt-3 text-sm sm:text-base text-neutral-400 font-sans tracking-normal select-none">
        Mostly systems &amp; architecture, sometimes creative engineering.
      </p>

      {/* 📋 Form Inputs */}
      <form onSubmit={handleSubmit} className="mt-10 sm:mt-12 flex flex-col space-y-6">
        {/* Row 1: Name */}
        <div className="flex items-baseline border-b border-neutral-800 pb-3 pt-1 transition-colors duration-200 focus-within:border-neutral-400">
          <label
            htmlFor="name"
            className="w-28 sm:w-36 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-neutral-300 uppercase select-none shrink-0 font-medium transition-colors"
          >
            NAME
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none font-sans"
          />
        </div>

        {/* Row 2: Email */}
        <div className="flex items-baseline border-b border-neutral-800 pb-3 pt-1 transition-colors duration-200 focus-within:border-neutral-400">
          <label
            htmlFor="email"
            className="w-28 sm:w-36 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-neutral-300 uppercase select-none shrink-0 font-medium transition-colors"
          >
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="the one you actually check"
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none font-sans"
          />
        </div>

        {/* Row 3: The Project */}
        <div className="flex items-baseline border-b border-neutral-800 pb-3 pt-1 transition-colors duration-200 focus-within:border-neutral-400">
          <label
            htmlFor="project"
            className="w-28 sm:w-36 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-neutral-300 uppercase select-none shrink-0 font-medium transition-colors"
          >
            THE PROJECT
          </label>
          <input
            id="project"
            type="text"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            placeholder="Link, deadline, and what it should feel like"
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none font-sans"
          />
        </div>

        {/* 🚀 Submit Button */}
        <div className="pt-6">
          <EncryptButton
            type="submit"
            disabled={status !== "idle"}
            label={
              status === "submitting"
                ? "Queueing compile..."
                : status === "success"
                ? "Compiled & dispatched ✓"
                : "Send it over"
            }
            fill="#FFFFFF"
            textColor="#000000"
            hoverTextColor="#000000"
            paddingX={32}
            paddingY={13}
            rounded={9999}
            sweepOptions={{
              color: "#38BDF8",
              speed: 7,
              count: 2,
              width: 8,
            }}
            icon={
              <span className="text-sm font-bold">
                {status === "success" ? "✓" : "↗"}
              </span>
            }
            style={{
              boxShadow: "0 0 25px rgba(255, 255, 255, 0.2)",
            }}
          />
          {status === "error" && (
            <p className="mt-2 text-xs font-mono text-rose-400">
              {errorMessage || "Submission error. Please try again."}
            </p>
          )}
        </div>

        {/* 🔒 Privacy / hCaptcha Disclaimer */}
        <p className="text-[11px] sm:text-xs text-neutral-600 font-sans tracking-wide pt-2 select-none">
          This site is protected by hCaptcha and its{" "}
          <span className="underline underline-offset-2 hover:text-neutral-400 cursor-pointer">
            Privacy Policy
          </span>{" "}
          and{" "}
          <span className="underline underline-offset-2 hover:text-neutral-400 cursor-pointer">
            Terms of Service
          </span>{" "}
          apply.
        </p>

        {/* 🔗 Social Links */}
        <div className="pt-8 sm:pt-10 flex flex-wrap items-center gap-6 sm:gap-10">
          <a
            href="https://www.instagram.com/harssh__.chaudhary_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base text-neutral-300 hover:text-white transition-colors duration-200 font-sans tracking-wide hover:underline underline-offset-4"
          >
            Instagram
          </a>
          <a
            href="https://discord.gg/nTwjBQfDFC"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base text-neutral-300 hover:text-white transition-colors duration-200 font-sans tracking-wide hover:underline underline-offset-4"
          >
            Discord
          </a>
          <a
            href="https://github.com/Harsh1289-crtl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base text-neutral-300 hover:text-white transition-colors duration-200 font-sans tracking-wide hover:underline underline-offset-4"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/abhigyan-choudhary-3922a63a0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base text-neutral-300 hover:text-white transition-colors duration-200 font-sans tracking-wide hover:underline underline-offset-4"
          >
            LinkedIn
          </a>
        </div>
      </form>
    </div>
  );
}
