import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { WaText } from "@/components/wa-text";
import { EXECUTIVES, type Persona } from "@/lib/noa/engine";
import { useNoa } from "@/lib/noa/store";
import { RotateCcw, Send, Shield } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

const SUGGESTIONS = [
  "שלום",
  "בוקר טוב צריך 30 מלט",
  "2 בלה חול ו-20 ניצבים",
  "בלוק 20 2 חורים",
  "פרופיל 50",
  "מה השעות בסניף?",
  "כמה עולה המלט?",
];

function Home() {
  const messages = useNoa((s) => s.messages);
  const send = useNoa((s) => s.send);
  const resetChat = useNoa((s) => s.resetChat);
  const persona = useNoa((s) => s.persona);
  const setPersona = useNoa((s) => s.setPersona);
  const customerName = useNoa((s) => s.customerName);
  const phone = useNoa((s) => s.phone);
  const setCustomer = useNoa((s) => s.setCustomer);
  const phase = useNoa((s) => s.phase);
  const draft = useNoa((s) => s.draft);
  const [text, setText] = useState("");
  const [name, setName] = useState(customerName);
  const [tel, setTel] = useState(phone);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function onSend(value?: string) {
    const v = (value ?? text).trim();
    if (!v) return;
    send(v);
    setText("");
  }

  return (
    <Shell>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-brand px-4 py-3 text-surface">
            <div>
              <p className="font-display text-base font-bold">מוקד ראמי מסארווה</p>
              <p className="text-xs text-surface/80">ח. סבן חומרי בניין · נועה בשירות</p>
            </div>
            <button
              type="button"
              onClick={resetChat}
              className="inline-flex items-center gap-1 rounded-full bg-surface/15 px-3 py-2 text-xs font-medium hover:bg-surface/25"
            >
              <RotateCcw className="size-3.5" />
              שיחה חדשה
            </button>
          </div>

          <div ref={scroller} className="h-[min(62vh,560px)] space-y-3 overflow-y-auto bg-wa px-3 py-4">
            {messages.length === 0 && (
              <div className="mx-auto max-w-sm rounded-2xl bg-surface/80 px-4 py-6 text-center text-sm text-muted shadow-sm">
                <p className="font-display text-base font-bold text-ink">כאן מדברים עם נועה</p>
                <p className="mt-2 leading-relaxed">
                  ברכה פותחת את כרטיס התפריט. הזמנה עם כמות נכנסת ישר לאיסוף. שאלה על מחיר עוברת לראמי — אלא אם אתה בהנהלה.
                </p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={"flex " + (m.role === "customer" ? "justify-start" : "justify-end")}>
                <div
                  className={
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm " +
                    (m.role === "customer"
                      ? "rounded-tr-sm bg-wa-out text-ink"
                      : "rounded-tl-sm bg-wa-in text-ink")
                  }
                >
                  {m.image && (
                    <img
                      src={m.image}
                      alt=""
                      className="mb-2 max-h-44 w-full rounded-xl object-cover"
                    />
                  )}
                  <WaText text={m.text} />
                  <p className="mt-1 text-[10px] text-muted">{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-line bg-surface px-3 py-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSend(s)}
                  className="shrink-0 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs text-ink hover:border-brand hover:text-brand"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                onSend();
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="הודעה לנועה…"
                className="min-w-0 flex-1 rounded-full border border-line bg-surface-2 px-4 py-3 text-sm outline-none focus:border-brand"
                aria-label="הודעה"
              />
              <button
                type="submit"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-surface hover:bg-brand-deep"
                aria-label="שליחה"
              >
                <Send className="size-4 rotate-180" />
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-card border border-line bg-surface p-4 shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Shield className="size-4 text-brand" />
              מי בצד השני
            </p>
            <div className="grid gap-2">
              <PersonaBtn
                active={persona === "customer"}
                label="לקוח"
                hint="תפריט, הזמנה, העברה לראמי"
                onClick={() => setPersona("customer", name, tel)}
              />
              {EXECUTIVES.map((ex) => (
                <PersonaBtn
                  key={ex.id}
                  active={persona === ex.id}
                  label={ex.name}
                  hint={ex.phone}
                  onClick={() => setPersona(ex.id as Persona, ex.name, ex.phone)}
                />
              ))}
            </div>
            {persona === "customer" && (
              <form
                className="mt-3 grid gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setCustomer(name.trim(), tel.trim());
                }}
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="שם לקוח מזוהה"
                  className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <input
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                  placeholder="טלפון"
                  className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <button type="submit" className="rounded-xl bg-ink px-3 py-2 text-sm font-medium text-surface">
                  שמור זיהוי לשיחה
                </button>
              </form>
            )}
          </div>

          <div className="rounded-card border border-line bg-surface p-4 text-sm shadow-sm">
            <p className="font-bold">מצב האיסוף</p>
            <p className="mt-1 text-muted">שלב: {phaseLabel(phase)}</p>
            <ul className="mt-3 space-y-1 text-ink">
              <li>לקוח: {draft.customerName || customerName || "—"}</li>
              <li>כתובת: {draft.address || "—"}</li>
              <li>קשר: {draft.contact || "—"}</li>
              <li>פריקה: {draft.unload || "—"}</li>
              <li>מועד: {draft.requestedTime || "—"}</li>
              <li>שורות: {draft.lines.length}</li>
            </ul>
            {draft.lines.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs">
                {draft.lines.map((l) => (
                  <li key={l.sku}>
                    {l.sku} · {l.name} · {l.qty} {l.unit}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function PersonaBtn({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-2xl border px-3 py-2 text-start transition-colors " +
        (active ? "border-brand bg-brand text-surface" : "border-line bg-surface-2 hover:border-sand")
      }
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className={"block text-xs " + (active ? "text-surface/80" : "text-muted")}>{hint}</span>
    </button>
  );
}

function phaseLabel(phase: string): string {
  const map: Record<string, string> = {
    idle: "ממתין לפנייה",
    menu: "תפריט פתיחה",
    collect: "איסוף הזמנה",
    "await-confirm": "ממתין לאישור",
    recorded: "נרשם בגיליון",
    handoff: "הועבר לראמי",
    exec: "ערוץ הנהלה",
  };
  return map[phase] ?? phase;
}
