import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({
    customers: store.customers,
    employees: store.employees,
    suppliers: store.suppliers
  });
}
