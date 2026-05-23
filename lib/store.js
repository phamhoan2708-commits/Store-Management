import fs from "fs";
import { unstable_noStore as noStore } from "next/cache";
import { Pool } from "pg";
import { storePath, seedStore } from "@/server/seed-store";

const usePostgres = Boolean(process.env.DATABASE_URL);
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

function ensureStore() {
  if (!fs.existsSync(storePath)) seedStore();
}

function normalizeNumber(value) {
  return Number(value) || 0;
}

async function readPostgresStore() {
  const db = getPool();
  const [products, customers, employees, suppliers, invoices, invoiceDetails, users] = await Promise.all([
    db.query("SELECT product_id, product_name, price, quantity, supplier_id FROM products ORDER BY product_id"),
    db.query("SELECT customer_id, name, phone, points FROM customers ORDER BY customer_id"),
    db.query("SELECT employee_id, name, role FROM employees ORDER BY employee_id"),
    db.query("SELECT supplier_id, supplier_name, address FROM suppliers ORDER BY supplier_id"),
    db.query("SELECT invoice_id, date, employee_id, customer_id, status FROM invoices ORDER BY invoice_id"),
    db.query("SELECT id, invoice_id, product_id, quantity FROM invoice_details ORDER BY id"),
    db.query("SELECT id, username, password_hash AS password, role, employee_id FROM app_users ORDER BY id")
  ]);

  return {
    products: products.rows.map((item) => ({
      ...item,
      product_id: normalizeNumber(item.product_id),
      price: normalizeNumber(item.price),
      quantity: normalizeNumber(item.quantity),
      supplier_id: normalizeNumber(item.supplier_id)
    })),
    customers: customers.rows.map((item) => ({
      ...item,
      customer_id: normalizeNumber(item.customer_id),
      points: normalizeNumber(item.points)
    })),
    employees: employees.rows.map((item) => ({ ...item, employee_id: normalizeNumber(item.employee_id) })),
    suppliers: suppliers.rows.map((item) => ({ ...item, supplier_id: normalizeNumber(item.supplier_id) })),
    invoices: invoices.rows.map((item) => ({
      ...item,
      invoice_id: normalizeNumber(item.invoice_id),
      date: item.date instanceof Date ? item.date.toISOString().slice(0, 10) : item.date,
      employee_id: normalizeNumber(item.employee_id),
      customer_id: normalizeNumber(item.customer_id)
    })),
    invoiceDetails: invoiceDetails.rows.map((item) => ({
      ...item,
      id: normalizeNumber(item.id),
      invoice_id: normalizeNumber(item.invoice_id),
      product_id: normalizeNumber(item.product_id),
      quantity: normalizeNumber(item.quantity)
    })),
    users: users.rows.map((item) => ({
      ...item,
      id: normalizeNumber(item.id),
      employee_id: normalizeNumber(item.employee_id)
    }))
  };
}

async function insertMany(client, table, columns, rows) {
  if (!rows.length) return;
  const placeholders = rows
    .map((_, rowIndex) => `(${columns.map((__, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(", ")})`)
    .join(", ");
  const values = rows.flatMap((row) => columns.map((column) => row[column]));
  await client.query(`INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders}`, values);
}

async function writePostgresStore(data) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM invoice_details");
    await client.query("DELETE FROM invoices");
    await client.query("DELETE FROM products");
    await client.query("DELETE FROM app_users");
    await client.query("DELETE FROM customers");
    await client.query("DELETE FROM employees");
    await client.query("DELETE FROM suppliers");

    await insertMany(client, "suppliers", ["supplier_id", "supplier_name", "address"], data.suppliers);
    await insertMany(client, "customers", ["customer_id", "name", "phone", "points"], data.customers);
    await insertMany(client, "employees", ["employee_id", "name", "role"], data.employees);
    await insertMany(client, "products", ["product_id", "product_name", "price", "quantity", "supplier_id"], data.products);
    await insertMany(client, "invoices", ["invoice_id", "date", "employee_id", "customer_id", "status"], data.invoices);
    await insertMany(client, "invoice_details", ["id", "invoice_id", "product_id", "quantity"], data.invoiceDetails);
    await insertMany(
      client,
      "app_users",
      ["id", "username", "password_hash", "role", "employee_id"],
      data.users.map((user) => ({ ...user, password_hash: user.password }))
    );
    await client.query("COMMIT");
    return data;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function readStore() {
  noStore();
  if (usePostgres) return readPostgresStore();
  ensureStore();
  return JSON.parse(fs.readFileSync(storePath, "utf8"));
}

export async function writeStore(data) {
  if (usePostgres) return writePostgresStore(data);
  ensureStore();
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf8");
  return data;
}

export function nextId(items, key) {
  return Math.max(0, ...items.map((item) => Number(item[key]) || 0)) + 1;
}

export function invoiceTotal(invoice, store) {
  return store.invoiceDetails
    .filter((detail) => detail.invoice_id === invoice.invoice_id)
    .reduce((sum, detail) => {
      const product = store.products.find((item) => item.product_id === detail.product_id);
      return sum + (product?.price || 0) * detail.quantity;
    }, 0);
}

export function enrichInvoices(store) {
  return store.invoices
    .map((invoice) => ({
      ...invoice,
      customer: store.customers.find((item) => item.customer_id === invoice.customer_id) || null,
      employee: store.employees.find((item) => item.employee_id === invoice.employee_id) || null,
      total: invoiceTotal(invoice, store),
      items: store.invoiceDetails
        .filter((detail) => detail.invoice_id === invoice.invoice_id)
        .map((detail) => {
          const product = store.products.find((item) => item.product_id === detail.product_id);
          return { ...detail, product, lineTotal: (product?.price || 0) * detail.quantity };
        })
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date) || b.invoice_id - a.invoice_id);
}
