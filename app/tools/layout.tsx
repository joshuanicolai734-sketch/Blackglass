import type { ReactNode } from "react";
import "./tools.css";

/** The training tools share one stylesheet; each page renders its own header, main and footer. */
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return children;
}
