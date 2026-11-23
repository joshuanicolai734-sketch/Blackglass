"use client";

import { useEffect, useState } from "react";

/** A query string without the empty values. */
export const toQuery = (params: Record<string, string>) => new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "")).toString();

/** Keeps the address bar in step with a tool's inputs, so a result can be bookmarked or shared. */
export function syncQuery(path: string, params: Record<string, string>, page?: string) {
  const q = toQuery(params);
  const next = q ? `${path}?${q}` : path;
  if (next !== location.pathname + location.search) history.replaceState(history.state, "", next);
  if (page) markUsed(page);
}

const used = new Set<string>();
/** Counts a tool as used, once per page load, the first time someone changes it: a daily total in db/events.ts,
    never what they entered. */
export function markUsed(page: string) {
  if (used.has(page)) return;
  used.add(page);
  (window as Window & { blackglassTrack?: (event: string) => void }).blackglassTrack?.(`${page}_used`);
}

/** `text`, once it has stopped changing for `ms`: what a screen reader hears, instead of every keystroke. */
export function useSettled(text: string, ms = 700) {
  const [settled, setSettled] = useState(text);
  useEffect(() => {
    const t = setTimeout(() => setSettled(text), ms);
    return () => clearTimeout(t);
  }, [text, ms]);
  return settled;
}
