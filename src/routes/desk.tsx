import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useNoa } from "@/lib/noa/store";
import { FileCheck2, Truck } from "lucide-react";

export const Route = createFileRoute("/desk")({ component: DeskPage });

const TRUCK_STATES = ["בדרך להוד השרון", "בליקוט — יציאה 15:30", "פנוי במגרש", "יצא לאספקה", "חזר לסניף"];

function DeskPage() {
  const certs = useNoa((s) => s.certsPending);
  const toggleCert = useNoa((s) => s.toggleCert);
  const trucks = useNoa((s) => s.trucks);
  const setTruck = useNoa((s) => s.setTruck);
  const orders = useNoa((s) => s.orders);

  const openCerts = certs.filter((c) => !c.signed);

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">שולחן הנהלה</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          תמונת המצב שנועה פותחת להראל ולראמי מתוך גיליון בדיקת תעודות — בלי תפריט לקוחות ובלי העברה החוצה.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <FileCheck2 className="size-5 text-brand" />
              בירור הראל · מנכ״ל
            </h2>
            <span className="rounded-full bg-bg-deep px-3 py-1 text-xs font-semibold">{openCerts.length} ממתינות</span>
          </div>
          <ul className="space-y-3">
            {certs.map((c) => (
              <li key={c.id} className="rounded-2xl border border-line p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {c.id} · {c.customer}
                    </p>
                    <p className="text-sm text-muted">
                      נהג {c.driver} · {c.amount}
                    </p>
                    <p className="mt-1 text-sm">{c.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCert(c.id)}
                    className={
                      "shrink-0 rounded-full px-3 py-2 text-xs font-semibold " +
                      (c.signed ? "bg-moss-soft text-moss" : "bg-brand text-surface")
                    }
                  >
                    {c.signed ? "חתום" : "חתימת מנכ״ל"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card border border-line bg-surface p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <Truck className="size-5 text-brand" />
            משאיות
          </h2>
          <ul className="space-y-3">
            {trucks.map((t) => (
              <li key={t.id} className="rounded-2xl bg-surface-2 p-3">
                <p className="font-semibold">
                  {t.name} · {t.kind}
                </p>
                <label className="mt-2 block text-xs text-muted">
                  סטטוס
                  <select
                    value={t.state}
                    onChange={(e) => setTruck(t.id, e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink"
                  >
                    {TRUCK_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl border border-dashed border-line p-3 text-sm">
            <p className="font-semibold">דוח יומי · טאב הזמנות</p>
            <p className="mt-1 text-muted">{orders.length} שורות בגיליון החי · {orders.filter((o) => o.status === "סופק").length} סופקו · {orders.filter((o) => o.status === "בוטל").length} בוטלו</p>
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-card border border-line bg-ink p-5 text-surface">
        <p className="font-display text-lg font-bold">סמכות</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-surface/80">
          הראל אידלסון, ראמי מסארווה והקו הניהולי מקבלים מחיר, הנחה ודוח ישירות. מול לקוח — נועה לא סוגרת מחיר ולא משבצת משאית. שיבוץ סופי נשאר אצל ראמי.
        </p>
      </section>
    </Shell>
  );
}
