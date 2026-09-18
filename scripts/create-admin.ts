// 一次性建立／重設管理員帳號的 CLI 工具。這個專案不做註冊頁，也只允許
// 存在一位管理員，所以帳號建立完全走這支腳本，不透過任何 API。
//
// 用法： npm run create-admin
// （會互動式詢問 email 與密碼，密碼輸入時不會顯示在畫面或留在 shell 記錄中）
//
// 注意：這支腳本用相對路徑 import 專案內的模組，因為它是用
// `node --experimental-strip-types` 直接執行，不會走 tsconfig 的
// "@/*" path alias（那只在 Next.js 的建置流程裡生效）。

import readline from "node:readline";
import { hashPassword } from "../lib/auth.ts";
import { connectToDatabase } from "../lib/mongodb.ts";
import AdminModel from "../models/Admin.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function readLine(promptText: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function readHiddenInput(promptText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      reject(new Error("需要在互動式終端機執行這支腳本，才能安全地輸入密碼。"));
      return;
    }

    process.stdout.write(promptText);
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");

    let input = "";
    const onData = (char: string) => {
      const code = char.charCodeAt(0);

      if (char === "\n" || char === "\r" || code === 4) {
        cleanup();
        process.stdout.write("\n");
        resolve(input);
        return;
      }
      if (code === 3) {
        cleanup();
        process.stdout.write("\n已取消。\n");
        process.exit(1);
      }
      if (code === 127 || code === 8) {
        input = input.slice(0, -1);
        return;
      }
      input += char;
    };

    function cleanup() {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
    }

    stdin.on("data", onData);
  });
}

async function main() {
  const emailInput = await readLine("管理員 email：");
  const email = emailInput.trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    console.error("email 格式不正確。");
    process.exitCode = 1;
    return;
  }

  const password = await readHiddenInput("密碼（至少 " + MIN_PASSWORD_LENGTH + " 碼）：");
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`密碼長度至少需要 ${MIN_PASSWORD_LENGTH} 碼。`);
    process.exitCode = 1;
    return;
  }

  const confirmPassword = await readHiddenInput("再輸入一次密碼：");
  if (password !== confirmPassword) {
    console.error("兩次輸入的密碼不一致。");
    process.exitCode = 1;
    return;
  }

  await connectToDatabase();

  // 這個專案只允許一位管理員：如果已經有一筆（不論 email 是否相同），
  // 就走「更新密碼」而不是再新增一筆，避免意外產生多個管理員帳號。
  const existing = await AdminModel.findOne({});
  if (existing && existing.email !== email) {
    console.error(
      `已存在管理員帳號「${existing.email}」，此專案只允許一位管理員。\n` +
        `請改用相同 email 重新執行這支腳本以重設密碼，或先手動從資料庫刪除舊帳號。`
    );
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);

  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`已重設管理員密碼：${email}`);
  } else {
    await AdminModel.create({ email, passwordHash });
    console.log(`已建立管理員帳號：${email}`);
  }
}

main()
  .catch((err) => {
    console.error("建立管理員帳號失敗：", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
