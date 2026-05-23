const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { buildStoreData } = require("../server/seed-store");

const schemaPath = path.join(process.cwd(), "database", "schema.sql");

function placeholders(rowCount, columnCount, offset = 0) {
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const row = Array.from({ length: columnCount }, (_, columnIndex) => `$${offset + rowIndex * columnCount + columnIndex + 1}`);
    return `(${row.join(", ")})`;
  }).join(", ");
}

async function bulkInsert(client, table, columns, rows) {
  if (!rows.length) return;
  const values = rows.flatMap((row) => columns.map((column) => row[column]));
  await client.query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders(rows.length, columns.length)}`,
    values
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed PostgreSQL.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  const data = buildStoreData();

  try {
    await client.query("BEGIN");
    await client.query(fs.readFileSync(schemaPath, "utf8"));
    await client.query("DELETE FROM invoice_details");
    await client.query("DELETE FROM invoices");
    await client.query("DELETE FROM products");
    await client.query("DELETE FROM app_users");
    await client.query("DELETE FROM customers");
    await client.query("DELETE FROM employees");
    await client.query("DELETE FROM suppliers");

    await bulkInsert(client, "suppliers", ["supplier_id", "supplier_name", "address"], data.suppliers);
    await bulkInsert(client, "customers", ["customer_id", "name", "phone", "points"], data.customers);
    await bulkInsert(client, "employees", ["employee_id", "name", "role"], data.employees);
    await bulkInsert(client, "products", ["product_id", "product_name", "price", "quantity", "supplier_id"], data.products);
    await bulkInsert(client, "invoices", ["invoice_id", "date", "employee_id", "customer_id", "status"], data.invoices);
    await bulkInsert(client, "invoice_details", ["id", "invoice_id", "product_id", "quantity"], data.invoiceDetails);
    await bulkInsert(
      client,
      "app_users",
      ["id", "username", "password_hash", "role", "employee_id"],
      data.users.map((user) => ({ ...user, password_hash: user.password }))
    );

    await client.query("COMMIT");
    console.log("Seeded PostgreSQL database from dataset CSV files.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
