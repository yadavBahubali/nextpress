"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import SplitType from "split-type";

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
    ScrollToPlugin: any;
    ScrollSmoother: any;
    SplitType: any;
    jQuery: any;
    $: any;
    imagesLoaded: any;
    Isotope: any;
    PureCounter: any;
    SplitText: any;
    THREE: any;
    hoverEffect: any;
  }
}

export default function ThemeInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initTheme = async () => {
        const isConfigurator = pathname?.includes('/room-configurator');

        // 1. Initialize GSAP & standard plugins (Safe to do directly on client)
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        window.gsap = gsap;
        window.ScrollTrigger = ScrollTrigger;
        window.ScrollToPlugin = ScrollToPlugin;
        window.SplitType = SplitType;

        // Removed THREE.js attachment to avoid conflicts

        // 2. Dynamically import libraries that require 'window' or 'document'
        try {
          const { default: jQuery } = await import("jquery");
          
          // @ts-ignore - imagesloaded doesn't provide types for the default export in some versions
          const { default: imagesLoaded } = await import("imagesloaded");
          // @ts-ignore - isotope-layout types can be finicky with dynamic imports
          const { default: Isotope } = await import("isotope-layout");
          // @ts-ignore - purecounter.js is a legacy script
          const { default: PureCounter } = await import("../../../public/assets/js/purecounter.js");

          // 3. Attach jQuery globally
          window.jQuery = window.$ = jQuery;

          // 4. Initialize imagesLoaded as jQuery plugin
          // @ts-ignore
          imagesLoaded.makeJQueryPlugin(jQuery);
          window.imagesLoaded = imagesLoaded;

          // 5. Initialize Isotope and bridge it to jQuery
          window.Isotope = Isotope;
          // Manual bridge for Isotope to jQuery
          // @ts-ignore
          jQuery.fn.isotope = function(options: any, ...args: any[]) {
            if (typeof options === 'string') {
              this.each(function() {
                // @ts-ignore
                const instance = Isotope.data(this);
                if (instance && typeof instance[options] === 'function') {
                  // @ts-ignore
                  instance[options](...args);
                }
              });
            } else {
              this.each(function() {
                new Isotope(this, options);
              });
            }
            return this;
          };

          // 6. Initialize PureCounter
          window.PureCounter = PureCounter;

          // 7. Load Legacy Theme Scripts Dynamically

          // @ts-ignore
          await import("../../../public/assets/js/magnific-popup.js");
          // @ts-ignore
          await import("../../../public/assets/js/nice-select.js");
          // @ts-ignore
          const pluginModule = await import("../../../public/assets/js/plugin.js");
          
          // After plugin.js loads, capture plugins from GSAP's global registry if they didn't attach to window
          if (window.gsap) {
             const G = window.gsap;
             
             // 1. Try to capture from module exports (if loaded as module)
             if (pluginModule) {
                if (!window.SplitText) {
                   window.SplitText = pluginModule.SplitText || pluginModule.default?.SplitText;
                }
                if (!window.ScrollSmoother) {
                   window.ScrollSmoother = pluginModule.ScrollSmoother || pluginModule.default?.ScrollSmoother;
                }
             }

             // 2. Capture from GSAP core globals (standard GSAP registration)
             window.ScrollSmoother = window.ScrollSmoother || (G.core ? G.core.globals().ScrollSmoother : undefined);
             window.SplitText = window.SplitText || (G.core ? G.core.globals().SplitText : undefined);

             // 3. Fallback: check utils if available
             if (!window.ScrollSmoother && G.utils && G.utils.getGSAP) {
                window.ScrollSmoother = G.utils.getGSAP().core.globals().ScrollSmoother;
             }
             if (!window.SplitText && G.utils && G.utils.getGSAP) {
                window.SplitText = G.utils.getGSAP().core.globals().SplitText;
             }

             // 4. Some versions attach to window.window due to minification quirks
             // @ts-ignore
             if (!window.SplitText && window.window && window.window.SplitText) {
                // @ts-ignore
                window.SplitText = window.window.SplitText;
             }

             // Explicitly register them if found
             if (window.SplitText) {
                gsap.registerPlugin(window.SplitText);
             }
             if (window.ScrollSmoother) {
                gsap.registerPlugin(window.ScrollSmoother);
             }

             console.log("GSAP Plugins Status:", {
                SplitText: !!window.SplitText,
                ScrollSmoother: !!window.ScrollSmoother
             });
          }

          console.log("Premium Theme Engine Initialized (Full Client-Side Load)");
        } catch (err) {
          console.error("Theme Initialization Error:", err);
        }
      };

      initTheme();
    }
  }, [pathname]);

  return null;
}
