import { NextResponse } from "next/server";
import { enrichInvoices, nextId, readStore, writeStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(enrichInvoices(await readStore()));
}

export async function POST(request) {
  const payload = await request.json();
  const store = await readStore();
  const items = payload.items || [];

  for (const item of items) {
    const product = store.products.find((entry) => entry.product_id === Number(item.product_id));
    if (!product) return NextResponse.json({ message: "Sản phẩm không tồn tại" }, { status: 400 });
    if (product.quantity < Number(item.quantity)) {
      return NextResponse.json({ message: `${product.product_name} không đủ tồn kho` }, { status: 400 });
    }
  }

  const invoice = {
    invoice_id: nextId(store.invoices, "invoice_id"),
    date: payload.date || new Date().toISOString().slice(0, 10),
    employee_id: Number(payload.employee_id),
    customer_id: Number(payload.customer_id),
    status: "paid"
  };

  store.invoices.push(invoice);

  items.forEach((item) => {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);
    const product = store.products.find((entry) => entry.product_id === productId);
    product.quantity -= quantity;
    store.invoiceDetails.push({
      id: nextId(store.invoiceDetails, "id"),
      invoice_id: invoice.invoice_id,
      product_id: productId,
      quantity
    });
  });

  const customer = store.customers.find((entry) => entry.customer_id === invoice.customer_id);
  if (customer) {
    const total = items.reduce((sum, item) => {
      const product = store.products.find((entry) => entry.product_id === Number(item.product_id));
      return sum + (product?.price || 0) * Number(item.quantity);
    }, 0);
    customer.points = (customer.points || 0) + Math.floor(total / 10000);
  }

  await writeStore(store);
  return NextResponse.json(enrichInvoices(store).find((item) => item.invoice_id === invoice.invoice_id), { status: 201 });
}
