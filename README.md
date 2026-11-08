# KyRo — Interactive WebGL Vector Wordmark & Beyond Horizon

A high-performance Next.js application featuring an interactive WebGL vector wordmark with a pointer-driven lattice rig, paired with the **Beyond Horizon** planet-edge sunrise atmospheric shader.

---

## 🚀 Running the Project

Start the local development server:

```bash
npm run dev
```

Then visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📁 Component Organization

- [`src/components/background/BeyondHorizon.tsx`](file:///c:/Users/abhig/OneDrive/Desktop/Kyro2/src/components/background/BeyondHorizon.tsx) — The **Beyond Horizon** WebGL atmospheric background component (also exported via [`src/background/`](file:///c:/Users/abhig/OneDrive/Desktop/Kyro2/src/background/BeyondHorizon.tsx)).
- [`src/components/VectorWordmark.tsx`](file:///c:/Users/abhig/OneDrive/Desktop/Kyro2/src/components/VectorWordmark.tsx) — The core WebGL vector wordmark component with lattice rig.
- [`src/app/page.tsx`](file:///c:/Users/abhig/OneDrive/Desktop/Kyro2/src/app/page.tsx) — The home page seamlessly combining the Beyond Horizon sunrise glow behind the KyRo vector wordmark, complete with live parameter controls.

---

## 🌅 Using Beyond Horizon in Any Component

You can import `BeyondHorizon` directly from `@/components/background/BeyondHorizon` or `@/background`:

```tsx
import BeyondHorizon from "@/components/background/BeyondHorizon";

export default function Section() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <BeyondHorizon
        background="#08080A"
        brightness={2}
        speed={1}
        parallax={2}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          minWidth: 0,
          minHeight: 0,
        }}
      />
      {/* Your content on top */}
    </div>
  );
}
```
