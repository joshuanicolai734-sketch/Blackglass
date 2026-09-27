"use client";

import { useState } from "react";

const labels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  call: "Call booked",
  won: "Client",
  lost: "Closed",
};

export default function StatusControl({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function update(next: string) {
    const previous = status;
    setStatus(next);
    setBusy(true);
    setMessage("Saving…");
    try {
      const response = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!response.ok) throw new Error("Unable to save");
      setMessage("Saved");
    } catch {
      setStatus(previous);
      setMessage("Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Permanently delete this enquiry? This cannot be undone.")) return;
    setBusy(true);
    setMessage("Deleting…");
    try {
      const response = await fetch("/api/admin/enquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Unable to delete");
      window.location.reload();
    } catch {
      setMessage("Could not delete. Try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="lead-meta" htmlFor={`status-${id}`}>STATUS</label><br />
      <select id={`status-${id}`} value={status} disabled={busy} onChange={(event) => update(event.target.value)}>
        {Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
      <p className="lead-status-message" role="status">{message}</p>
      <button className="lead-delete" type="button" disabled={busy} onClick={remove}>Delete enquiry</button>
    </div>
  );
}
