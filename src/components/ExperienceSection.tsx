"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const VortexDustFall = dynamic(() => import("@/components/VortexDustFall"), {
  ssr: false,
});

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface WorkProject {
  id: string;
  title: string;
  category: string;
  organization: string;
  subOrg: string;
  period: string;
  role: string;
  badge: string;
  badgeColor: string;
  summary: string;
  imageSrc?: string;
  visualType: "image" | "crt-room" | "cinematic-portrait" | "light-slice" | "spatial-geometry";
  link: string;
}

const PROJECTS: WorkProject[] = [
  {
    id: "sphinx-tech",
    title: "SPHINX's Website",
    category: "Technical Lead",
    organization: "SPHINX — MNIT Jaipur",
    subOrg: "Annual Techno-Management Fest",
    period: "August 2026 — Present",
    role: "Technical Lead & Full-Stack Developer",
    badge: "FULL-STACK DEV",
    badgeColor: "#38BDF8",
    summary:
      "Every layout, motion curve, and interaction was crafted to run at full refresh rates with zero dropped frames. Built using modern frontend architectures and refined with deliberate, pixel-perfect intent.",
    imageSrc: "/images/projects/oldtech.webp",
    visualType: "image",
    link: "https://www.linkedin.com/in/abhigyan-choudhary-3922a63a0/",
  },
  {
    id: "blitzschlag",
    title: "BLITZSCHLAG",
    category: "Logistics & Ground Coordination",
    organization: "BLITZSCHLAG — MNIT Jaipur",
    subOrg: "Annual Cultural Fest",
    period: "January 2026 — February 2026",
    role: "Logistics Coordinator",
    badge: "OPERATIONS",
    badgeColor: "#A855F7",
    summary:
      "Managed on-ground logistics, equipment movement, and vendor coordination across campus venues with real-time dispatch and zero delay.",
    imageSrc: "/images/projects/creatify.webp",
    visualType: "image",
    link: "https://www.linkedin.com/in/abhigyan-choudhary-3922a63a0/",
  },
  {
    id: "event-core",
    title: "E-SPORTS",
    category: "Esports Event Coordinator",
    organization: "SPHINX Annual Fest",
    subOrg: "Esports Division",
    period: "October 2026 — Present",
    role: "Esports Event Coordinator",
    badge: "TOURNAMENT LEAD",
    badgeColor: "#10B981",
    summary:
      "Coordinated esports tournament schedules, stage setups, live production streams, and bracket flow across major festival events.",
    visualType: "light-slice",
    link: "https://www.linkedin.com/in/abhigyan-choudhary-3922a63a0/",
  },
  {
    id: "kyroatives-labs",
    title: "KYROATIVES",
    category: "Web Dev Creatives",
    organization: "Kyroatives Labs",
    subOrg: "Creative Design Squad",
    period: "Full Time",
    role: "Full Stack Web Dev & AI Integration Specialist",
    badge: "CREATIVE TECH",
    badgeColor: "#F59E0B",
    summary:
      "Creating amazing, innovative, and unique custom websites for clients and empowering them with cutting-edge AI integration and technical solutions.",
    visualType: "spatial-geometry",
    link: "https://www.linkedin.com/in/abhigyan-choudhary-3922a63a0/",
  },
];

