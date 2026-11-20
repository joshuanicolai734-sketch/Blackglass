/** Synthetic browser demo only. No accounts, network calls or training prescriptions. */
export const DEMO_EXERCISES = [
  { id: "back-squat", name: "Back squat", pattern: "Squat", reps: 8, sets: 3 },
  { id: "deadlift", name: "Deadlift", pattern: "Hinge", reps: 6, sets: 3 },
  { id: "push-up", name: "Push-up", pattern: "Press", reps: 10, sets: 3 },
] as const;

export type LoggedSet = { reps: number; weight: number; done: boolean };
export type DemoSession = {
  version: 1;
  active: number;
  sets: LoggedSet[][];
  restUntil: number;
  restDuration: number;
};

export function createSession(): DemoSession {
  return { version: 1, active: 0, sets: DEMO_EXERCISES.map((exercise) => Array.from({ length: exercise.sets }, () => ({ reps: exercise.reps, weight: 0, done: false }))), restUntil: 0, restDuration: 60 };
}

export function validSet(reps: number, weight: number) {
  return Number.isInteger(reps) && reps >= 1 && reps <= 100 && Number.isFinite(weight) && weight >= 0 && weight <= 500 && Math.abs(weight * 4 - Math.round(weight * 4)) < 1e-7;
}

export function readSession(raw: string | null, now = Date.now()): DemoSession {
  if (!raw) return createSession();
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return createSession();
    const data = value as Partial<DemoSession>;
    if (data.version !== 1 || !Number.isInteger(data.active) || data.active! < 0 || data.active! >= DEMO_EXERCISES.length || !Array.isArray(data.sets) || data.sets.length !== DEMO_EXERCISES.length) return createSession();
    if (!data.sets.every((sets, i) => Array.isArray(sets) && sets.length === DEMO_EXERCISES[i].sets && sets.every((set) => set && typeof set.done === "boolean" && validSet(set.reps, set.weight)))) return createSession();
    if (![30, 60, 90].includes(data.restDuration!) || typeof data.restUntil !== "number" || !Number.isFinite(data.restUntil) || data.restUntil < 0 || data.restUntil > now + 90_000) return createSession();
    return { version: 1, active: data.active!, sets: data.sets.map((sets) => sets.map(({ reps, weight, done }) => ({ reps, weight, done }))), restUntil: data.restUntil > now ? data.restUntil : 0, restDuration: data.restDuration! };
  } catch { return createSession(); }
}

export function sessionSummary(session: DemoSession) {
  const complete = session.sets.flat().filter((set) => set.done);
  return { completed: complete.length, reps: complete.reduce((total, set) => total + set.reps, 0), volume: complete.reduce((total, set) => total + set.reps * set.weight, 0), total: DEMO_EXERCISES.reduce((total, exercise) => total + exercise.sets, 0) };
}

export function recordSet(session: DemoSession, exercise: number, index: number, reps: number, weight: number, now = Date.now()): DemoSession {
  if (!validSet(reps, weight) || !session.sets[exercise]?.[index] || session.sets[exercise][index].done) return session;
  const sets = session.sets.map((rows, i) => rows.map((set, j) => i === exercise && j === index ? { reps, weight, done: true } : { ...set }));
  const completed = sets.flat().every((set) => set.done);
  return { ...session, sets, restUntil: completed ? 0 : now + session.restDuration * 1000 };
}
