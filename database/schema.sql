CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id INTEGER PRIMARY KEY,
  supplier_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS employees (
  employee_id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  product_id INTEGER PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id)
);

CREATE TABLE IF NOT EXISTS invoices (
  invoice_id INTEGER PRIMARY KEY,
  date DATE NOT NULL,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
  status VARCHAR(30) NOT NULL DEFAULT 'paid'
);

CREATE TABLE IF NOT EXISTS invoice_details (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(product_id),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS app_users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(120) NOT NULL,
  employee_id INTEGER REFERENCES employees(employee_id)
);

CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_employee_id ON invoices(employee_id);
CREATE INDEX IF NOT EXISTS idx_invoice_details_invoice_id ON invoice_details(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_details_product_id ON invoice_details(product_id);
