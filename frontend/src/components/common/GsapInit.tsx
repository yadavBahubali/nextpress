"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
    ScrollToPlugin: any;
  }
}

export default function GsapInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
      window.gsap = gsap;
      window.ScrollTrigger = ScrollTrigger;
      window.ScrollToPlugin = ScrollToPlugin;
      console.log("GSAP initialized globally");
    }
  }, []);

  return null;
}
