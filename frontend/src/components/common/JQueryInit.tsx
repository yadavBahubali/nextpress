"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

export default function JQueryInit() {
  useEffect(() => {
    const loadJQuery = async () => {
      const jqueryModule = await import("jquery");

      const $ = jqueryModule.default;

      // attach globally
      window.$ = $;
      window.jQuery = $;

      // Load plugins
      try {
        // @ts-ignore
        await import("../../../public/assets/js/nice-select.js");
        console.log("jQuery plugins loaded");
      } catch (err) {
        console.error("Error loading jQuery plugins:", err);
      }

      console.log("jQuery loaded");
    };

    loadJQuery();
  }, []);

  return null;
}