import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/about", destination: "/#about-me", permanent: false },
      { source: "/work", destination: "/#my-work", permanent: false },
      { source: "/experience", destination: "/#my-work", permanent: false },
      { source: "/xp", destination: "/#my-xp", permanent: false },
      { source: "/contact", destination: "/#contact-me", permanent: false },
    ];
  },
};

export default nextConfig;
