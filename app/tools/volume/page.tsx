import type { Metadata } from "next";
import { qs, ToolPage, type SearchParams } from "@/components/tools/tool-page";
import { VolumeTool, type VolumeRow } from "@/components/tools/volume-tool";
import { ogBase } from "@/content/site";
import { EXAMPLE_PLAN, GUIDE, MAX_ROWS } from "@/lib/tools/volume";

const description = "Free weekly training volume calculator: hard sets per muscle from a week of exercises, against a common guide of 10 to 20 hard sets a week for muscle growth.";

export const metadata: Metadata = {
  title: "Weekly volume calculator",
  description,
  alternates: { canonical: "/tools/volume" },
  openGraph: { ...ogBase, title: "Weekly volume calculator | Blackglass", description, url: "/tools/volume", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass" }] },
};

export default async function VolumePage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  const given: VolumeRow[] = Array.from({ length: MAX_ROWS }, (_, i) => ({ exercise: qs(q[`e${i + 1}`]), sets: qs(q[`s${i + 1}`]) }));
  const any = given.some((r) => r.exercise || r.sets);
  const rows = any ? given : EXAMPLE_PLAN.map((r) => ({ exercise: r.exercise, sets: String(r.sets) }));
  return (
    <ToolPage page="tool_volume" name="Weekly volume" title="Count the sets that count."
      intro="List a week of training: each exercise and how many hard sets you do of it. You’ll see the sets each muscle gets, against a guide range for growth."
      method={
        <div className="prose">
          <p><strong>Hard sets</strong> are working sets taken close to failure, roughly RPE 7 or harder. Warm-ups don&rsquo;t count.</p>
          <p><strong>Counting:</strong> a set counts fully for the muscles an exercise mainly trains and half for the muscles it helps. A bench press set is 1 for chest and 0.5 each for triceps and shoulders.</p>
          <p><strong>The guide range:</strong> a 2017 meta-analysis found more muscle growth from {GUIDE.low} or more hard sets per muscle a week than from fewer (<a href="https://doi.org/10.1080/02640414.2016.1210197" rel="noopener">Schoenfeld, Ogborn &amp; Krieger</a>). Many coaches treat about {GUIDE.high} as a practical upper end, because more isn&rsquo;t always better once recovery runs short. Under the range can still maintain muscle, and strength needs less.</p>
        </div>
      }>
      <VolumeTool initial={rows} example={!any} />
    </ToolPage>
  );
}
