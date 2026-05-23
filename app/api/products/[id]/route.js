import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const payload = await request.json();
  const store = await readStore();
  const index = store.products.findIndex((item) => item.product_id === id);
  if (index === -1) return NextResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });

  store.products[index] = {
    ...store.products[index],
    product_name: payload.product_name,
    price: Number(payload.price),
    quantity: Number(payload.quantity),
    supplier_id: Number(payload.supplier_id)
  };
  await writeStore(store);
  return NextResponse.json(store.products[index]);
}

export async function DELETE(_request, { params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const store = await readStore();
  store.products = store.products.filter((item) => item.product_id !== id);
  store.invoiceDetails = store.invoiceDetails.filter((item) => item.product_id !== id);
  await writeStore(store);
  return NextResponse.json({ ok: true });
}
