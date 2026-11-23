/* The training tools at /tools. The hub, each tool page’s “More tools”, and the sitemap read this list. */

/** The training tools, in the order the hub lists them. `page` names the visit count in db/events.ts. */
export const TOOLS = [
  { href: "/tools/plates", page: "tool_plates", name: "Plate calculator", line: "Which plates go on each side for any weight, with the nearest loads when it can’t be made exactly." },
  { href: "/tools/one-rep-max", page: "tool_1rm", name: "One-rep max and RPE", line: "Estimate your 1RM from any set, then the load for the reps and effort you’re planning next." },
  { href: "/tools/warm-up", page: "tool_warmup", name: "Warm-up builder", line: "A ramp from the empty bar to your working weight, with the plates for every set." },
  { href: "/tools/rest-timer", page: "tool_timer", name: "Rest timer", line: "A big countdown you can read from the bench, with sound and vibration at the end. It can keep your screen on while you rest." },
  { href: "/tools/volume", page: "tool_volume", name: "Weekly volume", line: "Hard sets per muscle from a week of training, against a common guide of 10 to 20 sets." },
] as const;
