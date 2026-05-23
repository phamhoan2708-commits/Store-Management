# MiniMart Pro - Convenience Store Manager

Ứng dụng web quản lý cửa hàng tiện lợi được dựng từ tài liệu trong `systemdocument` và dữ liệu CSV trong `dataset`.

## Chức năng

- Đăng nhập demo theo vai trò Admin, nhân viên bán hàng, nhân viên kho.
- Dashboard doanh thu, hóa đơn, sản phẩm, cảnh báo tồn kho.
- Quản lý sản phẩm, khách hàng, nhân viên, nhà cung cấp.
- Màn hình bán hàng POS: chọn sản phẩm, lập hóa đơn, tự động trừ tồn kho và cộng điểm khách hàng.
- Quản lý lịch sử hóa đơn và báo cáo doanh thu/tồn kho.
- Backend API bằng Next.js Route Handlers.
- Database local được seed từ CSV vào `data/store.json`.
- Khi deploy, app tự dùng PostgreSQL nếu có biến môi trường `DATABASE_URL`.

## Chạy local

```bash
npm install
npm run seed
npm run dev
```

Mở `http://localhost:3000`.

Tài khoản demo:

- `admin` / `admin123`
- `sales` / `sales123`
- `warehouse` / `warehouse123`

## Build

```bash
npm run build
npm start
```

## Lưu ý database khi deploy

Ứng dụng có adapter kép:

- Local/dev không có `DATABASE_URL`: dùng `data/store.json`.
- Production có `DATABASE_URL`: dùng PostgreSQL.

Khi deploy Vercel, hãy dùng Vercel Postgres, Neon hoặc Supabase. Tạo schema bằng `database/schema.sql`, sau đó seed bằng:

```bash
DATABASE_URL="postgres://..." npm run seed:postgres
```

Chi tiết deploy nằm trong `docs/DEPLOY_VERCEL.md`.
