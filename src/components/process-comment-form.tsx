"use client";
import { useState } from "react";

export function ProcessCommentForm({ processPublicId }: { processPublicId: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); const form = event.currentTarget;
    const body = new FormData(form).get("body");
    const response = await fetch(`/api/client/processes/${processPublicId}/comments`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
    const result = await response.json(); setBusy(false); setMessage(response.ok ? "Comentario publicado." : result.error?.message);
    if (response.ok) { form.reset(); window.location.reload(); }
  }
  return <form className="comment-form" onSubmit={submit}><label>Agregar comentario visible para el equipo<textarea name="body" rows={3} minLength={2} maxLength={4000} required /></label><button disabled={busy}>{busy ? "Publicando…" : "Publicar comentario"}</button>{message && <small role="status">{message}</small>}</form>;
}
