"use client";

import { useEffect } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FadeAnimation = () => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      gsap.registerPlugin(ScrollTrigger);

      const items = gsap.utils.toArray<HTMLElement>(".tp_fade_anim");

      items.forEach((item) => {
        const fadeOffset = Number(item.dataset.fadeOffset) || 40;

        const duration = Number(item.dataset.duration) || 0.75;

        const fadeDirection = item.dataset.fadeFrom || "bottom";

        const onScroll = Number(item.dataset.onScroll) || 1;

        const delay = Number(item.dataset.delay) || 0.15;

        const ease = item.dataset.ease || "power2.out";

        const animationConfig: gsap.TweenVars = {
          opacity: 0,
          ease,
          duration,
          delay,

          x:
            fadeDirection === "left"
              ? -fadeOffset
              : fadeDirection === "right"
                ? fadeOffset
                : 0,

          y:
            fadeDirection === "top"
              ? -fadeOffset
              : fadeDirection === "bottom"
                ? fadeOffset
                : 0,
        };

        if (onScroll === 1) {
          animationConfig.scrollTrigger = {
            trigger: item,
            start: "top 85%",
          };
        }

        gsap.from(item, animationConfig);
      });

      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timeout);

      ScrollTrigger.getAll().forEach((trigger) => {
        trigger.kill();
      });
    };
  }, []);

  return null;
};

export default FadeAnimation;
