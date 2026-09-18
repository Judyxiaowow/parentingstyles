"use client";

import { useEffect, useEffectEvent, useState, type FormEvent } from "react";
import { PARENTING_STYLES, type ParentingStyleCode } from "@/data/questions";

type AuthState = "checking" | "unauthenticated" | "authenticated";

interface LeadListItem {
  email: string;
  resultType: ParentingStyleCode;
  createdAt: string;
}

interface LeadsData {
  leads: LeadListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ApiSuccessBody<T> {
  status: "success";
  data: T;
}

interface ApiErrorBody {
  status: "error";
  message: string;
}

type LeadsFetchOutcome =
  | { kind: "loading" }
  | { kind: "success"; data: LeadsData }
  | { kind: "unauthorized" }
  | { kind: "error"; message: string };

// 這個頁面本身的 if/else 只決定「要不要顯示」表格，真正擋資料的是
// GET /api/admin/leads 在後端驗證 cookie——就算跳過這個頁面直接打
// API，沒有合法憑證一樣拿不到資料。這裡的登入判斷只是使用體驗用的。
export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [leadsData, setLeadsData] = useState<LeadsData | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState("");

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  // useEffectEvent：把「拿到結果後要做的事」（setState）跟「怎麼發請求」
  // 分開，這樣 Effect 本體不會直接呼叫 setState，符合 react-hooks 的
  // set-state-in-effect 規則，同時避免把 handler 放進 dependency array。
  const onAuthChecked = useEffectEvent((authenticated: boolean, email: string | null) => {
    if (authenticated && email) {
      setAdminEmail(email);
      setAuthState("authenticated");
    } else {
      setAuthState("unauthenticated");
    }
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/admin/me");
        const json = (await res.json()) as ApiSuccessBody<{ email: string }> | ApiErrorBody;
        if (cancelled) return;
        if (res.ok && json.status === "success") {
          onAuthChecked(true, json.data.email);
        } else {
          onAuthChecked(false, null);
        }
      } catch {
        if (!cancelled) onAuthChecked(false, null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onLeadsFetchOutcome = useEffectEvent((outcome: LeadsFetchOutcome) => {
    switch (outcome.kind) {
      case "loading":
        setLeadsLoading(true);
        setLeadsError("");
        break;
      case "success":
        setLeadsData(outcome.data);
        setLeadsLoading(false);
        break;
      case "unauthorized":
        setAuthState("unauthenticated");
        setLeadsData(null);
        setLeadsLoading(false);
        break;
      case "error":
        setLeadsError(outcome.message);
        setLeadsLoading(false);
        break;
    }
  });

  useEffect(() => {
    if (authState !== "authenticated") return;

    let cancelled = false;

    (async () => {
      onLeadsFetchOutcome({ kind: "loading" });
      try {
        const res = await fetch(`/api/admin/leads?page=${page}`);
        const json = (await res.json()) as ApiSuccessBody<LeadsData> | ApiErrorBody;
        if (cancelled) return;

        if (res.status === 401) {
          onLeadsFetchOutcome({ kind: "unauthorized" });
          return;
        }
        if (!res.ok || json.status !== "success") {
          throw new Error(json.status === "error" ? json.message : "讀取名單失敗，請稍後再試。");
        }
        onLeadsFetchOutcome({ kind: "success", data: json.data });
      } catch (err) {
        if (!cancelled) {
          onLeadsFetchOutcome({
            kind: "error",
            message: err instanceof Error ? err.message : "讀取名單失敗，請稍後再試。",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authState, page]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setLoginSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const json = (await res.json()) as ApiSuccessBody<{ email: string }> | ApiErrorBody;
      if (!res.ok || json.status !== "success") {
        throw new Error(json.status === "error" ? json.message : "登入失敗，請稍後再試。");
      }
      setAdminEmail(json.data.email);
      setAuthState("authenticated");
      setLoginPassword("");
      setPage(1);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "登入失敗，請稍後再試。");
    } finally {
      setLoginSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setAdminEmail(null);
      setAuthState("unauthenticated");
      setLeadsData(null);
      setLoginEmail("");
      setLoginPassword("");
    }
  }

  async function handleExport() {
    setExportError("");
    setExporting(true);
    try {
      const res = await fetch("/api/admin/leads/export");
      if (!res.ok) {
        let message = "下載 Excel 失敗，請稍後再試。";
        try {
          const json = (await res.json()) as ApiErrorBody;
          if (json.status === "error") message = json.message;
        } catch {
          // 回應不是 JSON（理論上只有成功時才會是檔案），就用預設訊息。
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] ?? `leads-${new Date().toISOString().slice(0, 10)}.xlsx`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "下載 Excel 失敗，請稍後再試。");
    } finally {
      setExporting(false);
    }
  }

  if (authState === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-stone-50">
        <p className="text-sm text-stone-400">檢查登入狀態中…</p>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-stone-800">後台登入</h1>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600">
                Email
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600">
                密碼
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {loginSubmitting ? "登入中…" : "登入"}
            </button>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-stone-800">測驗名單</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-stone-500">{adminEmail}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-stone-600 transition-colors hover:bg-stone-100"
            >
              登出
            </button>
          </div>
        </div>

        {leadsLoading && <p className="mt-6 text-sm text-stone-400">載入中…</p>}
        {leadsError && <p className="mt-6 text-sm text-red-600">{leadsError}</p>}

        {leadsData && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
              <p className="text-sm text-stone-500">共 {leadsData.total} 筆資料</p>
              <div>
                <button
                  onClick={handleExport}
                  disabled={exporting || leadsData.total === 0}
                  className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {exporting ? "下載中…" : "下載 Excel"}
                </button>
              </div>
            </div>
            {exportError && <p className="px-5 pt-3 text-sm text-red-600">{exportError}</p>}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs tracking-wide text-stone-400 uppercase">
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">風格代號</th>
                    <th className="px-5 py-3 font-medium">填答時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {leadsData.leads.map((lead) => (
                    <tr key={`${lead.email}-${lead.createdAt}`} className="hover:bg-stone-50">
                      <td className="px-5 py-3 text-stone-700">{lead.email}</td>
                      <td className="px-5 py-3 text-stone-700">
                        {lead.resultType}
                        <span className="ml-1 text-stone-400">
                          （{PARENTING_STYLES[lead.resultType]?.name ?? "未知"}）
                        </span>
                      </td>
                      <td className="px-5 py-3 text-stone-500">
                        {new Date(lead.createdAt).toLocaleString("zh-TW")}
                      </td>
                    </tr>
                  ))}
                  {leadsData.leads.length === 0 && (
                    <tr>
                      <td className="px-5 py-6 text-center text-stone-400" colSpan={3}>
                        目前沒有資料。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-4 border-t border-stone-200 px-5 py-4 text-sm">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={leadsData.page <= 1}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                上一頁
              </button>
              <span className="text-stone-500">
                第 {leadsData.page} / {leadsData.totalPages} 頁
              </span>
              <button
                onClick={() => setPage((current) => Math.min(leadsData.totalPages, current + 1))}
                disabled={leadsData.page >= leadsData.totalPages}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
