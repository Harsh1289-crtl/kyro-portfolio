import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KyRo • Abhigyan — Creative Engineer & Full-Stack Developer",
  description:
    "Portfolio of Abhigyan (KyRo) — Creative engineering, esports tournament production, and hardware-accelerated WebGL experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-black antialiased">
      <head>
        {/* Google Fonts: Inter loaded for canvas atlas rendering */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
