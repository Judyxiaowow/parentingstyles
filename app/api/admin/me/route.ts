import { TokenExpiredError } from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

// verifyAdminToken uses Node's crypto module via jsonwebtoken.
export const runtime = "nodejs";

interface MeSuccessResponse {
  status: "success";
  data: { email: string };
}

interface MeErrorResponse {
  status: "error";
  message: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<MeSuccessResponse | MeErrorResponse>> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ status: "error", message: "尚未登入。" }, { status: 401 });
  }

  try {
    const payload = verifyAdminToken(token);
    return NextResponse.json({ status: "success", data: { email: payload.email } });
  } catch (err) {
    const message =
      err instanceof TokenExpiredError ? "登入已過期，請重新登入。" : "登入憑證無效，請重新登入。";
    return NextResponse.json({ status: "error", message }, { status: 401 });
  }
}
