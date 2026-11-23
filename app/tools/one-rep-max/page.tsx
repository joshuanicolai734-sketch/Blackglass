import type { Metadata } from "next";
import { StrengthTool } from "@/components/tools/strength-tool";
import { qs, ToolPage, type SearchParams } from "@/components/tools/tool-page";
import { ogBase } from "@/content/site";

const description = "Free one-rep max calculator with RPE: estimate your 1RM from any set, see loads by percentage and rep max, and get the weight for your next set at a target RPE.";

export const metadata: Metadata = {
  title: "One-rep max and RPE calculator",
  description,
  alternates: { canonical: "/tools/one-rep-max" },
  openGraph: { ...ogBase, title: "One-rep max and RPE calculator | Blackglass", description, url: "/tools/one-rep-max", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass" }] },
};

export default async function OneRepMaxPage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  return (
    <ToolPage page="tool_1rm" name="One-rep max and RPE" title="Know your max without testing it."
      intro="Enter a recent hard set and how close to failure it was. You’ll get an estimated one-rep max, loads by percentage, and the weight for the set you’re planning next."
      method={
        <div className="prose">
          <p><strong>The estimate</strong> uses Epley&rsquo;s formula: one-rep max = weight × (1 + reps ÷ 30). Brzycki&rsquo;s formula, weight × 36 ÷ (37 − reps), is shown alongside so you can see how much the methods differ. Both are most reliable from sets of about 10 reps or fewer.</p>
          <p><strong>RPE</strong> here means reps in reserve: RPE 10 is a set with nothing left, RPE 9 has one more rep in it, RPE 8 two, and so on (<a href="https://doi.org/10.1519/JSC.0000000000001049" rel="noopener">Zourdos et al., 2016</a>). A set of 5 at RPE 8 is treated as 7 reps to failure, and the next-set load runs the same sum backwards.</p>
          <p>Estimates are a starting point. Bar speed, sleep and technique all move the real number, so adjust from how the first set feels.</p>
        </div>
      }>
      <StrengthTool initial={{ kg: qs(q.kg), reps: qs(q.reps), rpe: qs(q.rpe) || "10", round: qs(q.round) || "2.5", preps: qs(q.preps) || "5", prpe: qs(q.prpe) || "8" }} />
    </ToolPage>
  );
}
