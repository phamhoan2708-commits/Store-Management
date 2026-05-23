import { NextResponse } from "next/server";
import { nextId, readStore, writeStore } from "@/lib/store";

export const runtime = "nodejs";

const config = {
  customers: { key: "customer_id", fields: ["name", "phone"] },
  employees: { key: "employee_id", fields: ["name", "role"] },
  suppliers: { key: "supplier_id", fields: ["supplier_name", "address"] }
};

export async function GET(_request, { params }) {
  const { resource } = await params;
  const cfg = config[resource];
  if (!cfg) return NextResponse.json({ message: "Resource không hợp lệ" }, { status: 404 });
  const store = await readStore();
  return NextResponse.json(store[resource]);
}

export async function POST(request, { params }) {
  const { resource } = await params;
  const cfg = config[resource];
  if (!cfg) return NextResponse.json({ message: "Resource không hợp lệ" }, { status: 404 });
  const payload = await request.json();
  const store = await readStore();
  const item = { [cfg.key]: nextId(store[resource], cfg.key) };
  cfg.fields.forEach((field) => {
    item[field] = payload[field];
  });
  if (resource === "customers") item.points = 0;
  store[resource].unshift(item);
  await writeStore(store);
  return NextResponse.json(item, { status: 201 });
}
