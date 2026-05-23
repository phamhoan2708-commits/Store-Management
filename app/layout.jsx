import "./globals.css";

export const metadata = {
  title: "Convenience Store Manager",
  description: "Hệ thống quản lý cửa hàng tiện lợi"
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
