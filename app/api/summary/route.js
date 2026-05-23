import { NextResponse } from "next/server";
import { enrichInvoices, readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const store = await readStore();
  const invoices = enrichInvoices(store);
  const revenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const lowStock = store.products.filter((product) => product.quantity <= 20);

  const revenueByDate = invoices.reduce((acc, invoice) => {
    acc[invoice.date] = (acc[invoice.date] || 0) + invoice.total;
    return acc;
  }, {});

  const topProducts = store.invoiceDetails.reduce((acc, detail) => {
    const product = store.products.find((item) => item.product_id === detail.product_id);
    if (!product) return acc;
    const existing = acc[product.product_id] || {
      product_id: product.product_id,
      product_name: product.product_name,
      quantity: 0,
      revenue: 0
    };
    existing.quantity += detail.quantity;
    existing.revenue += detail.quantity * product.price;
    acc[product.product_id] = existing;
    return acc;
  }, {});

  return NextResponse.json({
    totals: {
      revenue,
      invoices: invoices.length,
      products: store.products.length,
      customers: store.customers.length,
      employees: store.employees.length,
      suppliers: store.suppliers.length,
      lowStock: lowStock.length
    },
    lowStock,
    recentInvoices: invoices.slice(0, 8),
    revenueSeries: Object.entries(revenueByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30),
    topProducts: Object.values(topProducts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  });
}
