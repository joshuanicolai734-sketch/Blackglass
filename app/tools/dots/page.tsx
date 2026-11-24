import type { Metadata } from "next";
import { DotsTool } from "@/components/tools/dots-tool";
import { qs, ToolPage, type SearchParams } from "@/components/tools/tool-page";
import { ogBase } from "@/content/site";

const description = "Free DOTS calculator: a bodyweight-adjusted strength score for your powerlifting total or a single lift, with what the same score takes at other bodyweights.";

export const metadata: Metadata = {
  title: "DOTS strength score calculator",
  description,
  alternates: { canonical: "/tools/dots" },
  openGraph: { ...ogBase, title: "DOTS strength score calculator | Blackglass", description, url: "/tools/dots", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass" }] },
};

export default async function DotsPage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  return (
    <ToolPage page="tool_dots" name="Strength score" title="Strength, weighed fairly."
      intro="Enter your bodyweight and a total or a single lift. You’ll get its DOTS score, which lets lifters of different bodyweights compare, and what the same score would take a few kilograms either side."
      method={
        <div className="prose">
          <p><strong>The score</strong> is DOTS: the weight lifted × 500, divided by a curve of bodyweight. The curve rises steeply for lighter lifters and flattens for heavier ones, so the same score asks for more kilograms the heavier you are. It uses the published DOTS coefficients, with separate curves for men and women.</p>
          <p><strong>Its limits.</strong> DOTS was made for powerlifting totals, so a score for one lift only compares with the same lift. Bodyweight is held to the range the formula was fitted for: 40 to 210 kg with the men&rsquo;s coefficients, 40 to 150 kg with the women&rsquo;s.</p>
          <p>A score compares lifters. It doesn&rsquo;t say what you should lift next: for that, see the <a className="inline-link" href="/tools/one-rep-max">one-rep max tool</a>.</p>
        </div>
      }>
      <DotsTool initial={{ bw: qs(q.bw), kg: qs(q.kg), lift: qs(q.lift) || "total", f: qs(q.f) || "men" }} />
    </ToolPage>
  );
}
