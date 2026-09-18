import { TokenExpiredError } from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { PARENTING_STYLES, type ParentingStyleCode } from "@/data/questions";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import LeadModel from "@/models/Lead";

// xlsx 的產檔運算跟 jsonwebtoken 的驗證都要在 Node runtime 跑。
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 跟 /api/admin/leads 一樣，後端強制驗證登入憑證——沒有合法 cookie
  // 一律先擋下來，不會走到查資料庫、產生檔案的邏輯。
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

  try {
    await connectToDatabase();

    const leads = await LeadModel.find({})
      .sort({ createdAt: -1 })
      .select("email resultType createdAt")
      .lean();

    const rows = leads.map((lead) => {
      const resultType = lead.resultType as ParentingStyleCode;
      return {
        Email: lead.email,
        風格代號: resultType,
        風格名稱: PARENTING_STYLES[resultType]?.name ?? resultType,
        填答時間: lead.createdAt,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "名單");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const filename = `leads-${new Date().toISOString().slice(0, 10)}.xlsx`;

    // Response 的 BodyInit 型別跟 Node 的 Buffer<ArrayBufferLike> 對不上，
    // 轉成 Uint8Array 就相容了（xlsx 產出的內容本來就是位元組陣列）。
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "產生 Excel 檔案時發生未知錯誤。";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
