import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export const ADMIN_COOKIE_NAME = "admin_token";
export const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 天

export interface AdminTokenPayload {
  sub: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable in .env.local");
  }
  return secret;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ADMIN_TOKEN_TTL_SECONDS });
}

/** Throws jsonwebtoken's TokenExpiredError / JsonWebTokenError on an invalid or expired token. */
export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AdminTokenPayload;
}
