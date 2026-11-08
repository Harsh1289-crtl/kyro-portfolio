import LogoLoader from "@/components/LogoLoader";

export default function Loading() {
  return (
    <LogoLoader
      fullscreen
      size="min(80vw, 380px)"
      duration={3.5}
      label="Loading your experience"
    />
  );
}

