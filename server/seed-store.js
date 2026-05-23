const fs = require("fs");
const path = require("path");

const root = process.cwd();
const datasetDir = path.join(root, "dataset");
const dataDir = path.join(root, "data");
const storePath = path.join(dataDir, "store.json");

function parseCsv(content) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [rawHeaders, ...records] = rows;
  const headers = rawHeaders.map((header) => header.replace(/^\uFEFF/, "").trim());
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""]))
  );
}

function readCsv(name) {
  return parseCsv(fs.readFileSync(path.join(datasetDir, name), "utf8"));
}

function buildStoreData() {
  const suppliers = readCsv("Supplier.csv").map((item) => ({
    supplier_id: Number(item.supplier_id),
    supplier_name: item.supplier_name,
    address: item.address
  }));

  const products = readCsv("Product.csv").map((item) => ({
    product_id: Number(item.product_id),
    product_name: item.product_name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    supplier_id: Number(item.supplier_id)
  }));

  const customers = readCsv("Customer.csv").map((item) => ({
    customer_id: Number(item.customer_id),
    name: item.name,
    phone: item.phone,
    points: 0
  }));

  const employees = readCsv("Employee.csv").map((item) => ({
    employee_id: Number(item.employee_id),
    name: item.name,
    role: item.role
  }));

  const invoices = readCsv("Invoice.csv").map((item) => ({
    invoice_id: Number(item.invoice_id),
    date: item.date,
    employee_id: Number(item.employee_id),
    customer_id: Number(item.customer_id),
    status: "paid"
  }));

  const invoiceDetails = readCsv("InvoiceDetail.csv").map((item) => ({
    id: Number(item.id),
    invoice_id: Number(item.invoice_id),
    product_id: Number(item.product_id),
    quantity: Number(item.quantity)
  }));

  const users = [
    { id: 1, username: "admin", password: "admin123", role: "Admin", employee_id: 2 },
    { id: 2, username: "sales", password: "sales123", role: "Nhân viên bán hàng", employee_id: 6 },
    { id: 3, username: "warehouse", password: "warehouse123", role: "Nhân viên kho", employee_id: 1 }
  ];

  return { products, customers, employees, suppliers, invoices, invoiceDetails, users };
}

function seedStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const data = buildStoreData();

  fs.writeFileSync(
    storePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

module.exports = { buildStoreData, seedStore, storePath };
