"use client";

import {
  BarChart3,
  Boxes,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Edit3,
  LogIn,
  PackagePlus,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  UserRound,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const navItems = [
  { id: "dashboard", label: "Tổng quan", icon: BarChart3 },
  { id: "sales", label: "Bán hàng", icon: ShoppingCart },
  { id: "products", label: "Sản phẩm", icon: Boxes },
  { id: "invoices", label: "Hóa đơn", icon: ReceiptText },
  { id: "customers", label: "Khách hàng", icon: UsersRound },
  { id: "employees", label: "Nhân viên", icon: UserRound },
  { id: "suppliers", label: "Nhà cung cấp", icon: Building2 },
  { id: "reports", label: "Báo cáo", icon: ClipboardList }
];

const entityConfig = {
  customers: {
    title: "Khách hàng",
    endpoint: "/api/entities/customers",
    key: "customer_id",
    columns: [
      ["customer_id", "Mã"],
      ["name", "Tên khách hàng"],
      ["phone", "Số điện thoại"],
      ["points", "Điểm"]
    ],
    form: [
      ["name", "Tên khách hàng"],
      ["phone", "Số điện thoại"]
    ]
  },
  employees: {
    title: "Nhân viên",
    endpoint: "/api/entities/employees",
    key: "employee_id",
    columns: [
      ["employee_id", "Mã"],
      ["name", "Tên nhân viên"],
      ["role", "Chức vụ"]
    ],
    form: [
      ["name", "Tên nhân viên"],
      ["role", "Chức vụ"]
    ]
  },
  suppliers: {
    title: "Nhà cung cấp",
    endpoint: "/api/entities/suppliers",
    key: "supplier_id",
    columns: [
      ["supplier_id", "Mã"],
      ["supplier_name", "Tên nhà cung cấp"],
      ["address", "Địa chỉ"]
    ],
    form: [
      ["supplier_name", "Tên nhà cung cấp"],
      ["address", "Địa chỉ"]
    ]
  }
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
}

async function api(path, options) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Không thể xử lý yêu cầu");
  return data;
}

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat">
      <div className={`statIcon ${accent}`}>
        <Icon size={20} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "admin", password: "admin123" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      onLogin(await api("/api/auth", { method: "POST", body: JSON.stringify(form) }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="loginShell">
      <section className="loginPanel">
        <div className="brandMark">
          <ShieldCheck size={30} />
        </div>
        <h1>Quản lý cửa hàng tiện lợi</h1>
        <p>Đăng nhập để vận hành bán hàng, kho, hóa đơn và báo cáo doanh thu.</p>
        <form onSubmit={submit} className="loginForm">
          <label>
            Tên đăng nhập
            <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primaryButton" type="submit">
            <LogIn size={18} />
            Đăng nhập
          </button>
        </form>
        <div className="demoUsers">
          <span>Demo: admin/admin123</span>
          <span>sales/sales123</span>
          <span>warehouse/warehouse123</span>
        </div>
      </section>
    </main>
  );
}

