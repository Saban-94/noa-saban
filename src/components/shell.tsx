import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, ClipboardList, HardHat, LayoutDashboard, MessageCircle, Package } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "מוקד", icon: MessageCircle },
  { to: "/orders", label: "הזמנות", icon: ClipboardList },
  { to: "/catalog", label: "מילון", icon: Package },
  { to: "/desk", label: "הנהלה", icon: LayoutDashboard },
  { to: "/playbook", label: "נהלים", icon: BookOpen },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen text-ink" dir="rtl">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-brand text-surface shadow-sm">
              <HardHat className="size-6" strokeWidth={2.2} />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold tracking-tight">נועה · ח. סבן</span>
              <span className="block text-xs text-muted">חומרי בניין (1994) · התלמיד 6, הוד השרון</span>
            </span>
          </Link>
          <nav className="ms-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = path === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors " +
                    (active ? "bg-brand text-surface" : "text-ink/80 hover:bg-bg-deep")
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={"flex flex-col items-center gap-1 py-2 text-[11px] font-medium " + (active ? "text-brand" : "text-muted")}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
