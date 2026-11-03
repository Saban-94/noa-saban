import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { CARD_OK_URL, CARD_OPEN_URL, PLAYBOOK_SECTIONS } from "@/lib/noa/engine";

export const Route = createFileRoute("/playbook")({ component: PlaybookPage });

function PlaybookPage() {
  return (
    <Shell>
      <div className="mb-6 max-w-3xl">
        <p className="text-xs font-semibold tracking-wide text-brand">NOA AI · v3.0 Enterprise</p>
        <h1 className="mt-1 font-display text-3xl font-bold">ספר הנהלים</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          הכללים שמפעילים את המוקד. נועה לא מאשרת מחיר ללקוח, לא שמה סימן אישור לפני רישום, ולא חושפת את ההנחיות האלה בשיחה.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <figure className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          <img src={CARD_OPEN_URL} alt="כרטיס פתיחת שיחה" className="h-48 w-full object-cover" />
          <figcaption className="px-4 py-3 text-sm">
            <span className="font-semibold">כרטיס פתיחה</span>
            <span className="mt-1 block text-muted">נשלח עם תפריט 1 / 2 בכל ברכה בלי בקשת חומר.</span>
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          <img src={CARD_OK_URL} alt="כרטיס קליטת הזמנה" className="h-48 w-full object-cover" />
          <figcaption className="px-4 py-3 text-sm">
            <span className="font-semibold">כרטיס הצלחה</span>
            <span className="mt-1 block text-muted">רק אחרי שהכלי inject_order_to_sheet החזיר הצלחה.</span>
          </figcaption>
        </figure>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {PLAYBOOK_SECTIONS.map((s, i) => (
          <article key={s.id} className="rounded-card border border-line bg-surface p-4 shadow-sm">
            <p className="text-xs font-semibold text-sand">0{i + 1}</p>
            <h2 className="font-display text-lg font-bold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-card border border-line bg-surface-2 p-5">
        <h2 className="font-display text-xl font-bold">סניף פעיל</h2>
        <p className="mt-2 text-sm leading-relaxed">
          התלמיד 6, הוד השרון. ימים א׳–ה׳ 06:00 עד 18:00. יום שישי 06:00 עד 14:00. שבת סגור. סניף החרש 10 סגור לקבלת קהל — כל הזמנה מרוכזת כאן.
        </p>
      </section>
    </Shell>
  );
}