function Dashboard({ summary }) {
  if (!summary) return <EmptyState text="Đang tải dữ liệu tổng quan" />;

  return (
    <div className="viewStack">
      <div className="statsGrid">
        <Stat icon={CircleDollarSign} label="Doanh thu" value={formatCurrency(summary.totals.revenue)} accent="green" />
        <Stat icon={ReceiptText} label="Hóa đơn" value={summary.totals.invoices} accent="blue" />
        <Stat icon={Boxes} label="Sản phẩm" value={summary.totals.products} accent="yellow" />
        <Stat icon={PackagePlus} label="Sắp hết hàng" value={summary.totals.lowStock} accent="red" />
      </div>

      <div className="splitGrid">
        <section className="panel">
          <div className="panelHead">
            <h2>Doanh thu 30 ngày</h2>
          </div>
          <div className="chartBox">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary.revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#1f9d71" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panelHead">
            <h2>Sản phẩm bán chạy</h2>
          </div>
          <div className="rankList">
            {summary.topProducts.map((product, index) => (
              <div className="rankItem" key={product.product_id}>
                <b>{index + 1}</b>
                <span>{product.product_name}</span>
                <strong>{formatCurrency(product.revenue)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panelHead">
          <h2>Hóa đơn gần đây</h2>
        </div>
        <InvoiceTable invoices={summary.recentInvoices} />
      </section>
    </div>
  );
}

function ProductManager({ products, suppliers, reload }) {
  const blank = { product_name: "", price: "", quantity: "", supplier_id: suppliers[0]?.supplier_id || "" };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = products.filter((item) => item.product_name.toLowerCase().includes(query.toLowerCase()));

  async function submit(event) {
    event.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/products/${editing.product_id}` : "/api/products";
    await api(url, { method, body: JSON.stringify(form) });
    setEditing(null);
    setForm(blank);
    reload();
  }

  async function remove(id) {
    await api(`/api/products/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div className="workGrid">
      <section className="panel">
        <div className="panelHead">
          <h2>Danh sách sản phẩm</h2>
          <div className="searchBox">
            <Search size={16} />
            <input placeholder="Tìm sản phẩm" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Tồn</th>
                <th>Nhà cung cấp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.product_id}>
                  <td>#{product.product_id}</td>
                  <td>{product.product_name}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    <span className={product.quantity <= 20 ? "pill danger" : "pill"}>{product.quantity}</span>
                  </td>
                  <td>{product.supplier?.supplier_name || "Chưa gán"}</td>
                  <td className="rowActions">
                    <button
                      className="iconButton"
                      title="Sửa"
                      onClick={() => {
                        setEditing(product);
                        setForm(product);
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button className="iconButton dangerButton" title="Xóa" onClick={() => remove(product.product_id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel formPanel">
        <h2>{editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</h2>
        <form onSubmit={submit} className="formStack">
          <label>
            Tên sản phẩm
            <input required value={form.product_name} onChange={(event) => setForm({ ...form, product_name: event.target.value })} />
          </label>
          <label>
            Giá bán
            <input required type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          </label>
          <label>
            Số lượng
            <input required type="number" min="0" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
          </label>
          <label>
            Nhà cung cấp
            <select value={form.supplier_id} onChange={(event) => setForm({ ...form, supplier_id: event.target.value })}>
              {suppliers.map((supplier) => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.supplier_name}
                </option>
              ))}
            </select>
          </label>
          <button className="primaryButton" type="submit">
            <Check size={18} />
            Lưu
          </button>
        </form>
      </section>
    </div>
  );
}

function EntityManager({ type, reload }) {
  const cfg = entityConfig[type];
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api(cfg.endpoint).then(setItems);
  }, [cfg.endpoint]);

  const filtered = items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));

  async function submit(event) {
    event.preventDefault();
    const url = editing ? `${cfg.endpoint}/${editing[cfg.key]}` : cfg.endpoint;
    await api(url, { method: editing ? "PUT" : "POST", body: JSON.stringify(form) });
    setForm({});
    setEditing(null);
    const data = await api(cfg.endpoint);
    setItems(data);
    reload();
  }

  async function remove(id) {
    await api(`${cfg.endpoint}/${id}`, { method: "DELETE" });
    const data = await api(cfg.endpoint);
    setItems(data);
    reload();
  }

  return (
    <div className="workGrid">
      <section className="panel">
        <div className="panelHead">
          <h2>{cfg.title}</h2>
          <div className="searchBox">
            <Search size={16} />
            <input placeholder="Tìm nhanh" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                {cfg.columns.map(([, label]) => (
                  <th key={label}>{label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item[cfg.key]}>
                  {cfg.columns.map(([field]) => (
                    <td key={field}>{item[field]}</td>
                  ))}
                  <td className="rowActions">
                    <button
                      className="iconButton"
                      title="Sửa"
                      onClick={() => {
                        setEditing(item);
                        setForm(item);
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button className="iconButton dangerButton" title="Xóa" onClick={() => remove(item[cfg.key])}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel formPanel">
        <h2>{editing ? `Cập nhật ${cfg.title.toLowerCase()}` : `Thêm ${cfg.title.toLowerCase()}`}</h2>
        <form onSubmit={submit} className="formStack">
          {cfg.form.map(([field, label]) => (
            <label key={field}>
              {label}
              <input required value={form[field] || ""} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
            </label>
          ))}
          <button className="primaryButton" type="submit">
            <Check size={18} />
            Lưu
          </button>
        </form>
      </section>
    </div>
  );
}

function Sales({ products, master, reload }) {
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState(master.customers[0]?.customer_id || "");
  const [employeeId, setEmployeeId] = useState(master.employees[0]?.employee_id || "");
  const [message, setMessage] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function add(product) {
    setCart((current) => {
      const existing = current.find((item) => item.product_id === product.product_id);
      if (existing) {
        return current.map((item) =>
          item.product_id === product.product_id ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  async function checkout() {
    setMessage("");
    if (!cart.length) return setMessage("Giỏ hàng đang trống");
    await api("/api/invoices", {
      method: "POST",
      body: JSON.stringify({
        customer_id: customerId,
        employee_id: employeeId,
        items: cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
      })
    });
    setCart([]);
    setMessage("Thanh toán thành công, tồn kho đã được cập nhật");
    reload();
  }

  return (
    <div className="salesGrid">
      <section className="panel">
        <div className="panelHead">
          <h2>Chọn sản phẩm</h2>
        </div>
        <div className="productTiles">
          {products.slice(0, 48).map((product) => (
            <button className="productTile" key={product.product_id} onClick={() => add(product)} disabled={product.quantity <= 0}>
              <span>{product.product_name}</span>
              <strong>{formatCurrency(product.price)}</strong>
              <small>Tồn: {product.quantity}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel checkoutPanel">
        <h2>Giỏ hàng</h2>
        <div className="formRow">
          <label>
            Khách hàng
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
              {master.customers.map((customer) => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhân viên
            <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
              {master.employees.map((employee) => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="cartList">
          {cart.map((item) => (
            <div className="cartItem" key={item.product_id}>
              <div>
                <strong>{item.product_name}</strong>
                <span>{formatCurrency(item.price)}</span>
              </div>
              <input
                type="number"
                min="1"
                max={item.quantity}
                value={item.quantity}
                onChange={(event) =>
                  setCart((current) =>
                    current.map((entry) =>
                      entry.product_id === item.product_id ? { ...entry, quantity: Number(event.target.value) } : entry
                    )
                  )
                }
              />
              <button className="iconButton dangerButton" title="Xóa" onClick={() => setCart(cart.filter((entry) => entry.product_id !== item.product_id))}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="checkoutTotal">
          <span>Tổng tiền</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        {message ? <div className="notice">{message}</div> : null}
        <button className="primaryButton" onClick={checkout}>
          <ReceiptText size={18} />
          Thanh toán
        </button>
      </section>
    </div>
  );
}

function InvoiceTable({ invoices }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Ngày</th>
            <th>Khách hàng</th>
            <th>Nhân viên</th>
            <th>Số món</th>
            <th>Tổng tiền</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.invoice_id}>
              <td>#{invoice.invoice_id}</td>
              <td>{invoice.date}</td>
              <td>{invoice.customer?.name}</td>
              <td>{invoice.employee?.name}</td>
              <td>{invoice.items?.length || 0}</td>
              <td>{formatCurrency(invoice.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Invoices({ invoices }) {
  return (
    <section className="panel">
      <div className="panelHead">
        <h2>Lịch sử hóa đơn</h2>
      </div>
      <InvoiceTable invoices={invoices} />
    </section>
  );
}

function Reports({ summary }) {
  if (!summary) return <EmptyState text="Đang tải báo cáo" />;
  return (
    <div className="viewStack">
      <div className="statsGrid">
        <Stat icon={CircleDollarSign} label="Tổng doanh thu" value={formatCurrency(summary.totals.revenue)} accent="green" />
        <Stat icon={UsersRound} label="Khách hàng" value={summary.totals.customers} accent="blue" />
        <Stat icon={UserRound} label="Nhân viên" value={summary.totals.employees} accent="yellow" />
        <Stat icon={Building2} label="Nhà cung cấp" value={summary.totals.suppliers} accent="red" />
      </div>
      <section className="panel">
        <div className="panelHead">
          <h2>Cảnh báo tồn kho</h2>
        </div>
        <div className="inventoryAlerts">
          {summary.lowStock.length ? (
            summary.lowStock.map((product) => (
              <div className="alertRow" key={product.product_id}>
                <span>{product.product_name}</span>
                <strong>{product.quantity} còn lại</strong>
              </div>
            ))
          ) : (
            <EmptyState text="Không có sản phẩm sắp hết hàng" />
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="emptyState">{text}</div>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [master, setMaster] = useState({ customers: [], employees: [], suppliers: [] });
  const [invoices, setInvoices] = useState([]);

  async function reload() {
    const [summaryData, productData, masterData, invoiceData] = await Promise.all([
      api("/api/summary"),
      api("/api/products"),
      api("/api/master-data"),
      api("/api/invoices")
    ]);
    setSummary(summaryData);
    setProducts(productData);
    setMaster(masterData);
    setInvoices(invoiceData);
  }

  useEffect(() => {
    if (user) reload();
  }, [user]);

  const title = useMemo(() => navItems.find((item) => item.id === active)?.label || "Tổng quan", [active]);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div className="logoBlock">
          <div className="brandMark small">
            <ShoppingCart size={22} />
          </div>
          <div>
            <strong>MiniMart Pro</strong>
            <span>Store Operations</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => setActive(item.id)}>
                <Icon size={18} />
                {item.label}
                <ChevronRight size={15} />
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Hệ thống quản lý cửa hàng tiện lợi</span>
            <h1>{title}</h1>
          </div>
          <div className="userBox">
            <span>{user.employee?.name || user.username}</span>
            <strong>{user.role}</strong>
          </div>
        </header>

        {active === "dashboard" && <Dashboard summary={summary} />}
        {active === "sales" && <Sales products={products} master={master} reload={reload} />}
        {active === "products" && <ProductManager products={products} suppliers={master.suppliers} reload={reload} />}
        {active === "invoices" && <Invoices invoices={invoices} />}
        {active === "customers" && <EntityManager type="customers" reload={reload} />}
        {active === "employees" && <EntityManager type="employees" reload={reload} />}
        {active === "suppliers" && <EntityManager type="suppliers" reload={reload} />}
        {active === "reports" && <Reports summary={summary} />}
      </section>
    </main>
  );
}
