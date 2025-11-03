import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Sign access token (short-lived: 15 minutes)
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

// Sign refresh token (long-lived: 7 days)
export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

// Verify access token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error: any) {
    console.error("[Auth] Token verification failed:", error.message);
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
    return decoded;
  } catch (error: any) {
    console.error("[Auth] Refresh token verification failed:", error.message);
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
