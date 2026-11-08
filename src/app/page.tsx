"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import BeyondHorizon from "@/components/BeyondHorizon";
import Kyro3DModel from "@/components/Kyro3DModel";
import PixelatedCursor from "@/components/PixelatedCursor";
import LogoLoader from "@/components/LogoLoader";
import EncryptButton from "@/components/EncryptButton";
import ExperienceSection from "@/components/ExperienceSection";
import ContactForm from "@/components/ContactForm";
import AsciiSphere from "@/components/AsciiSphere";
import AsciiBackgroundDust from "@/components/AsciiBackgroundDust";

// Lazy-load Three.js Vortex for optimal performance
const Vortex = dynamic(() => import("@/components/Vortex"), { ssr: false });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderFading, setPreloaderFading] = useState(false);
  const [aboutScrollProgress, setAboutScrollProgress] = useState(0);
  const [xpScrollPct, setXpScrollPct] = useState(0);

  const lenisRef = useRef<Lenis | null>(null);
  const aboutTrackRef = useRef<HTMLDivElement>(null);
  const xpTrackRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLElement>(null);

  // 1. Preloader lifecycle
  useEffect(() => {
    const fadeTimer = setTimeout(() => setPreloaderFading(true), 3800);
    const removeTimer = setTimeout(() => setShowPreloader(false), 4500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // 2. Initialize Lenis Smooth Scroll & GSAP ScrollTrigger Synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    // 3. GSAP Scroll Animations
    const ctx = gsap.context(() => {
      // 1. About Me 3D kinetic assemble & shatter timeline
      if (aboutTrackRef.current) {
        ScrollTrigger.create({
          trigger: aboutTrackRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            setAboutScrollProgress(self.progress);
          },
        });

        // Top text timeline: dissolves with blur as model shatters (past 55%)
        gsap.timeline({
          scrollTrigger: {
            trigger: aboutTrackRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        })
          .fromTo(
            "#about-top-text",
            { opacity: 0.35, y: 25 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
          )
          .to("#about-top-text", {
            opacity: 1,
            y: 0,
            duration: 0.25,
          })
          .to("#about-top-text", {
            opacity: 0,
            y: -50,
            filter: "blur(6px)",
            duration: 0.4,
            ease: "power2.in",
          });

        // Bottom actions timeline
        gsap.timeline({
          scrollTrigger: {
            trigger: aboutTrackRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        })
          .fromTo(
            "#about-bottom-actions",
            { opacity: 0.35, y: 25 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
          )
          .to("#about-bottom-actions", {
            opacity: 1,
            y: 0,
            duration: 0.25,
          })
          .to("#about-bottom-actions", {
            opacity: 0,
            y: 50,
            filter: "blur(6px)",
            duration: 0.4,
            ease: "power2.in",
          });
      }

      // XP Section Scroll Progress HUD
      if (xpTrackRef.current) {
        ScrollTrigger.create({
          trigger: xpTrackRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            setXpScrollPct(Math.round(self.progress * 100));
          },
        });

        // XP Header fade-out near end of sticky track
        gsap.to("#xp-header", {
          opacity: 0,
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: xpTrackRef.current,
            start: "70% top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Contact Me reveal animation
      if (contactSectionRef.current) {
        gsap.fromTo(
          "#contact-container",
          { opacity: 0, y: 50, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: contactSectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Re-calculate after initialization
      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);

      return () => clearTimeout(refreshTimeout);
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smooth scroll handler
  const scrollTo = (target: string) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: 0, duration: 1.4 });
    } else {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-[#050608] text-white font-cuba select-none selection:bg-white selection:text-black overflow-x-clip">
      {/* 🌟 Fullscreen Metallic Logo Loader Preloader */}
      {showPreloader && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-[#050608] transition-opacity duration-700 ease-out ${
            preloaderFading ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <LogoLoader
            fullscreen
            size="min(75vw, 340px)"
            duration={4.2}
            label="Loading KyRo Portfolio"
          />
        </div>
      )}

      {/* 🌟 Inkbleed Pixelated Cursor Trail */}
      <PixelatedCursor
        label={false}
        pixelCount={30}
        pixelSize={18}
        pixelShape="circle"
        trailColor="#FFFFFF"
        trailSpacing={2}
        hideNativeCursor={false}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 45,
          pointerEvents: "none",
        }}
      />

      {/* ========================================================================= */}
      {/* ⚡ SECTION 1: ABOUT ME (BeyondHorizon + Interactive KyRo 3D Wordmark)      */}
      {/* ========================================================================= */}
      <section
        id="about-me"
        data-section="about"
        ref={aboutTrackRef}
        className="relative w-full h-[220vh] bg-[#050608]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-between">
          {/* Layer 0: BeyondHorizon WebGL Sunrise-Over-Planet Background */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <BeyondHorizon
              background="#050608"
              brightness={1.3}
              speed={1.0}
              haze={2.0}
              parallax={2.0}
              proximityBoost={0.8}
              style={{
                minWidth: 0,
                minHeight: 0,
                width: "100%",
                height: "100%",
                position: "absolute",
                inset: 0,
              }}
            />
          </div>

          {/* Layer 1: KyRo 3D Model in Odisean Tech with Scroll-linked Kinetic Assemble & Shatter */}
          <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
            <Kyro3DModel
              scrollProgress={aboutScrollProgress}
              text="KyRo"
              fontUrl="/fonts/odisean_tech.typeface.json"
              letterSpacing={10}
              textColor="#FFFFFF"
              shade="#94A3B8"
              accent="#38BDF8"
              sizeScale={0.5}
              metalness={1.0}
              roughness={0.14}
              depth={16}
              bevelSize={1.4}
              wireframe={false}
              showEdges={true}
              autoRotate={false}
              interactiveDrag={true}
              floatAnimation={true}
              style={{
                minWidth: 0,
                minHeight: 0,
                width: "100%",
                height: "100%",
                position: "absolute",
                inset: 0,
              }}
            />
          </div>

          {/* 🌟 Text Above KyRo (Top of screen) */}
          <div
            id="about-top-text"
            className="relative z-30 pt-16 sm:pt-20 md:pt-24 flex flex-col items-center pointer-events-none select-none text-center px-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-cuba tracking-[0.25em] sm:tracking-[0.3em] text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
              HELLO! I&apos;m
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-base-sans text-neutral-300 drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)] whitespace-nowrap flex items-center justify-center tracking-normal font-normal">
              <span className="text-base sm:text-lg md:text-xl font-bold font-base-sans text-cyan-400 leading-none mr-2 select-none transform -translate-y-[1px]">
                &#123;
              </span>
              <span className="font-base-sans text-neutral-300 font-medium">Hardware-brained, clutch-trained</span>
              <span className="text-base sm:text-lg md:text-xl font-bold font-base-sans text-cyan-400 leading-none ml-2 select-none transform -translate-y-[1px]">
                &#125;
              </span>
            </p>
          </div>

          {/* 🌟 Text & Actions Below KyRo (Bottom of screen) */}
          <div
            id="about-bottom-actions"
            className="relative z-30 pb-10 sm:pb-14 flex flex-col items-center select-none text-center px-4 gap-4"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/20 bg-black/75 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.95)] pointer-events-none">
              <span className="text-xs sm:text-sm font-cuba text-cyan-400 font-bold uppercase tracking-[0.3em]">
                AKA
              </span>
              <span className="text-lg sm:text-xl md:text-2xl font-cuba tracking-[0.28em] text-white">
                Abhigyan
              </span>
            </div>

            {/* Quick Action Navigation */}
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollTo("#my-work")}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 backdrop-blur-md text-white text-xs sm:text-sm font-mono tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95 cursor-pointer"
              >
                <span>Explore Work</span>
                <span className="text-cyan-400">↓</span>
              </button>

              <EncryptButton
                label="Contact Me"
                onClick={() => scrollTo("#contact-me")}
                fill="#FFFFFF"
                textColor="#000000"
                hoverTextColor="#000000"
                paddingX={26}
                paddingY={10}
                rounded={9999}
                sweepOptions={{
                  color: "#38BDF8",
                  speed: 7,
                  count: 2,
                  width: 8,
                }}
                icon={<span className="text-sm font-bold">↗</span>}
                style={{
                  boxShadow: "0 0 25px rgba(56, 189, 248, 0.4)",
                }}
              />
            </div>

            {/* Discreet Scroll Down Mouse Hint */}
            <div
              onClick={() => scrollTo("#my-work")}
              className="pt-2 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer pointer-events-auto"
            >
              <div className="w-4 h-7 rounded-full border border-white/30 flex items-start justify-center p-1">
                <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                SCROLL TO ASSEMBLE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 🌌 CURVED CELESTIAL HORIZON TRANSITION (About Me -> My Work) */}
      <div className="relative w-full h-32 -mt-16 pointer-events-none overflow-hidden z-20">
        <div className="w-[140vw] -ml-[20vw] h-48 rounded-[100%] bg-gradient-to-b from-transparent via-[#050608]/85 to-[#050608] shadow-[0_-25px_60px_rgba(56,189,248,0.08)]" />
      </div>

      {/* ========================================================================= */}
      {/* ⚡ SECTION 2: MY WORK (ExperienceSection with Project Cards & Parallax)     */}
      {/* ========================================================================= */}
      <ExperienceSection skipLenis={true} showFooter={false} />

      {/* 🌌 CURVED ATMOSPHERIC BRIDGE (My Work -> My XP) */}
      <div className="relative w-full h-36 -my-18 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
        <div className="w-[150vw] h-56 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12)_0%,rgba(168,85,247,0.04)_45%,transparent_70%)] blur-2xl" />
      </div>

      {/* ========================================================================= */}
      {/* ⚡ SECTION 3: MY XP (Originkit 3D Tornado + Revolving Skill Badges)        */}
      {/* ========================================================================= */}
      <section
        id="my-xp"
        data-section="xp"
        ref={xpTrackRef}
        className="relative w-full h-[260vh] bg-[#050608]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
          {/* 🌪️ 3D Tornado Canvas with Multi-stop Soft Feather Dissolve (No Straight Lines!) */}
          <div
            className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 8%, rgba(0,0,0,0.85) 18%, black 28%, black 72%, rgba(0,0,0,0.85) 82%, rgba(0,0,0,0.3) 92%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 8%, rgba(0,0,0,0.85) 18%, black 28%, black 72%, rgba(0,0,0,0.85) 82%, rgba(0,0,0,0.3) 92%, transparent 100%)",
            }}
          >
            <Vortex repel background="transparent" />
          </div>

          {/* Ambient circular vignette so outer strands fade organically into background */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,6,8,0.65)_75%,#050608_100%)] z-[1]" />

          {/* Top curved light horizon (bleeding smoothly from My Work) */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[140vw] h-56 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)] blur-3xl pointer-events-none z-[1]" />

          {/* Bottom curved celestial light horizon (bleeding smoothly into Contact Me) */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[140vw] h-56 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.07)_0%,transparent_70%)] blur-3xl pointer-events-none z-[1]" />

          {/* Top Title Overlay */}
          <div
            id="xp-header"
            className="relative z-10 w-full pt-16 sm:pt-20 md:pt-24 px-6 text-center pointer-events-none select-none"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-400 font-semibold">
                {"// CORE COMPETENCIES & TECH STACK"}
              </span>
            </div>

            <h2 className="font-bebas text-6xl sm:text-8xl md:text-9xl uppercase tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] leading-none">
              MY XP
            </h2>

            <p className="text-xs sm:text-sm font-mono text-neutral-400 uppercase tracking-[0.22em] mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Scroll down to spiral through technologies
            </p>
          </div>

          {/* Bottom Telemetry HUD */}
          <div className="relative z-10 w-full pb-8 sm:pb-10 px-6 sm:px-12 flex items-end justify-between pointer-events-none select-none">
            <div className="font-mono text-[10px] text-neutral-500 hidden md:block">
              HYPERBOLOID_VORTEX // 15_NODE_CLUSTER // THREE.JS
            </div>

            {/* Orbit Telemetry Pill */}
            <aside
              aria-label="Telemetry HUD"
              className="pointer-events-none flex items-center font-mono text-[11px] text-neutral-400 ml-auto"
            >
              <div className="px-4 py-1.5 rounded-full border border-white/15 bg-black/75 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-cyan-400 font-semibold tracking-wider">
                  ORBIT
                </span>
                <span className="text-white/30">|</span>
                <span className="text-white font-mono">{xpScrollPct}%</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ⚡ SECTION 4: CONTACT ME (ASCII Sphere + Contact Form + Transmissions)    */}
      {/* ========================================================================= */}
      <section
        id="contact-me"
        ref={contactSectionRef}
        className="relative z-10 w-full min-h-screen py-24 sm:py-32 md:py-36 px-6 sm:px-10 flex items-center justify-center bg-[#050608] overflow-hidden"
      >
        {/* Soft Organic Atmospheric Aurora Blend from XP into Contact */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[140vw] h-72 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,rgba(168,85,247,0.04)_45%,transparent_70%)] blur-3xl pointer-events-none z-0" />

        {/* Ambient Floating ASCII Dust / Markers */}
        <AsciiBackgroundDust className="absolute inset-0" />

        {/* Ambient subtle glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(56,189,248,0.035),rgba(0,0,0,0))] z-0" />

        <div
          id="contact-container"
          className="w-full max-w-5xl flex items-start justify-center relative my-auto z-10"
        >
          {/* Contact Form Container with Left ASCII Moon Sphere anchored to its left */}
          <div className="w-full max-w-xl relative">
            {/* Left ASCII Moon Sphere */}
            <div className="hidden md:block absolute right-full top-28 lg:top-32 mr-8 lg:mr-14 xl:mr-20 select-none pointer-events-none opacity-85">
              <AsciiSphere radius={13} />
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
