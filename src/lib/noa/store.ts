import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  emptyDraft,
  freshSession,
  handleMessage,
  seedDemoOrders,
  type ChatMsg,
  type Persona,
  type Phase,
  type SheetOrder,
  type ToolCall,
  type Draft,
} from "./engine";

export type Handoff = {
  id: string;
  at: string;
  reason: string;
  summary: string;
  customer: string;
  phone: string;
  open: boolean;
};

type NoaState = {
  persona: Persona;
  customerName: string;
  phone: string;
  phase: Phase;
  draft: Draft;
  messages: ChatMsg[];
  pendingClarify?: "block20" | "profile50" | "pack-mortar" | "pack-sand" | "profile-qty";
  profileQtyAsked?: number;
  orders: SheetOrder[];
  tools: ToolCall[];
  handoffs: Handoff[];
  certsPending: { id: string; customer: string; driver: string; amount: string; note: string; signed: boolean }[];
  trucks: { id: string; name: string; kind: string; state: string }[];
  send: (text: string) => void;
  resetChat: () => void;
  setPersona: (p: Persona, name?: string, phone?: string) => void;
  setCustomer: (name: string, phone: string) => void;
  setOrderStatus: (id: string, status: SheetOrder["status"]) => void;
  toggleCert: (id: string) => void;
  setTruck: (id: string, state: string) => void;
  closeHandoff: (id: string) => void;
};

const CERTS = [
  { id: "T-441", customer: "יוסי חדד", driver: "חכמת", amount: "משטח מלט ×2", note: "ממתין לחתימת מנכ\"ל", signed: false },
  { id: "T-438", customer: "קבלני השרון", driver: "עלי", amount: "בלוק 150 יח'", note: "כמויות תואמות", signed: false },
  { id: "T-436", customer: "אחים דהן", driver: "חכמת", amount: "בלה חול ×4", note: "הוחזר לבירור", signed: false },
];

const TRUCKS = [
  { id: "hachmat", name: "חכמת", kind: "מנוף", state: "בדרך להוד השרון" },
  { id: "ali", name: "עלי", kind: "פלטה", state: "בליקוט — יציאה 15:30" },
];

export const useNoa = create<NoaState>()(
  persist(
    (set, get) => ({
      persona: "customer",
      customerName: "",
      phone: "",
      phase: "idle",
      draft: emptyDraft(),
      messages: [],
      orders: seedDemoOrders(),
      tools: [],
      handoffs: [],
      certsPending: CERTS,
      trucks: TRUCKS,
      send: (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const s = get();
        const userMsg: ChatMsg = {
          id: `u-${Date.now()}`,
          role: "customer",
          text: trimmed,
          time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        };
        const result = handleMessage(
          {
            phase: s.phase,
            persona: s.persona,
            draft: s.draft,
            messages: s.messages,
            pendingClarify: s.pendingClarify,
            profileQtyAsked: s.profileQtyAsked,
          },
          trimmed,
          { customerName: s.customerName, phone: s.phone },
        );
        const handoffs = result.handoff
          ? [
              {
                id: `h-${Date.now()}`,
                at: new Date().toISOString(),
                reason: result.handoff.reason,
                summary: result.handoff.summary,
                customer: s.customerName || s.draft.customerName || "לקוח לא מזוהה",
                phone: s.phone || s.draft.phone || "",
                open: true,
              },
              ...s.handoffs,
            ]
          : s.handoffs;
        set({
          phase: result.session.phase,
          draft: result.session.draft,
          pendingClarify: result.session.pendingClarify,
          profileQtyAsked: result.session.profileQtyAsked,
          messages: [...s.messages, userMsg, ...result.replies],
          orders: result.order ? [result.order, ...s.orders] : s.orders,
          tools: result.tool ? [result.tool, ...s.tools].slice(0, 24) : s.tools,
          handoffs,
        });
      },
      resetChat: () => {
        const persona = get().persona;
        const fresh = freshSession(persona);
        set({
          phase: fresh.phase,
          draft: fresh.draft,
          messages: [],
          pendingClarify: undefined,
          profileQtyAsked: undefined,
        });
      },
      setPersona: (p, name, phone) => {
        const fresh = freshSession(p);
        set({
          persona: p,
          customerName: p === "customer" ? name || get().customerName : "",
          phone: p === "customer" ? phone || get().phone : phone || "",
          phase: fresh.phase,
          draft: fresh.draft,
          messages: [],
          pendingClarify: undefined,
          profileQtyAsked: undefined,
        });
      },
      setCustomer: (name, phone) => set({ customerName: name, phone }),
      setOrderStatus: (id, status) =>
        set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)) }),
      toggleCert: (id) =>
        set({
          certsPending: get().certsPending.map((c) => (c.id === id ? { ...c, signed: !c.signed, note: c.signed ? "ממתין לחתימת מנכ\"ל" : "נחתם על ידי המנכ\"ל" } : c)),
        }),
      setTruck: (id, state) => set({ trucks: get().trucks.map((t) => (t.id === id ? { ...t, state } : t)) }),
      closeHandoff: (id) => set({ handoffs: get().handoffs.map((h) => (h.id === id ? { ...h, open: false } : h)) }),
    }),
    {
      name: "noa-saban-desk",
      partialize: (s) => ({
        orders: s.orders,
        handoffs: s.handoffs,
        certsPending: s.certsPending,
        trucks: s.trucks,
        tools: s.tools,
        customerName: s.customerName,
        phone: s.phone,
      }),
    },
  ),
);
