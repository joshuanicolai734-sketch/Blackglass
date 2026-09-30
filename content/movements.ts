/** Cues describe the authored preview. They are not personalised form advice. */
export const movements = [
  {
    id: "back-squat", name: "Back squat", equipment: "Barbell", pattern: "Squat",
    summary: "Follow the bar as the hips and knees bend, then watch the figure return to standing.",
    phases: [
      { name: "Brace", at: 0, text: "The feet stay planted and the bar rests across the upper back." },
      { name: "Reach", at: 0.5, text: "The hips and knees bend together as the bar moves down." },
      { name: "Return", at: 0.75, text: "The figure rises to the starting position with the bar on the upper back." },
    ],
  },
  {
    id: "deadlift", name: "Deadlift", equipment: "Barbell", pattern: "Hinge",
    summary: "Watch the bar leave the floor, travel close to the body and settle back onto the ground.",
    phases: [
      { name: "Brace", at: 0, text: "The bar starts on the floor, close to the shins." },
      { name: "Reach", at: 0.5, text: "The legs and hips extend; the bar rises with the arms straight." },
      { name: "Return", at: 0.75, text: "The hips and knees bend as the bar returns to the floor." },
    ],
  },
  {
    id: "push-up", name: "Push-up", equipment: "Bodyweight", pattern: "Press",
    summary: "Compare the body line on the way down and on the way back up, from two angles.",
    phases: [
      { name: "Brace", at: 0, text: "The hands and toes support a long body line." },
      { name: "Reach", at: 0.5, text: "The elbows bend and the chest approaches the floor." },
      { name: "Return", at: 0.75, text: "The arms extend and the body rises together." },
    ],
  },
] as const;

export function movementPhase(progress: number) {
  return progress < 0.12 || progress >= 0.94 ? 0 : progress < 0.56 ? 1 : 2;
}
