import type { Metadata } from "next";
import { qs, ToolPage, type SearchParams } from "@/components/tools/tool-page";
import { WarmupTool } from "@/components/tools/warmup-tool";
import { ogBase } from "@/content/site";

const description = "Free warm-up set calculator: a ramp from the empty bar to your working weight, with reps and the plates for every set, in kilograms.";

export const metadata: Metadata = {
  title: "Warm-up builder",
  description,
  alternates: { canonical: "/tools/warm-up" },
  openGraph: { ...ogBase, title: "Warm-up builder | Blackglass", description, url: "/tools/warm-up", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass" }] },
};

export default async function WarmupPage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  return (
    <ToolPage page="tool_warmup" name="Warm-up builder" title="Ramp up, don’t wear out."
      intro="Enter your first work set. You’ll get a short ramp from the empty bar, with fewer reps as the weight climbs, and the plates for each set."
      method={
        <div className="prose">
          <p>The ramp starts with the empty bar for 10, then about 40% of your work weight for 5, 60% for 3 and 80% for 2. Before heavy sets of 5 or fewer it adds a single at about 90%. Each step is rounded to a weight your plates can make, and a step that rounds onto the one before it is dropped.</p>
          <p>The aim is to rehearse the movement and get warm without tiring yourself before the sets that count. If something feels off, add a set; if you&rsquo;re already warm from a previous lift, you can skip the lightest ones.</p>
        </div>
      }>
      <WarmupTool initial={{ kg: qs(q.kg), reps: qs(q.reps) || "5", bar: qs(q.bar) || "20", set: qs(q.set) || "standard" }} />
    </ToolPage>
  );
}
