import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { CATALOG } from "@/lib/noa/engine";
import { Search } from "lucide-react";

export const Route = createFileRoute("/catalog")({ component: CatalogPage });

const LABELS: Record<string, string> = {
  aggregates: "אגרגטים",
  cement: "מלט וטיט",
  blocks: "בלוקים",
  profiles: "פרופילים",
  service: "שירות",
  deposit: "פיקדון",
};

function CatalogPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const items = useMemo(() => {
    return CATALOG.filter((c) => (cat === "all" ? true : c.category === cat)).filter((c) => {
      const blob = `${c.sku} ${c.name} ${c.aliases.join(" ")}`;
      return blob.includes(q.trim());
    });
  }, [q, cat]);

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">מילון לוגיסטי</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          נרמול השמות שנועה מכירה. פרופילים נמכרים רק בחבילות של 10. פיקדון בלה הוא 1:1, משטח מלט כל 40 שקים, משטח בלוק כל 75 יחידות.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חיפוש לפי כינוי, שם או מק״ט"
            className="w-full rounded-2xl border border-line bg-surface py-3 pe-4 ps-10 text-sm outline-none focus:border-brand"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto">
          {["all", ...Object.keys(LABELS)].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setCat(k)}
              className={
                "shrink-0 rounded-full px-3 py-2 text-sm " +
                (cat === k ? "bg-brand text-surface" : "bg-surface text-ink border border-line")
              }
            >
              {k === "all" ? "הכל" : LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item.sku} className="rounded-card border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold leading-snug">{item.name}</p>
                <p className="text-sm text-muted">{LABELS[item.category]} · {item.unit}</p>
              </div>
              <span className="rounded-xl bg-bg-deep px-2 py-1 font-display text-sm font-bold">{item.sku}</span>
            </div>
            {item.aliases.length > 0 && (
              <p className="mt-3 text-sm">
                <span className="text-muted">כינויים: </span>
                {item.aliases.join(" · ")}
              </p>
            )}
            <p className="mt-2 text-xs text-muted">
              {item.weightKg > 0 ? `משקל יחידה משוער ${item.weightKg} ק״ג` : "ללא משקל מטען"}
              {item.pack ? ` · חבילה של ${item.pack}` : ""}
              {item.note ? ` · ${item.note}` : ""}
            </p>
          </article>
        ))}
      </div>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <Rule t="בלוק 20" d="במק״ט הפעיל יש רק 4 חורים (12204). בקשת 2 חורים מקבלת שאלת התאמה אחת." />
        <Rule t="פרופיל 50" d="בלי ניצב או מסלול נועה שואלת. כמות שאינה כפולה של 10 לא נרשמת." />
        <Rule t="מנוף השרון" d="פריקת מנוף לרעננה או כפר סבא מוסיפה אוטומטית את מק״ט 18055." />
      </section>
    </Shell>
  );
}

function Rule({ t, d }: { t: string; d: string }) {
  return (
    <div className="rounded-card border border-line bg-surface-2 p-4">
      <p className="font-display font-bold">{t}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
    </div>
  );
}
