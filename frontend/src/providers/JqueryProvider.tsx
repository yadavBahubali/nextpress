"use client";

import { useEffect } from "react";

export default function JqueryProvider() {
  useEffect(() => {
    const loadJquery = async () => {
      const jquery = (await import("jquery")).default;
      // @ts-ignore
      window.$ = window.jQuery = jquery;
    };

    loadJquery();
  }, []);

  return null;
}
