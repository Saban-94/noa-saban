/** Render the playbook's WhatsApp subset: *bold* and _italic_. No markdown links or headings. */
export function WaText({ text }: { text: string }) {
  const parts: { t: string; k: "b" | "i" | "n" }[] = [];
  const re = /(\*[^*\n]+\*|_[^_\n]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ t: text.slice(last, m.index), k: "n" });
    const token = m[0];
    if (token.startsWith("*")) parts.push({ t: token.slice(1, -1), k: "b" });
    else parts.push({ t: token.slice(1, -1), k: "i" });
    last = m.index + token.length;
  }
  if (last < text.length) parts.push({ t: text.slice(last), k: "n" });
  return (
    <span className="wa-text">
      {parts.map((p, i) =>
        p.k === "b" ? (
          <strong key={i}>{p.t}</strong>
        ) : p.k === "i" ? (
          <em key={i}>{p.t}</em>
        ) : (
          <span key={i}>{p.t}</span>
        ),
      )}
    </span>
  );
}
