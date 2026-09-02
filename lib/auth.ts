import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "vivazen-luxury-secret-key-2026-super-secure-token";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const TOKEN_COOKIE_NAME = "vivazen_auth_token";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function signToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as "ADMIN" | "MANAGER",
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  try {
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export { TOKEN_COOKIE_NAME };
