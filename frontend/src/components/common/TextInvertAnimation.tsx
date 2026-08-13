"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

const TextInvertAnimation = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const texts = document.querySelectorAll(".tp_text_invert");

    const splitInstances: SplitType[] = [];

    texts.forEach((text) => {
      const split = new SplitType(text as HTMLElement, {
        types: "lines",
      });

      splitInstances.push(split);

      split.lines?.forEach((line) => {
        gsap.fromTo(
          line,
          {
            backgroundPositionX: "100%",
          },
          {
            backgroundPositionX: "0%",
            ease: "none",
            scrollTrigger: {
              trigger: line,
              scrub: 1,
              start: "top 85%",
              end: "bottom center",
            },
          },
        );
      });
    });

    return () => {
      splitInstances.forEach((split) => split.revert());

      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
};

export default TextInvertAnimation;
