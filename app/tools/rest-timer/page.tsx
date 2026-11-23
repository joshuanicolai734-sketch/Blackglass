import type { Metadata } from "next";
import { TimerTool } from "@/components/tools/timer-tool";
import { qs, ToolPage, type SearchParams } from "@/components/tools/tool-page";
import { ogBase } from "@/content/site";
import { clampSeconds } from "@/lib/tools/timer";

const description = "Free rest timer for the gym: one tap for 1, 1.5, 2, 3 or 4 minutes, a big countdown, sound and vibration at the end, and it keeps time while your phone sleeps.";

export const metadata: Metadata = {
  title: "Rest timer",
  description,
  alternates: { canonical: "/tools/rest-timer" },
  openGraph: { ...ogBase, title: "Rest timer | Blackglass", description, url: "/tools/rest-timer", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass" }] },
};

export default async function RestTimerPage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  const s = qs(q.s);
  return (
    <ToolPage page="tool_timer" name="Rest timer" title="Rest on purpose."
      intro="One tap starts the rest. The countdown is big enough to read from the bench, and it ends with a sound and a buzz."
      method={
        <div className="prose">
          <p>The timer remembers when your rest ends, not a ticking count, so it stays right if your phone sleeps, you switch apps or the page reloads. While it runs it can keep the screen on, where your browser allows it.</p>
          <p>As a rough guide, rest about 2 to 3 minutes before heavy compound sets and 1 to 2 minutes for lighter accessory work. Start the next set when you can give it a real effort.</p>
        </div>
      }>
      <TimerTool initialSeconds={clampSeconds(Number(s) || 90)} autostart={s !== ""} />
    </ToolPage>
  );
}
