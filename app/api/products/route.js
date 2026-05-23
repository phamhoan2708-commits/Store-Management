import { NextResponse } from "next/server";
import { nextId, readStore, writeStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(
    store.products.map((product) => ({
      ...product,
      supplier: store.suppliers.find((supplier) => supplier.supplier_id === product.supplier_id) || null
    }))
  );
}

export async function POST(request) {
  const payload = await request.json();
  const store = await readStore();
  const product = {
    product_id: nextId(store.products, "product_id"),
    product_name: payload.product_name,
    price: Number(payload.price),
    quantity: Number(payload.quantity),
    supplier_id: Number(payload.supplier_id)
  };
  store.products.unshift(product);
  await writeStore(store);
  return NextResponse.json(product, { status: 201 });
}
