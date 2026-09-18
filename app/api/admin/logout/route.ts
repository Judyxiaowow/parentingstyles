import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";

interface LogoutSuccessResponse {
  status: "success";
}

// 不檢查目前是否有有效 session——不管 cookie 存不存在、過不過期，
// 登出的結果都一樣是「把它清掉」，回應永遠成功。
export async function POST(): Promise<NextResponse<LogoutSuccessResponse>> {
  const response = NextResponse.json<LogoutSuccessResponse>({ status: "success" });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
