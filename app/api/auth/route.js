import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request) {
  const { username, password } = await request.json();
  const store = await readStore();
  const user = store.users.find((item) => item.username === username && item.password === password);

  if (!user) {
    return NextResponse.json({ message: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
  }

  const employee = store.employees.find((item) => item.employee_id === user.employee_id);
  return NextResponse.json({ id: user.id, username: user.username, role: user.role, employee });
}
