"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import LogoLoader from "./LogoLoader";

export interface Kyro3DModelProps {
  text?: string;
  fontUrl?: string;
  textColor?: string;
  shade?: string;
  accent?: string;
  metalness?: number;
  roughness?: number;
  depth?: number;
  bevelSize?: number;
  letterSpacing?: number;
  sizeScale?: number;
  wireframe?: boolean;
  showEdges?: boolean;
  autoRotate?: boolean;
  interactiveDrag?: boolean;
  floatAnimation?: boolean;
  scrollProgress?: number;
  style?: React.CSSProperties;
  className?: string;
}

interface LetterItem {
  group: THREE.Group;
  mesh: THREE.Mesh;
  edges?: THREE.LineSegments;
  char: string;
  baseX: number;
  baseY: number;
  baseZ: number;
  formOffset: {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    scale: number;
  };
  breakOffset: {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    scale: number;
  };
}

interface ShardItem {
  mesh: THREE.Mesh;
  basePos: THREE.Vector3;
  inOffset: THREE.Vector3;
  outOffset: THREE.Vector3;
  rotSpeed: THREE.Vector3;
}

export default function Kyro3DModel({
  text = "KyRo",
  fontUrl = "/fonts/odisean_tech.typeface.json",
  textColor = "#FFFFFF",
  shade = "#94A3B8",
  accent = "#38BDF8",
  metalness = 0.96,
  roughness = 0.15,
  depth = 16,
  bevelSize = 1.4,
  letterSpacing = 8,
  sizeScale = 0.5,
  wireframe = false,
  showEdges = true,
  autoRotate = false,
  interactiveDrag = true,
  floatAnimation = true,
  scrollProgress,
  style,
  className = "",
}: Kyro3DModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fontError, setFontError] = useState<string | null>(null);

  // Live props ref for 60fps render loop
  const liveProps = useRef({
    text,
    fontUrl,
    textColor,
    shade,
    accent,
    metalness,
    roughness,
    depth,
    bevelSize,
    letterSpacing,
    sizeScale,
    wireframe,
    showEdges,
    autoRotate,
    interactiveDrag,
    floatAnimation,
    scrollProgress,
  });

  useEffect(() => {
    liveProps.current = {
      text,
      fontUrl,
      textColor,
      shade,
      accent,
      metalness,
      roughness,
      depth,
      bevelSize,
      letterSpacing,
      sizeScale,
      wireframe,
      showEdges,
      autoRotate,
      interactiveDrag,
      floatAnimation,
      scrollProgress,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let destroyed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let meshGroup: THREE.Group | null = null;
    let letterItems: LetterItem[] = [];
    let shardItems: ShardItem[] = [];
    let totalTextWidth = 1;
    let pointerLight: THREE.PointLight | null = null;
    let loadedFont: Font | null = null;
    let animId = 0;

    // Pointer & rotation states
    const pointer = { x: 0, y: 0, worldX: 0, worldY: 0 };
    const targetRotation = { x: 0, y: 0 };
    const dragRotation = { x: 0, y: 0 };
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    const clock = new THREE.Clock();

    // Smooth scroll interpolation
    let currentScrollProgress = 0.5;

    // 1. Initialize Three.js Scene, Camera, Renderer
    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / Math.max(container.clientHeight, 1),
        1,
        2500
      );
      camera.position.set(0, 0, 480);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;

      meshGroup = new THREE.Group();
      scene.add(meshGroup);

      // 2. Studio Lighting Setup
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(160, 180, 240);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xc7d2fe, 1.4);
      fillLight.position.set(-180, -80, 120);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x7dd3fc, 2.4);
      rimLight.position.set(0, -220, -100);
      scene.add(rimLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      pointerLight = new THREE.PointLight(0xffffff, 3.5, 600, 1.2);
      pointerLight.position.set(0, 0, 120);
      scene.add(pointerLight);
    } catch (err) {
      console.error("Three.js initialization failed:", err);
      requestAnimationFrame(() => {
        setFontError("WebGL initialization error");
      });
      return;
    }

    // 3. Build Modular Letter Assemblies
    function buildLetters(font: Font) {
      if (!meshGroup || destroyed) return;

      const p = liveProps.current;
      const displayText = p.text || "KyRo";

      // Dispose existing letter meshes
      letterItems.forEach((item) => {
        meshGroup?.remove(item.group);
        item.mesh.geometry.dispose();
        if (Array.isArray(item.mesh.material)) {
          item.mesh.material.forEach((m) => m.dispose());
        } else {
          item.mesh.material.dispose();
        }
        if (item.edges) {
          item.edges.geometry.dispose();
          if (Array.isArray(item.edges.material)) {
            item.edges.material.forEach((m) => m.dispose());
          } else {
            item.edges.material.dispose();
          }
        }
      });
      letterItems = [];

      // Dispose shards
      shardItems.forEach((s) => {
        meshGroup?.remove(s.mesh);
        s.mesh.geometry.dispose();
        if (Array.isArray(s.mesh.material)) {
          s.mesh.material.forEach((m) => m.dispose());
        } else {
          s.mesh.material.dispose();
        }
      });
      shardItems = [];

      try {
        const chars = Array.from(displayText);
        const spacing = p.letterSpacing ?? 8;

        // Measure individual characters
        const charData = chars.map((char) => {
          if (char === " ") {
            return { char, geom: null, width: 36 };
          }
          const geom = new TextGeometry(char, {
            font,
            size: 72,
            depth: Math.max(6, p.depth),
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 3.5,
            bevelSize: Math.max(0.5, p.bevelSize),
            bevelOffset: 0,
            bevelSegments: 5,
          });
          geom.computeBoundingBox();
          geom.center();
          const bb = geom.boundingBox;
          const width = bb ? bb.max.x - bb.min.x : 50;
          return { char, geom, width };
        });

        totalTextWidth = charData.reduce((acc, c) => acc + c.width + spacing, -spacing);

        let currentLeft = -totalTextWidth / 2;

        charData.forEach((c, idx) => {
          if (!c.geom) {
            currentLeft += c.width + spacing;
            return;
          }

          const baseX = currentLeft + c.width / 2;
          const baseY = 0;
          const baseZ = 0;
          currentLeft += c.width + spacing;

          // Material with transparency support for breaking dissolve
          const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(p.textColor),
            metalness: Math.min(1.0, Math.max(0.0, p.metalness)),
            roughness: Math.min(1.0, Math.max(0.0, p.roughness)),
            clearcoat: 0.95,
            clearcoatRoughness: 0.1,
            reflectivity: 1.0,
            wireframe: p.wireframe,
            transparent: true,
            opacity: 1.0,
          });

          const mesh = new THREE.Mesh(c.geom, material);
          const letterGroup = new THREE.Group();
          letterGroup.add(mesh);

          let edges: THREE.LineSegments | undefined;
          if (p.showEdges && !p.wireframe) {
            const edgesGeom = new THREE.EdgesGeometry(c.geom, 24);
            const edgesMat = new THREE.LineBasicMaterial({
              color: new THREE.Color(p.accent),
              transparent: true,
              opacity: 0.5,
            });
            edges = new THREE.LineSegments(edgesGeom, edgesMat);
            letterGroup.add(edges);
          }

          // Procedural or handcrafted kinetic form & break trajectories
          let formOffset = {
            x: (idx % 2 === 0 ? -1 : 1) * (140 + idx * 30),
            y: (idx % 2 === 0 ? 1 : -1) * (120 + (idx % 3) * 35),
            z: (idx % 2 === 0 ? -150 : 130),
            rx: (idx % 2 === 0 ? 1.0 : -0.9),
            ry: (idx % 2 === 0 ? -1.1 : 1.2),
            rz: (idx % 2 === 0 ? 0.5 : -0.5),
            scale: 0.55,
          };

          let breakOffset = {
            x: (idx % 2 === 0 ? -1 : 1) * (300 + idx * 45),
            y: (idx % 3 === 0 ? 1 : -1) * (260 + (idx % 2) * 50),
            z: (idx % 2 === 0 ? 240 : -220),
            rx: (idx % 2 === 0 ? 2.4 : -2.6),
            ry: (idx % 2 === 0 ? -2.7 : 2.5),
            rz: (idx % 2 === 0 ? -1.6 : 1.9),
            scale: 0.12,
          };

          // Specially tuned trajectories for the 4 letters of "KyRo"
          if (displayText === "KyRo") {
            if (idx === 0) {
              // 'K'
              formOffset = { x: -180, y: 110, z: -160, rx: 1.1, ry: -1.2, rz: 0.5, scale: 0.55 };
              breakOffset = { x: -340, y: 160, z: 250, rx: 2.3, ry: -2.7, rz: -1.2, scale: 0.12 };
            } else if (idx === 1) {
              // 'y'
              formOffset = { x: -40, y: -180, z: 120, rx: -1.0, ry: 0.8, rz: -0.6, scale: 0.55 };
              breakOffset = { x: -80, y: -340, z: -190, rx: -2.8, ry: 1.6, rz: 1.9, scale: 0.12 };
            } else if (idx === 2) {
              // 'R'
              formOffset = { x: 60, y: 170, z: -180, rx: 1.0, ry: -0.7, rz: 0.7, scale: 0.55 };
              breakOffset = { x: 120, y: 340, z: 220, rx: 2.7, ry: 2.4, rz: -1.5, scale: 0.12 };
            } else if (idx === 3) {
              // 'o'
              formOffset = { x: 190, y: -90, z: 140, rx: -0.8, ry: 1.3, rz: -0.7, scale: 0.55 };
              breakOffset = { x: 360, y: -110, z: -260, rx: -2.2, ry: -2.9, rz: 2.5, scale: 0.12 };
            }
          }

          meshGroup.add(letterGroup);
          letterItems.push({
            group: letterGroup,
            mesh,
            edges,
            char: c.char,
            baseX,
            baseY,
            baseZ,
            formOffset,
            breakOffset,
          });
        });

        // 4. Floating Metallic Shards & Debris
        const shardCount = 10;
        for (let i = 0; i < shardCount; i++) {
          const theta = (i / shardCount) * Math.PI * 2;
          const phi = (Math.random() - 0.5) * Math.PI;
          const shardGeom = new THREE.TetrahedronGeometry(3 + Math.random() * 2.5, 0);
          const shardMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(p.textColor),
            metalness: 0.95,
            roughness: 0.18,
            clearcoat: 1.0,
            reflectivity: 1.0,
            transparent: true,
            opacity: 0.85,
          });
          const shardMesh = new THREE.Mesh(shardGeom, shardMat);
          meshGroup.add(shardMesh);

          const rIn = 220 + Math.random() * 80;
          const rOut = 440 + Math.random() * 140;
          const rBase = 32 + Math.random() * 45;

          shardItems.push({
            mesh: shardMesh,
            basePos: new THREE.Vector3(
              Math.cos(theta) * Math.cos(phi) * rBase,
              Math.sin(phi) * rBase,
              Math.sin(theta) * Math.cos(phi) * rBase
            ),
            inOffset: new THREE.Vector3(
              Math.cos(theta) * rIn * 1.2,
              (Math.random() - 0.5) * 260,
              Math.sin(theta) * rIn
            ),
            outOffset: new THREE.Vector3(
              Math.cos(theta) * rOut,
              Math.sin(phi) * rOut,
              Math.sin(theta) * rOut
            ),
            rotSpeed: new THREE.Vector3(
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4
            ),
          });
        }

        // Responsive scaling
        updateGroupScale();
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to construct 3D letter assemblies:", err);
      }
    }

    function updateGroupScale() {
      if (!container || !meshGroup || totalTextWidth <= 0) return;
      const w = container.clientWidth;
      const scaleFactor = liveProps.current.sizeScale ?? 0.5;
      const targetW = Math.min(w * 0.72, 750) * scaleFactor;
      const s = Math.max(0.05, targetW / Math.max(totalTextWidth, 1));
      meshGroup.scale.set(s, s, s);
    }

    // 5. Load Font
    const loader = new FontLoader();
    const initialFontUrl = liveProps.current.fontUrl || "/fonts/odisean_tech.typeface.json";

    loader.load(
      initialFontUrl,
      (font) => {
        if (destroyed) return;
        loadedFont = font;
        buildLetters(font);
      },
      undefined,
      (err) => {
        console.warn("Primary font failed to load, falling back to backup font:", err);
        loader.load(
          "/fonts/helvetiker_bold.typeface.json",
          (fallbackFont) => {
            if (destroyed) return;
            loadedFont = fallbackFont;
            buildLetters(fallbackFont);
          },
          undefined,
          (err2) => {
            console.error("FontLoader failed to load font:", err2);
            if (!destroyed) {
              setFontError("Failed to load 3D font geometry");
              setIsLoading(false);
            }
          }
        );
      }
    );

    // 6. Pointer & Parallax Listeners
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top) / rect.height;

      pointer.x = (normX - 0.5) * 2;
      pointer.y = -(normY - 0.5) * 2;

      pointer.worldX = pointer.x * (container.clientWidth * 0.4);
      pointer.worldY = pointer.y * (container.clientHeight * 0.4);

      if (isDragging && liveProps.current.interactiveDrag) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        dragRotation.y += deltaX * 0.008;
        dragRotation.x += deltaY * 0.008;
        dragStart = { x: e.clientX, y: e.clientY };
      } else {
        targetRotation.y = pointer.x * 0.38;
        targetRotation.x = -pointer.y * 0.28;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0 && liveProps.current.interactiveDrag) {
        isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    window.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    // 7. Resize Observer
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      updateGroupScale();
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // 8. 60 FPS Kinetic Animation Loop
    function animate() {
      if (destroyed || !renderer || !scene || !camera || !meshGroup) return;

      const p = liveProps.current;
      const elapsedTime = clock.getElapsedTime();

      // Determine scroll progress (via prop or section DOM calculation)
      let targetProgress = p.scrollProgress;
      if (typeof targetProgress !== "number") {
        const sectionEl = container ? (container.closest("[data-section='about']") as HTMLElement | null) : null;
        if (sectionEl && sectionEl.offsetHeight > window.innerHeight * 1.1) {
          const rect = sectionEl.getBoundingClientRect();
          const scrollDist = Math.max(1, rect.height - window.innerHeight);
          targetProgress = Math.max(0, Math.min(1, -rect.top / scrollDist));
        } else {
          targetProgress = 0.5; // Default formed
        }
      }

      // Smooth buttery lerping for scroll animation
      currentScrollProgress += (targetProgress - currentScrollProgress) * Math.min(1, 0.12);

      // Kinetic Phases:
      // Form phase: 0.0 -> 0.40 (Assemble from scattered pieces)
      // Sweet spot: 0.40 -> 0.60 (Fully formed & solid)
      // Break phase: 0.60 -> 1.0 (Explosively shatter & disperse)
      let formProgress = 1;
      let breakProgress = 0;

      if (currentScrollProgress < 0.40) {
        const raw = currentScrollProgress / 0.40;
        formProgress = Math.min(1, Math.max(0, 1 - Math.pow(1 - raw, 3)));
        breakProgress = 0;
      } else if (currentScrollProgress <= 0.60) {
        formProgress = 1;
        breakProgress = 0;
      } else {
        formProgress = 1;
        const raw = (currentScrollProgress - 0.60) / 0.40;
        breakProgress = Math.min(1, Math.max(0, raw * raw * 1.18));
      }

      const formFactor = 1 - formProgress;

      // Animate Individual 3D Letter Assemblies
      for (let i = 0; i < letterItems.length; i++) {
        const item = letterItems[i];

        // Position interpolation
        const inX = item.baseX + item.formOffset.x * formFactor;
        const inY = item.baseY + item.formOffset.y * formFactor;
        const inZ = item.baseZ + item.formOffset.z * formFactor;

        const outX = inX + item.breakOffset.x * breakProgress;
        const outY = inY + item.breakOffset.y * breakProgress;
        const outZ = inZ + item.breakOffset.z * breakProgress;

        // Rotation interpolation
        const rotX = item.formOffset.rx * formFactor + item.breakOffset.rx * breakProgress;
        const rotY = item.formOffset.ry * formFactor + item.breakOffset.ry * breakProgress;
        const rotZ = item.formOffset.rz * formFactor + item.breakOffset.rz * breakProgress;

        // Scale interpolation
        const inScale = 1 - formFactor * (1 - item.formOffset.scale);
        const curScale = inScale * (1 - breakProgress * (1 - item.breakOffset.scale));

        item.group.position.set(outX, outY, outZ);
        item.group.rotation.set(rotX, rotY, rotZ);
        item.group.scale.set(curScale, curScale, curScale);

        // Alpha fadeout as letters fly into deep distance
        const opacity = Math.max(0, 1 - Math.max(0, breakProgress - 0.48) / 0.52);
        (item.mesh.material as THREE.MeshPhysicalMaterial).opacity = opacity;
        if (item.edges) {
          (item.edges.material as THREE.LineBasicMaterial).opacity = opacity * 0.65;
        }
      }

      // Animate Shards / Debris
      for (let i = 0; i < shardItems.length; i++) {
        const shard = shardItems[i];
        const sX = shard.basePos.x + shard.inOffset.x * formFactor + shard.outOffset.x * breakProgress;
        const sY = shard.basePos.y + shard.inOffset.y * formFactor + shard.outOffset.y * breakProgress;
        const sZ = shard.basePos.z + shard.inOffset.z * formFactor + shard.outOffset.z * breakProgress;

        shard.mesh.position.set(sX, sY, sZ);
        shard.mesh.rotation.x += shard.rotSpeed.x * 0.02;
        shard.mesh.rotation.y += shard.rotSpeed.y * 0.02;
        shard.mesh.rotation.z += shard.rotSpeed.z * 0.02;

        const shardOpacity = Math.max(
          0,
          (1 - formFactor * 0.4) * (1 - Math.max(0, breakProgress - 0.42) / 0.58)
        );
        (shard.mesh.material as THREE.MeshPhysicalMaterial).opacity = shardOpacity;
      }

      // Smooth damped spring rotation toward target
      meshGroup.rotation.x +=
        (targetRotation.x + dragRotation.x - meshGroup.rotation.x) * 0.08;
      meshGroup.rotation.y +=
        (targetRotation.y + dragRotation.y - meshGroup.rotation.y) * 0.08;

      if (p.autoRotate && !isDragging) {
        dragRotation.y += 0.007;
      }

      // Organic hover oscillation (attenuated when shattering)
      if (p.floatAnimation && breakProgress < 0.2) {
        const floatMul = 1 - breakProgress * 5;
        meshGroup.position.y = Math.sin(elapsedTime * 1.8) * 4.5 * floatMul;
        meshGroup.rotation.z = Math.sin(elapsedTime * 1.0) * 0.02 * floatMul;
      } else {
        meshGroup.position.y = 0;
        meshGroup.rotation.z = 0;
      }

      // Cursor light tracking
      if (pointerLight) {
        pointerLight.position.x +=
          (pointer.worldX - pointerLight.position.x) * 0.12;
        pointerLight.position.y +=
          (pointer.worldY - pointerLight.position.y) * 0.12;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    // Watch for text or geometry prop changes
    let lastText = text;
    let lastFontUrl = fontUrl;
    let lastDepth = depth;
    let lastBevel = bevelSize;
    let lastLetterSpacing = letterSpacing;
    let lastWireframe = wireframe;
    let lastEdges = showEdges;
    let lastTextColor = textColor;
    let lastMetalness = metalness;
    let lastRoughness = roughness;
    let lastAccent = accent;

    const propChecker = setInterval(() => {
      if (destroyed) return;
      const p = liveProps.current;

      if (p.fontUrl !== lastFontUrl) {
        lastFontUrl = p.fontUrl;
        loader.load(
          p.fontUrl || "/fonts/odisean_tech.typeface.json",
          (f) => {
            if (destroyed) return;
            loadedFont = f;
            buildLetters(f);
          },
          undefined,
          (err) => console.error("Failed to load updated font:", err)
        );
        return;
      }

      if (!loadedFont) return;

      const geomChanged =
        p.text !== lastText ||
        p.depth !== lastDepth ||
        p.bevelSize !== lastBevel ||
        p.letterSpacing !== lastLetterSpacing ||
        p.wireframe !== lastWireframe ||
        p.showEdges !== lastEdges;

      const matChanged =
        p.textColor !== lastTextColor ||
        p.metalness !== lastMetalness ||
        p.roughness !== lastRoughness ||
        p.accent !== lastAccent;

      if (geomChanged) {
        lastText = p.text;
        lastDepth = p.depth;
        lastBevel = p.bevelSize;
        lastLetterSpacing = p.letterSpacing;
        lastWireframe = p.wireframe;
        lastEdges = p.showEdges;
        buildLetters(loadedFont);
      } else if (matChanged) {
        lastTextColor = p.textColor;
        lastMetalness = p.metalness;
        lastRoughness = p.roughness;
        lastAccent = p.accent;

        letterItems.forEach((item) => {
          const mat = item.mesh.material as THREE.MeshPhysicalMaterial;
          mat.color.set(p.textColor);
          mat.metalness = Math.min(1.0, Math.max(0.0, p.metalness));
          mat.roughness = Math.min(1.0, Math.max(0.0, p.roughness));
          if (item.edges) {
            (item.edges.material as THREE.LineBasicMaterial).color.set(p.accent);
          }
        });
      }
    }, 150);

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      clearInterval(propChecker);
      window.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      ro.disconnect();

      letterItems.forEach((item) => {
        item.mesh.geometry.dispose();
        if (Array.isArray(item.mesh.material)) {
          item.mesh.material.forEach((m) => m.dispose());
        } else {
          item.mesh.material.dispose();
        }
        if (item.edges) {
          item.edges.geometry.dispose();
          if (Array.isArray(item.edges.material)) {
            item.edges.material.forEach((m) => m.dispose());
          } else {
            item.edges.material.dispose();
          }
        }
      });

      shardItems.forEach((s) => {
        s.mesh.geometry.dispose();
        if (Array.isArray(s.mesh.material)) {
          s.mesh.material.forEach((m) => m.dispose());
        } else {
          s.mesh.material.dispose();
        }
      });

      renderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full outline-none block"
      />

      {/* Loading Overlay */}
      {isLoading && !fontError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <LogoLoader size={180} duration={2.8} label="Synthesizing 3D Metallic Mesh" />
        </div>
      )}

      {/* Error State */}
      {fontError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-4 py-2 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-mono">
            {fontError}
          </div>
        </div>
      )}
    </div>
  );
}
