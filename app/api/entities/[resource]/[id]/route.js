import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

export const runtime = "nodejs";

const config = {
  customers: { key: "customer_id", fields: ["name", "phone"] },
  employees: { key: "employee_id", fields: ["name", "role"] },
  suppliers: { key: "supplier_id", fields: ["supplier_name", "address"] }
};

export async function PUT(request, { params }) {
  const { resource, id: rawId } = await params;
  const cfg = config[resource];
  if (!cfg) return NextResponse.json({ message: "Resource không hợp lệ" }, { status: 404 });
  const id = Number(rawId);
  const payload = await request.json();
  const store = await readStore();
  const index = store[resource].findIndex((item) => item[cfg.key] === id);
  if (index === -1) return NextResponse.json({ message: "Không tìm thấy dữ liệu" }, { status: 404 });
  cfg.fields.forEach((field) => {
    store[resource][index][field] = payload[field];
  });
  await writeStore(store);
  return NextResponse.json(store[resource][index]);
}

export async function DELETE(_request, { params }) {
  const { resource, id: rawId } = await params;
  const cfg = config[resource];
  if (!cfg) return NextResponse.json({ message: "Resource không hợp lệ" }, { status: 404 });
  const store = await readStore();
  const id = Number(rawId);
  store[resource] = store[resource].filter((item) => item[cfg.key] !== id);
  await writeStore(store);
  return NextResponse.json({ ok: true });
}
