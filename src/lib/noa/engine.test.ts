import assert from "node:assert/strict";
import test from "node:test";
import { computeDeposits, freshSession, handleMessage, type Session } from "./engine.ts";

function say(session: Session, text: string, ctx: { customerName?: string; phone?: string } = {}) {
  const res = handleMessage(session, text, ctx);
  return res;
}

test("greeting without materials sends opening card and menu", () => {
  const res = say(freshSession(), "שלום");
  assert.equal(res.session.phase, "menu");
  assert.ok(res.replies[0]?.image?.includes("Designer-1"));
  assert.match(res.replies[0]!.text, /1️⃣/);
  assert.match(res.replies[0]!.text, /2️⃣/);
});

test("greeting that already names materials skips the menu", () => {
  const res = say(freshSession(), "בוקר טוב צריך 30 מלט");
  assert.equal(res.session.phase, "collect");
  assert.equal(res.replies[0]?.image, undefined);
  assert.equal(res.session.draft.lines[0]?.sku, "10002");
  assert.equal(res.session.draft.lines[0]?.qty, 30);
  assert.match(res.replies[0]!.text, /כתובת/);
});

test("menu 2 hands off to Rami without asking for materials", () => {
  let s = say(freshSession(), "היי").session;
  const res = say(s, "2");
  assert.equal(res.session.phase, "handoff");
  assert.match(res.replies[0]!.text, /הועברה ישירות לראמי/);
  assert.equal(res.tool?.name, "handoff_to_human");
});

test("price question from a customer is a handoff", () => {
  const res = say(freshSession(), "כמה עולה המלט?");
  assert.equal(res.session.phase, "handoff");
  assert.match(res.replies[0]!.text, /ראמי/);
});

test("Harel gets a price answer and no customer menu", () => {
  const res = say({ ...freshSession("harel"), phase: "exec" }, "מה מחיר המלט?");
  assert.equal(res.handoff, undefined);
  assert.doesNotMatch(res.replies[0]!.text, /1️⃣/);
  assert.match(res.replies[0]!.text, /הראל/);
  assert.match(res.replies[0]!.text, /10002/);
});

test("block 20 with 2 holes asks one clarification", () => {
  let s = say(freshSession(), "1").session;
  const res = say(s, "10 בלוק 20 2 חורים");
  assert.match(res.replies[0]!.text, /4 חורים/);
  const yes = say(res.session, "כן מתאים");
  assert.equal(yes.session.draft.lines.find((l) => l.sku === "12204")?.qty, 10);
});

test("profiles only in bundles of 10", () => {
  const res = say(freshSession(), "צריך 15 ניצבים");
  assert.match(res.replies[0]!.text, /חבילות של 10/);
  assert.equal(res.session.draft.lines.length, 0);
  const ok = say(res.session, "2");
  const line = ok.session.draft.lines.find((l) => l.sku === "9550300");
  assert.equal(line?.qty, 20);
});

test("deposits: big bags 1:1, cement per 40, blocks per 75", () => {
  const deps = computeDeposits([
    { sku: "11501", name: "חול שק גדול", qty: 3, unit: "שק גד" },
    { sku: "10002", name: "מלט", qty: 80, unit: "שק" },
    { sku: "12204", name: "בלוק", qty: 100, unit: "יח'" },
  ]);
  assert.equal(deps.find((d) => d.sku === "60002")?.qty, 3);
  assert.equal(deps.find((d) => d.sku === "60060")?.qty, 2);
  assert.equal(deps.find((d) => d.sku === "60006")?.qty, 1);
});

test("crane in Ra'anana adds service line and summary hides prices", () => {
  let session = freshSession();
  const steps = [
    "30 מלט ו-2 בלה חול",
    "רחוב הנגר 4 רעננה",
    "איש קשר דני",
    "צריך מנוף",
    "מחר בבוקר",
    "שמי משה לוי",
  ];
  let last = say(session, steps[0]!);
  for (const step of steps.slice(1)) last = say(last.session, step);
  assert.equal(last.session.phase, "await-confirm");
  assert.ok(last.session.draft.lines.some((l) => l.sku === "18055"));
  assert.ok(last.session.draft.deposits.some((d) => d.sku === "60002"));
  assert.ok(last.session.draft.deposits.some((d) => d.sku === "60060") === false);
  assert.match(last.replies[0]!.text, /סיכום ההזמנה/);
  assert.doesNotMatch(last.replies[0]!.text, /₪|מחיר|הנחה/);
  const booked = say(last.session, "מאשר");
  assert.equal(booked.session.phase, "recorded");
  assert.equal(booked.tool?.name, "inject_order_to_sheet");
  assert.ok(booked.order);
  assert.ok(booked.replies[0]?.image?.includes("Designer.png"));
});

test("haresh branch is closed to the public", () => {
  const res = say(freshSession(), "הסניף בחרש פתוח?");
  assert.match(res.replies[0]!.text, /סגור/);
  assert.match(res.replies[0]!.text, /התלמיד/);
});