export default function ExperienceSection({
  skipLenis = false,
  showFooter = true,
}: {
  skipLenis?: boolean;
  showFooter?: boolean;
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          window.matchMedia("(pointer: coarse)").matches
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize Lenis (if standalone) & GSAP Scroll-linked Orbital Revolution
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lenis: Lenis | null = null;
    let tickerCb: ((time: number) => void) | null = null;

    if (!skipLenis) {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.1,
      });

      lenis.on("scroll", ScrollTrigger.update);

      tickerCb = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const stage = stageRef.current;
      if (!container || !stage) return;

      // 1. Header entrance animation
      gsap.fromTo(
        ".xp-header-text",
        { y: 35, opacity: 0.3 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
        }
      );

      // 2. Orbital Revolution Calculation along the Wire Ring Ellipse
      const cards = stage.querySelectorAll<HTMLElement>(".work-orbital-card");

      const updateOrbitalCards = (p: number) => {
        setScrollProgress(Math.round(p * 100));

        // 4 projects; 3 steps of 90 deg = 1.5 * Math.PI brings each card to the front
        const totalRotation = 1.5 * Math.PI;
        const currentRotation = p * totalRotation;

        const w = window.innerWidth;
        // Ring radius is enlarged (radius: 195); elliptical bounds match the ring perspective
        const rx = Math.min(560, Math.max(170, w * 0.38));
        const ry = rx * 0.32; // matches tilt (sin ~18°)

        let bestIdx = 0;
        let bestCos = -Infinity;

        cards.forEach((card, idx) => {
          const baseTheta = (idx * Math.PI) / 2;
          const theta = baseTheta - currentRotation;

          const sinT = Math.sin(theta);
          const cosT = Math.cos(theta);

          // Find card closest to front (highest cosT)
          if (cosT > bestCos) {
            bestCos = cosT;
            bestIdx = idx;
          }

          const x = sinT * rx;
          const y = cosT * ry;

          // 3D Orbital transformations
          // Front (cosT = 1): scale = 1.04, opacity = 1, zIndex = 35, rotY = 0
          // Back (cosT = -1): scale = 0.68, opacity = 0.35, zIndex = 5, blur = 3px
          const scale = 0.86 + cosT * 0.18;
          const opacity = 0.68 + cosT * 0.32;
          const rotY = -sinT * 24; // Tangent angle along ring circumference
          const rotX = cosT * 6; // Perspective tilt
          const zIndex = Math.round((cosT + 1) * 15) + 5;
          const blurPx = cosT < -0.3 ? Math.round((-cosT - 0.3) * 4) : 0;

          card.style.transform = `translate3d(${x}px, ${y}px, 0) perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`;
          card.style.opacity = `${Math.max(0.28, Math.min(1, opacity))}`;
          card.style.zIndex = `${zIndex}`;
          card.style.filter = blurPx > 0 ? `blur(${blurPx}px)` : "none";
          card.style.pointerEvents = cosT > -0.2 ? "auto" : "none";
        });

        setActiveIdx(bestIdx);
      };

      // Initial placement at scroll progress 0
      updateOrbitalCards(0);

      // ScrollTrigger scrubbed animation over the pinned section
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.15,
        onUpdate: (self) => {
          updateOrbitalCards(self.progress);
        },
      });

      // Handle window resize dynamically
      const handleResize = () => {
        updateOrbitalCards(scrollProgress / 100);
      };
      window.addEventListener("resize", handleResize);

      ScrollTrigger.refresh();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, containerRef);

    return () => {
      ctx.revert();
      if (tickerCb) {
        gsap.ticker.remove(tickerCb);
      }
      if (lenis) {
        lenis.destroy();
      }
    };
  }, [skipLenis]);

  return (
    <section
      id="my-work"
      ref={containerRef}
      className="relative w-full h-[320vh] bg-[#050608] text-white selection:bg-cyan-400 selection:text-black font-base-sans"
    >
      {/* 🧭 Sticky Stage Container (Locked for 320vh of revolving orbital scroll) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-6 sm:py-8 md:py-10 z-10">
        {/* 🌪️ VORTEX DUST FALL BACKGROUND (Adaptive Mobile / Desktop) */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
          <VortexDustFall
            background="transparent"
            baseColor="#E2E8F0"
            accentColor="#38BDF8"
            density={isMobile ? 42 : 120}
            dotSize={isMobile ? 85 : 106}
            speed={44}
            distance={1460}
            tilt={18}
            ring={{
              radius: isMobile ? 145 : 195,
              thickness: isMobile ? 6 : 8,
            }}
            fall={{ height: 135, spin: 36, spray: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        {/* Ambient radial glow overlays blending with deep space void */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_32%,rgba(5,6,8,0.65)_78%,#050608_100%)] z-[1]" />
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#050608] to-transparent pointer-events-none z-[1]" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#050608] to-transparent pointer-events-none z-[1]" />

        {/* ⚡ HEADER: MY WORKS (Fixed at top of sticky stage) */}
        <header className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none select-none">
          <div>
            <div className="xp-header-text flex items-center gap-2.5 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-400 font-semibold">
                {"// SELECTED WORKS & EXPERIENCES"}
              </span>
            </div>

            <h2 className="xp-header-text font-bebas text-5xl sm:text-7xl md:text-8xl uppercase leading-none tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
              MY WORKS
            </h2>
          </div>

          <p className="xp-header-text text-xs sm:text-sm font-mono text-neutral-400 uppercase tracking-[0.22em]">
            Scroll to revolve projects through the vortex
          </p>
        </header>

        {/* 🪐 ORBITAL 3D STAGE: CARDS REVOLVE IN THE ENLARGED RING */}
        <div
          ref={stageRef}
          className="relative z-20 w-full flex-1 flex items-center justify-center pointer-events-none select-none my-auto"
          style={{ minHeight: "360px" }}
        >
          {PROJECTS.map((project, index) => {
            const isFrontCard = activeIdx === index;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`work-orbital-card group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[300px] md:w-[335px] rounded-[22px] sm:rounded-[26px] bg-[#0A0D16]/92 border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-4 sm:p-5 flex flex-col justify-between cursor-pointer select-none transition-colors duration-300 ${
                  isFrontCard
                    ? "border-cyan-400/80 shadow-[0_0_40px_rgba(56,189,248,0.3)] ring-1 ring-cyan-400/40"
                    : "hover:border-white/35"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity, filter",
                }}
              >
                {/* Card Top: Category & Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
                      style={{ backgroundColor: project.badgeColor, color: project.badgeColor }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-300 font-semibold truncate">
                      {project.category}
                    </span>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border shrink-0"
                    style={{
                      color: project.badgeColor,
                      borderColor: `${project.badgeColor}50`,
                      backgroundColor: `${project.badgeColor}15`,
                    }}
                  >
                    {project.badge}
                  </span>
                </div>

                {/* Compact Cinematic Visual Preview (Aspect 16/9) */}
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3.5 border border-white/10 shadow-inner bg-neutral-950">
                  <ProjectCardVisual project={project} index={index} />
                </div>

                {/* Content Details */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-cyan-400 font-medium">
                    {project.period}
                  </div>
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide leading-tight group-hover:text-cyan-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-300 line-clamp-2 leading-relaxed font-sans">
                    {project.summary}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors flex items-center gap-1">
                    <span>INSPECT</span>
                    <span className="text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                      ↗
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/80">
                    0{index + 1} / 0{PROJECTS.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🧭 FOOTER & TELEMETRY PROGRESS (Bottom of sticky stage) */}
        <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none select-none">
          {/* Active project name pills */}
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-neutral-400">
            {PROJECTS.map((p, i) => (
              <span
                key={p.id}
                className={`transition-all duration-300 px-2 py-0.5 rounded-full ${
                  activeIdx === i
                    ? "text-cyan-300 bg-cyan-950/60 border border-cyan-400/30 font-semibold shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                    : "text-neutral-500 opacity-60"
                }`}
              >
                0{i + 1}
              </span>
            ))}
            <span className="text-neutral-600 ml-1">|</span>
            <span className="text-white font-medium ml-1 hidden sm:inline">
              {PROJECTS[activeIdx]?.title}
            </span>
          </div>

          {/* Progress bar HUD */}
          <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400">
            <span className="text-[10px] tracking-widest text-cyan-400 uppercase">
              REVOLVE
            </span>
            <div className="w-24 sm:w-36 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            <span className="text-white font-mono text-[10px]">{scrollProgress}%</span>
          </div>
        </footer>
      </div>

      {/* 🌟 PROJECT DETAIL DRAWER / MODAL */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 cursor-default"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative w-full max-w-xl bg-[#0F0F14] border border-white/20 rounded-3xl p-6 sm:p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${selectedProject.badgeColor}22`,
                    color: selectedProject.badgeColor,
                    border: `1px solid ${selectedProject.badgeColor}44`,
                  }}
                >
                  {selectedProject.badge}
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  {selectedProject.period}
                </span>
              </div>

              <h2 className="font-bebas text-4xl sm:text-5xl uppercase tracking-tight text-white leading-none">
                {selectedProject.title}
              </h2>
              <p className="text-sm font-mono text-cyan-400">
                {selectedProject.role}
              </p>
              <p className="text-xs text-neutral-400">
                {selectedProject.organization} • {selectedProject.subOrg}
              </p>
            </div>

            {/* Summary */}
            <div className="mb-8">
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-normal">
                {selectedProject.summary}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <a
                href={selectedProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <span>Verify on LinkedIn</span>
                <span>↗</span>
              </a>

              <a
                href="#contact-me"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedProject(null);
                  const el = document.querySelector("#contact-me");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = "/contact";
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <span>Initiate Transmission ↗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

{/* 🖼️ PROJECT VISUAL PREVIEWS */}
function ProjectCardVisual({
  project,
  index,
}: {
  project: WorkProject;
  index: number;
}) {
  if (project.imageSrc) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={project.imageSrc}
          alt={project.title}
          fill
          sizes="(max-width: 1024px) 100vw, 360px"
          priority={index < 2}
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/5 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {project.visualType === "crt-room" && <CrtRoomVisual />}
      {project.visualType === "cinematic-portrait" && <CinematicPortraitVisual />}
      {project.visualType === "light-slice" && <LightSliceVisual />}
      {project.visualType === "spatial-geometry" && <SpatialGeometryVisual />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}

{/* 📺 VISUAL 1: RETRO-PURPLE CRT ROOM */}
function CrtRoomVisual() {
  return (
    <div className="relative w-full h-full bg-[#180E2B] overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #9333EA 1.5px, transparent 1.5px), radial-gradient(circle at 0% 0%, #C084FC 2px, transparent 2px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_45%,rgba(192,132,252,0.45),rgba(20,10,36,0.95))]" />
      <div className="relative z-10 w-full h-full flex items-end justify-center pb-4 px-4">
        <div className="w-48 h-24 rounded-xl bg-[#0F0C18] border-2 border-[#35254E] shadow-[0_15px_40px_rgba(0,0,0,0.95)] flex items-center justify-center p-2">
          <div className="text-center font-mono text-cyan-300 text-[10px]">SPHINX // WEB PLATFORM</div>
        </div>
      </div>
    </div>
  );
}

{/* 🎭 VISUAL 2: CINEMATIC PORTRAIT */}
function CinematicPortraitVisual() {
  return (
    <div className="relative w-full h-full bg-[#120B0F] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_45%,rgba(168,30,70,0.35),rgba(10,5,8,0.98))]" />
      <div className="relative flex flex-col items-center justify-center">
        <span className="text-3xl">🎭</span>
      </div>
    </div>
  );
}

{/* 📐 VISUAL 3: SHARP ARCHITECTURAL LIGHT SLICE (Marquiy / E-Sports Arena) */}
function LightSliceVisual() {
  return (
    <div className="relative w-full h-full bg-[#0D0E12] overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `linear-gradient(45deg, #2D3748 25%, transparent 25%), linear-gradient(-45deg, #2D3748 25%, transparent 25%)`,
          backgroundSize: "6px 6px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.95) 45%, rgba(230, 235, 245, 0.85) 60%, rgba(200, 210, 230, 0.4) 75%, transparent 100%)",
        }}
      />
      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-end justify-between">
        <div className="space-y-0.5">
          <div className="text-[9px] font-mono text-emerald-400 font-semibold tracking-wider">
            ESPORTS_ARENA
          </div>
          <div className="flex items-end gap-1 h-6">
            {[40, 70, 95, 60, 85, 100, 55, 90, 75, 45, 80, 65].map((height, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-emerald-500 to-cyan-300 rounded-t-xs"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

{/* 🌐 VISUAL 4: SPATIAL LABS 3D WIREFRAME GEOMETRY */}
function SpatialGeometryVisual() {
  return (
    <div className="relative w-full h-full bg-[#070A12] overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(56, 189, 248, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.3) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          transform: "perspective(300px) rotateX(45deg) translateY(20%)",
        }}
      />
      <div className="relative z-10 w-24 h-24 flex items-center justify-center transform hover:rotate-12 transition-transform duration-700">
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-lg animate-pulse" />
        <div className="w-18 h-18 border-2 border-cyan-400/80 transform rotate-45 shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center justify-center">
          <div className="w-10 h-10 border border-white/60 transform rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white via-cyan-200 to-cyan-500 shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
