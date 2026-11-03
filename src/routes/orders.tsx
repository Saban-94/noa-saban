import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { WaText } from "@/components/wa-text";
import { STATUSES, type SheetOrder } from "@/lib/noa/engine";
import { useNoa } from "@/lib/noa/store";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

function OrdersPage() {
  const orders = useNoa((s) => s.orders);
  const setOrderStatus = useNoa((s) => s.setOrderStatus);
  const tools = useNoa((s) => s.tools);
  const handoffs = useNoa((s) => s.handoffs);
  const closeHandoff = useNoa((s) => s.closeHandoff);
  const [open, setOpen] = useState<string | null>(orders[0]?.id ?? null);

  const waiting = orders.filter((o) => o.status === "ממתין לאישור ראמי" || o.status === "ממתין לשיבוץ").length;
  const tons = orders.reduce((s, o) => s + (o.status === "בוטל" ? 0 : o.weightTon), 0);

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">גיליון הזמנות</h1>
          <p className="mt-1 text-sm text-muted">מה שנרשם אחרי אישור לקוח, בתוספת שתי הזמנות לדוגמה מהבוקר.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Stat n={orders.length} l="הזמנות" />
          <Stat n={waiting} l="ממתינות" />
          <Stat n={tons.toFixed(1)} l="טון פתוח" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3">
          {orders.length === 0 && <p className="text-muted">אין הזמנות עדיין. אשרו הזמנה במוקד.</p>}
          {orders.map((o) => (
            <article key={o.id} className="rounded-card border border-line bg-surface p-4 shadow-sm">
              <button type="button" className="flex w-full items-start justify-between gap-3 text-start" onClick={() => setOpen(open === o.id ? null : o.id)}>
                <div>
                  <p className="font-display text-lg font-bold">{o.customerName}</p>
                  <p className="text-sm text-muted">
                    {o.id} · {o.address}
                  </p>
                </div>
                <span className="rounded-full bg-moss-soft px-3 py-1 text-xs font-semibold text-moss">{o.status}</span>
              </button>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <Truck className="size-3.5" />
                  {o.unload}
                </span>
                <span>{o.requestedTime}</span>
                <span>{o.weightTon} טון</span>
                <span>{o.lines.length} פריטים</span>
              </div>
              {open === o.id && <OrderBody order={o} onStatus={(st) => setOrderStatus(o.id, st)} />}
            </article>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-line bg-surface p-4 shadow-sm">
            <p className="font-bold">העברות לראמי</p>
            {handoffs.length === 0 && <p className="mt-2 text-sm text-muted">אין פניות פתוחות.</p>}
            <ul className="mt-3 space-y-3">
              {handoffs.map((h) => (
                <li key={h.id} className="rounded-2xl bg-surface-2 p-3 text-sm">
                  <p className="font-semibold">{h.reason}</p>
                  <p className="text-muted">
                    {h.customer} {h.phone && `· ${h.phone}`}
                  </p>
                  <p className="mt-1">{h.summary}</p>
                  {h.open && (
                    <button type="button" onClick={() => closeHandoff(h.id)} className="mt-2 text-xs font-semibold text-brand">
                      סמן כטופל
                    </button>
                  )}
                  {!h.open && <p className="mt-2 text-xs text-moss">טופל</p>}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-line bg-surface p-4 shadow-sm">
            <p className="font-bold">יומן כלים</p>
            <ul className="mt-3 space-y-2 text-xs">
              {tools.length === 0 && <li className="text-muted">עדיין לא הופעל כלי.</li>}
              {tools.map((t) => (
                <li key={t.id} className="flex justify-between gap-2 border-b border-line py-1">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted">{t.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function OrderBody({ order, onStatus }: { order: SheetOrder; onStatus: (s: SheetOrder["status"]) => void }) {
  return (
    <div className="mt-4 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
      <div>
        <p className="text-xs font-semibold text-muted">פריטים ופיקדונות</p>
        <ul className="mt-2 space-y-1 text-sm">
          {order.lines.map((l) => (
            <li key={l.sku + l.name}>
              {l.sku} · {l.name} · {l.qty} {l.unit}
            </li>
          ))}
          {order.deposits.map((d) => (
            <li key={d.sku} className="text-moss">
              {d.sku} · {d.name} · {d.qty} {d.unit}
            </li>
          ))}
        </ul>
        <label className="mt-4 block text-xs font-semibold text-muted">
          עדכון סטטוס מאומת
          <select
            value={order.status}
            onChange={(e) => onStatus(e.target.value as SheetOrder["status"])}
            className="mt-1 w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink"
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="rounded-2xl bg-[#0b141a] p-3 text-xs text-[#e9edef]">
        <p className="mb-2 text-[10px] text-[#8696a0]">הזמנות וסידור סבן</p>
        <WaText text={order.internalCard} />
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string | number; l: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-3 py-2 text-center">
      <p className="font-display text-lg font-bold">{n}</p>
      <p className="text-[11px] text-muted">{l}</p>
    </div>
  );
}
