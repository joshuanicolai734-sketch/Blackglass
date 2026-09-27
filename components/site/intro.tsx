import { lockupViewBox, paths } from "@/content/brand";
import introScript from "./intro.js?raw";

// The overlay is shown only when the head gate sets html[data-intro="play"] (see app/layout.tsx), so
// visitors who skip it never paint it. It is an HTML island: React doesn't manage its contents, which lets
// the script animate and settle it before hydration without a mismatch.
const markup = `
<div id="intro" aria-hidden="true">
  <i class="in-bg"></i>
  <div class="in-l">
    <svg class="in-w" viewBox="${lockupViewBox}" focusable="false">
      <clipPath id="in-wc"><rect class="in-wr" x="-296" y="-10" width="414" height="108"/></clipPath>
      <path clip-path="url(#in-wc)" fill="#F4F5EF" d="${paths.wordmark}"/>
    </svg>
    <svg class="in-m" viewBox="${lockupViewBox}" focusable="false">
      <mask id="in-rm" maskUnits="userSpaceOnUse" x="-10" y="-10" width="108" height="108" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="147" stroke-dashoffset="147">
        <path class="in-rs" d="M10.361 13.189 20.05 3.5H67.95L84.5 20.05V67.95L74.811 77.639"/>
        <path class="in-rs" d="M13.189 10.361 3.5 20.05V67.95L20.05 84.5H67.95L77.639 74.811"/>
      </mask>
      <clipPath id="in-fc"><path class="in-fw" d="M-400 400 400-400H-400Z" transform="translate(14.5505 14.5505)"/></clipPath>
      <clipPath id="in-oc"><path d="${paths.pane}"/></clipPath>
      <linearGradient id="in-lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="8" y2="8">
        <stop offset="0" stop-color="#F4F5EF" stop-opacity="0"/><stop offset=".5" stop-color="#F4F5EF" stop-opacity=".34"/><stop offset="1" stop-color="#F4F5EF" stop-opacity="0"/>
      </linearGradient>
      <g class="in-s"><g class="in-d">
        <path class="in-gr" fill="#101113" fill-rule="evenodd"/>
        <g>
          <path id="in-pane" fill="#18191C" d="${paths.pane}"/>
          <path id="in-facet" clip-path="url(#in-fc)" fill="#2B2D32" d="${paths.facet}"/>
          <path id="in-glint" fill="#D5FF3F" d="${paths.glint}"/>
          <g clip-path="url(#in-oc)"><path class="in-sw" fill="url(#in-lg)" d="M-100 100 100-100h16L-84 100Z" transform="translate(-8 -8)"/></g>
          <path mask="url(#in-rm)" fill="#F4F5EF" fill-rule="evenodd" d="${paths.rim}"/>
        </g>
      </g></g>
    </svg>
  </div>
</div>
<script>${introScript}</script>`;

export default function Intro() {
  return <div className="intro-island" dangerouslySetInnerHTML={{ __html: markup }} suppressHydrationWarning />;
}
