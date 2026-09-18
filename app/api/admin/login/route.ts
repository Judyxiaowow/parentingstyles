import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_TOKEN_TTL_SECONDS, signAdminToken, verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import AdminModel from "@/models/Admin";

// jsonwebtoken/bcryptjs rely on Node's crypto module, so this route must run
// on the Node.js runtime rather than the Edge runtime.
export const runtime = "nodejs";

// A precomputed bcrypt hash with no matching plaintext. Used to keep
// bcrypt.compare's timing the same whether or not the email exists, so a
// response-time difference can't be used to enumerate admin accounts.
const DUMMY_PASSWORD_HASH = "$2b$12$z9QVtWQa3AbwoFkFASssL.LdsN4l9bJKz/xVd4Y3R3TWt.pywm33u";

interface LoginSuccessResponse {
  status: "success";
  data: { email: string };
}

interface LoginErrorResponse {
  status: "error";
  message: string;
}

export async function POST(
  request: Request
): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "請提供有效的 JSON 格式請求內容。" },
      { status: 400 }
    );
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || email.trim() === "" || typeof password !== "string" || password === "") {
    return NextResponse.json(
      { status: "error", message: "email 和 password 皆為必填欄位。" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    await connectToDatabase();
    const admin = await AdminModel.findOne({ email: normalizedEmail });

    const passwordMatches = await verifyPassword(
      password,
      admin?.passwordHash ?? DUMMY_PASSWORD_HASH
    );

    if (!admin || !passwordMatches) {
      return NextResponse.json({ status: "error", message: "email 或密碼錯誤。" }, { status: 401 });
    }

    const token = signAdminToken({ sub: admin._id.toString(), email: admin.email });

    const response = NextResponse.json<LoginSuccessResponse>({
      status: "success",
      data: { email: admin.email },
    });
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_TOKEN_TTL_SECONDS,
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "登入時發生未知錯誤。";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
