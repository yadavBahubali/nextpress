"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FeaturePinAnimation = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1199px)", () => {
      const panels = gsap.utils.toArray<HTMLElement>(".tp-panel-pin");

      panels.forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          pin: true,
          scrub: 1,
          start: "top 10%",
          end: "bottom 99%",
          endTrigger: ".tp-panel-pin-area",
          pinSpacing: false,
          markers: false,
        });
      });
    });

    return () => {
      mm.revert();

      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
};

export default FeaturePinAnimation;
