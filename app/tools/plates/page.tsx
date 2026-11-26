import type { Metadata } from "next";
import { PlateTool } from "@/components/tools/plate-tool";
import { qs, ToolPage, type SearchParams } from "@/components/tools/tool-page";
import { ogBase } from "@/content/site";

const description = "Free plate calculator in kilograms: which plates go on each side of the bar for any weight, for 20, 15 and 10 kg bars, with or without collars.";

export const metadata: Metadata = {
  title: "Plate calculator",
  description,
  alternates: { canonical: "/tools/plates" },
  openGraph: { ...ogBase, title: "Plate calculator | Blackglass", description, url: "/tools/plates", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass" }] },
};

export default async function PlatesPage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  return (
    <ToolPage page="tool_plates" name="Plate calculator" title="Load the bar." intro="Type the weight you’re after. You’ll get the plates for each side, heaviest first, and the nearest loads either side if it can’t be made exactly."
      method={
        <div className="prose">
          <p>The calculator takes away the bar (and collars, if you use them), halves what’s left and fills each side with the heaviest plates first. Everything is worked out in grams, so 2.5 and 1.25 kg plates add up exactly.</p>
          <p>It assumes you have enough of each plate. If a weight can’t be made with the plates you’ve chosen, you’ll see the nearest load below and above it.</p>
        </div>
      }>
      <PlateTool initial={{ kg: qs(q.kg), bar: qs(q.bar) || "20", set: qs(q.set) || "standard", collars: qs(q.collars) === "1" }} />
    </ToolPage>
  );
}
