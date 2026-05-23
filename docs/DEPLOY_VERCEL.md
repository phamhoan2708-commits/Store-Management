# Deploy Lên Vercel

## 1. Chuẩn bị mã nguồn

Đẩy toàn bộ thư mục dự án lên GitHub/GitLab.

Kiểm tra local trước:

```bash
npm install
npm run seed
npm run build
```

## 2. Tạo project trên Vercel

1. Vào https://vercel.com/new.
2. Import repository.
3. Framework Preset: `Next.js`.
4. Build Command: `npm run build`.
5. Output Directory: để trống.
6. Install Command: `npm install`.

## 3. Database production

Vercel không nên dùng file `data/store.json` cho dữ liệu thật vì serverless filesystem không bền vững. App đã được chuẩn bị để tự chuyển sang PostgreSQL khi có `DATABASE_URL`.

Tạo một database PostgreSQL:

- Cách nhanh: Vercel Dashboard -> Storage -> Create Database -> Postgres.
- Hoặc dùng Neon/Supabase rồi copy `DATABASE_URL`.

Sau khi tạo database, copy connection string vào biến môi trường `DATABASE_URL`.

Seed dữ liệu từ CSV lên PostgreSQL:

```bash
DATABASE_URL="postgres://..." npm run seed:postgres
```

Lệnh này sẽ tự tạo bảng từ `database/schema.sql` và nhập dữ liệu trong `dataset`.

## 4. Biến môi trường

Trong Vercel Project -> Settings -> Environment Variables, thêm:

```text
DATABASE_URL=postgres://...
```

Khi biến này tồn tại, backend trong `lib/store.js` sẽ dùng PostgreSQL thay vì JSON local.

## 5. Deploy

Nhấn `Deploy`. Sau khi build xong, Vercel sẽ cấp URL dạng:

```text
https://ten-project.vercel.app
```

## 6. Kiểm tra sau deploy

- Đăng nhập bằng tài khoản demo.
- Mở `Tổng quan` để kiểm tra thống kê.
- Vào `Bán hàng`, tạo một hóa đơn thử.
- Quay lại `Sản phẩm` để kiểm tra tồn kho đã giảm.
- Vào `Hóa đơn` để kiểm tra hóa đơn mới xuất hiện.

## 7. Khuyến nghị trước khi dùng thật

- Thay mật khẩu demo bằng hash mật khẩu thật trước khi vận hành chính thức.
- Dùng NextAuth/Auth.js hoặc hệ thống session bảo mật.
- Bổ sung phân quyền API theo vai trò.
- Thêm backup database định kỳ.
