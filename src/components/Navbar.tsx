"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/data/content";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#" className="text-lg font-bold tracking-tight text-foreground">
          {siteConfig.name}
        </a>
        <a
          href="#booking"
          className="rounded-full border border-foreground bg-foreground px-6 py-2.5 text-sm font-medium tracking-wide text-white transition-all hover:bg-transparent hover:text-foreground"
        >
          Booking Sekarang
        </a>
      </div>
    </nav>
  );
}
