import { TokenExpiredError } from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import type { ParentingStyleCode } from "@/data/questions";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import LeadModel from "@/models/Lead";

// jsonwebtoken relies on Node's crypto module for verification.
export const runtime = "nodejs";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

interface LeadListItem {
  email: string;
  resultType: ParentingStyleCode;
  createdAt: string;
}

interface LeadsSuccessResponse {
  status: "success";
  data: {
    leads: LeadListItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface LeadsErrorResponse {
  status: "error";
  message: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<LeadsSuccessResponse | LeadsErrorResponse>> {
  // 後端強制驗證登入憑證——不管前端有沒有隱藏這個頁面，沒有合法 cookie
  // 一律先擋在資料庫查詢之前，直接回 401。
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ status: "error", message: "尚未登入。" }, { status: 401 });
  }
  try {
    verifyAdminToken(token);
  } catch (err) {
    const message =
      err instanceof TokenExpiredError ? "登入已過期，請重新登入。" : "登入憑證無效，請重新登入。";
    return NextResponse.json({ status: "error", message }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parsePositiveInt(searchParams.get("page"), 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parsePositiveInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE))
  );

  try {
    await connectToDatabase();

    const [leads, total] = await Promise.all([
      LeadModel.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select("email resultType createdAt")
        .lean(),
      LeadModel.countDocuments({}),
    ]);

    return NextResponse.json({
      status: "success",
      data: {
        leads: leads.map((lead) => ({
          email: lead.email,
          resultType: lead.resultType as ParentingStyleCode,
          createdAt: lead.createdAt.toISOString(),
        })),
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查詢名單時發生未知錯誤。";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
