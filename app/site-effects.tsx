"use client";

import { useEffect } from "react";

export default function SiteEffects() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/site.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return null;
}
